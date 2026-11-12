// Acceso a D1 y máquina de estados de la reserva.
//   hold ──pago APPROVED──▶ confirmed
//   hold ──vence sin pago──▶ expired (libera las noches)
//   expired + pago APPROVED tardío ──noches libres──▶ confirmed
//                                  └─noches tomadas──▶ conflict (reembolso manual)
import { BOOKING } from './config.js';
import { nightsBetween, nowIso } from './util.js';
import { bookingRefFromPayment } from './wompi.js';

/** Libera las retenciones vencidas. Se llama antes de leer o escribir disponibilidad. */
export async function releaseExpiredHolds(db) {
  const now = nowIso();
  await db.batch([
    db.prepare(
      `DELETE FROM booking_nights WHERE booking_ref IN
         (SELECT ref FROM bookings WHERE status = 'hold' AND hold_expires_at < ?1)`,
    ).bind(now),
    db.prepare(`UPDATE bookings SET status = 'expired', updated_at = ?1 WHERE status = 'hold' AND hold_expires_at < ?1`).bind(now),
  ]);
}

/** Cabañas activas y con tarifa (sin tarifa no se pueden reservar). */
export async function bookableCabins(db) {
  const { results } = await db
    .prepare(`SELECT id, name, nightly_rate_cop FROM cabins WHERE active = 1 AND nightly_rate_cop IS NOT NULL ORDER BY sort`)
    .all();
  return results;
}

/** Noches ocupadas en [from, to) agrupadas por noche: Map<night, Set<cabinId>>. */
export async function occupiedNights(db, from, to) {
  const { results } = await db
    .prepare(`SELECT cabin_id, night FROM booking_nights WHERE night >= ?1 AND night < ?2`)
    .bind(from, to)
    .all();
  const map = new Map();
  for (const r of results) {
    if (!map.has(r.night)) map.set(r.night, new Set());
    map.get(r.night).add(r.cabin_id);
  }
  return map;
}

/** Cabañas libres todas las noches de la estadía. */
export function freeCabins(cabins, occupied, checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  return cabins.filter((c) => nights.every((n) => !occupied.get(n)?.has(c.id)));
}

export async function countActiveHoldsByIp(db, ip) {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM bookings WHERE client_ip = ?1 AND status = 'hold'`)
    .bind(ip)
    .first();
  return row?.n ?? 0;
}

/**
 * Crea la reserva retenida y ocupa sus noches en una sola transacción.
 * Si otra persona tomó alguna noche, la PRIMARY KEY de booking_nights falla y no se guarda nada.
 * Devuelve false si hubo choque de disponibilidad.
 */
export async function createHold(db, b) {
  const now = nowIso();
  const insertBooking = db
    .prepare(
      `INSERT INTO bookings (ref, token, cabin_id, check_in, check_out, nights, guests, first_name, last_name,
         email, phone, nightly_rate_cop, total_cop, deposit_cop, status, hold_expires_at, client_ip,
         terms_accepted_at, created_at, updated_at, extras, extras_cop, source, medium)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, 'hold', ?15, ?16, ?17, ?17, ?17, ?18, ?19, ?20, ?21)`,
    )
    .bind(
      b.ref, b.token, b.cabinId, b.checkIn, b.checkOut, b.nights, BOOKING.guests, b.firstName, b.lastName,
      b.email, b.phone, b.nightlyRate, b.total, b.deposit, b.holdExpiresAt, b.ip, now,
      JSON.stringify(b.extras), b.extrasCop, b.source ?? null, b.medium ?? null,
    );
  try {
    await db.batch([insertBooking, ...nightInserts(db, b.cabinId, b.checkIn, b.checkOut, b.ref)]);
    return true;
  } catch (err) {
    if (String(err).includes('UNIQUE')) return false;
    throw err;
  }
}

function nightInserts(db, cabinId, checkIn, checkOut, ref) {
  return nightsBetween(checkIn, checkOut).map((night) =>
    db.prepare(`INSERT INTO booking_nights (cabin_id, night, booking_ref, source) VALUES (?1, ?2, ?3, 'booking')`).bind(cabinId, night, ref),
  );
}

export async function getBooking(db, ref) {
  return db
    .prepare(
      `SELECT b.*, c.name AS cabin_name FROM bookings b JOIN cabins c ON c.id = b.cabin_id WHERE b.ref = ?1`,
    )
    .bind(ref)
    .first();
}

export async function bumpPaymentAttempt(db, ref) {
  await db.prepare(`UPDATE bookings SET payment_attempts = payment_attempts + 1, updated_at = ?2 WHERE ref = ?1`).bind(ref, nowIso()).run();
}

/**
 * Aplica una transacción de Wompi (o simulada) a la reserva. Idempotente.
 * `tx` = { id, status, reference, amount_in_cents, currency }.
 * Devuelve la reserva actualizada, o null si la transacción no corresponde a ninguna.
 */
export async function applyTransaction(db, tx, source) {
  const ref = bookingRefFromPayment(tx.reference);
  const now = nowIso();
  await db
    .prepare(
      `INSERT INTO payment_events (booking_ref, reference, tx_id, status, amount_in_cents, source, received_at, raw)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
    )
    .bind(ref, tx.reference ?? null, tx.id ?? null, tx.status ?? null, tx.amount_in_cents ?? null, source, now, JSON.stringify(tx))
    .run();

  const booking = await getBooking(db, ref);
  if (!booking) return null;
  // Ya confirmada: nada que hacer (los webhooks pueden repetirse).
  if (booking.status === 'confirmed' || booking.status === 'cancelled' || booking.status === 'conflict') return booking;
  // El monto y la moneda deben coincidir con el anticipo; si no, se registra y se ignora.
  if (tx.currency !== 'COP' || Number(tx.amount_in_cents) !== booking.deposit_cop * 100) return booking;

  const setPayment = (status, extra = '') =>
    db
      .prepare(`UPDATE bookings SET payment_status = ?2, payment_tx_id = ?3, updated_at = ?4 ${extra} WHERE ref = ?1`)
      .bind(ref, tx.status, tx.id, now, ...(status ? [status] : []));

  if (tx.status === 'APPROVED') {
    const stillHeld = booking.status === 'hold';
    if (!stillHeld) {
      // Pago tardío: intentar recuperar las noches. Si alguien más las tomó, queda en conflicto.
      try {
        await db.batch(nightInserts(db, booking.cabin_id, booking.check_in, booking.check_out, ref));
      } catch (err) {
        if (!String(err).includes('UNIQUE')) throw err;
        await setPayment('conflict', `, status = ?5`).run();
        return getBooking(db, ref);
      }
    }
    await setPayment('confirmed', `, status = ?5`).run();
    return getBooking(db, ref);
  }

  if (tx.status === 'PENDING' && booking.status === 'hold') {
    // Pagos que tardan (PSE, Nequi): extender la retención para no liberar la cabaña a mitad del pago.
    const ext = new Date(Date.now() + 20 * 60_000).toISOString();
    await db
      .prepare(
        `UPDATE bookings SET payment_status = ?2, payment_tx_id = ?3, updated_at = ?4,
           hold_expires_at = MAX(hold_expires_at, ?5) WHERE ref = ?1`,
      )
      .bind(ref, tx.status, tx.id, now, ext)
      .run();
    return getBooking(db, ref);
  }

  // DECLINED, VOIDED, ERROR: la retención sigue vigente y se puede reintentar.
  await setPayment(null).run();
  return getBooking(db, ref);
}
