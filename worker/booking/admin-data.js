// Consultas de solo lectura del panel: inicio, calendario, reservas, detalle y analítica.
import { releaseExpiredHolds } from './store.js';
import { addDays, diffDays, fail, isDate, json, todayCO } from './util.js';

const COLS = `b.ref, b.status, b.cabin_id, c.name AS cabin_name, b.check_in, b.check_out, b.nights,
  b.first_name, b.last_name, b.email, b.phone, b.total_cop, b.deposit_cop, b.extras, b.extras_cop,
  b.payment_status, b.payment_attempts, b.balance_paid_at, b.cancelled_at, b.hold_expires_at, b.created_at,
  b.source, b.medium, b.internal_note`;
const FROM = `FROM bookings b JOIN cabins c ON c.id = b.cabin_id`;

export const view = (b) => ({
  ref: b.ref,
  status: b.status,
  cabin: { id: b.cabin_id, name: b.cabin_name },
  checkIn: b.check_in,
  checkOut: b.check_out,
  nights: b.nights,
  name: `${b.first_name} ${b.last_name}`,
  email: b.email,
  phone: b.phone,
  total: b.total_cop,
  paid: b.deposit_cop,
  balance: b.total_cop - b.deposit_cop,
  lodging: b.total_cop - b.extras_cop,
  extrasTotal: b.extras_cop,
  extras: JSON.parse(b.extras || '[]'),
  paymentStatus: b.payment_status,
  attempts: b.payment_attempts,
  balancePaidAt: b.balance_paid_at,
  cancelledAt: b.cancelled_at,
  holdExpiresAt: b.hold_expires_at,
  createdAt: b.created_at,
  source: b.source,
  medium: b.medium,
  note: b.internal_note,
});

const all = (db, sql, ...args) => db.prepare(sql).bind(...args).all().then((r) => r.results);
const one = (db, sql, ...args) => db.prepare(sql).bind(...args).first();
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);

/** Ocupación (noches vendidas / noches disponibles) en [from, to). Los bloqueos no cuentan como disponibles. */
async function occupancy(db, from, to, cabinCount) {
  const days = diffDays(from, to);
  const [sold, blocked] = await Promise.all([
    one(db, `SELECT COUNT(*) n FROM booking_nights n JOIN bookings b ON b.ref = n.booking_ref
             WHERE b.status = 'confirmed' AND n.night >= ?1 AND n.night < ?2`, from, to),
    one(db, `SELECT COUNT(*) n FROM booking_nights WHERE booking_ref IS NULL AND night >= ?1 AND night < ?2`, from, to),
  ]);
  const available = Math.max(0, cabinCount * days - blocked.n);
  return { sold: sold.n, blocked: blocked.n, available, pct: pct(sold.n, available) };
}

// ── Inicio ───────────────────────────────────────────────────────────────────
export async function inicio(env) {
  const db = env.DB;
  await releaseExpiredHolds(db);
  const today = todayCO();
  const month = `${today.slice(0, 8)}01`;
  const since14 = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const cabins = (await one(db, `SELECT COUNT(*) n FROM cabins WHERE active = 1`)).n;
  // Mismo tramo del mes anterior (del día 1 al día de hoy), para comparar justo.
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  const prevStart = `${m === 1 ? y - 1 : y}-${String(m === 1 ? 12 : m - 1).padStart(2, '0')}-01`;
  const prevEndRaw = addDays(prevStart, Number(today.slice(8, 10)));
  const prevEnd = prevEndRaw < month ? prevEndRaw : month;

  const [arrivals, departures, inhouse, next, recover, holds, conflicts, owed, sales, salesPrev, occ7, occ30] = await Promise.all([
    all(db, `SELECT ${COLS} ${FROM} WHERE b.status = 'confirmed' AND b.check_in = ?1 ORDER BY c.sort`, today),
    all(db, `SELECT ${COLS} ${FROM} WHERE b.status = 'confirmed' AND b.check_out = ?1 ORDER BY c.sort`, today),
    all(db, `SELECT ${COLS} ${FROM} WHERE b.status = 'confirmed' AND b.check_in <= ?1 AND b.check_out > ?1 ORDER BY c.sort`, today),
    all(db, `SELECT ${COLS} ${FROM} WHERE b.status = 'confirmed' AND b.check_in > ?1 ORDER BY b.check_in, c.sort LIMIT 6`, today),
    all(db, `SELECT ${COLS} ${FROM} WHERE b.status = 'expired' AND b.created_at >= ?1 ORDER BY b.created_at DESC LIMIT 8`, since14),
    one(db, `SELECT COUNT(*) n FROM bookings WHERE status = 'hold'`),
    one(db, `SELECT COUNT(*) n FROM bookings WHERE status = 'conflict'`),
    one(db, `SELECT COALESCE(SUM(total_cop - deposit_cop), 0) amount, COUNT(*) n FROM bookings
             WHERE status = 'confirmed' AND balance_paid_at IS NULL AND check_out >= ?1`, today),
    one(db, `SELECT COALESCE(SUM(total_cop), 0) amount, COUNT(*) n FROM bookings WHERE status = 'confirmed' AND created_at >= ?1`, month),
    one(db, `SELECT COALESCE(SUM(total_cop), 0) amount, COUNT(*) n FROM bookings WHERE status = 'confirmed' AND created_at >= ?1 AND created_at < ?2`, prevStart, prevEnd),
    occupancy(db, today, addDays(today, 7), cabins),
    occupancy(db, today, addDays(today, 30), cabins),
  ]);

  return json({
    today,
    arrivals: arrivals.map(view),
    departures: departures.map(view),
    inhouse: inhouse.map(view),
    next: next.map(view),
    recover: recover.map(view),
    holds: holds.n,
    conflicts: conflicts.n,
    owed,
    sales,
    salesPrev,
    occ7,
    occ30,
  });
}

// ── Calendario ───────────────────────────────────────────────────────────────
export async function calendario(env, url) {
  const db = env.DB;
  await releaseExpiredHolds(db);
  const today = todayCO();
  const from = isDate(url.searchParams.get('desde')) ? url.searchParams.get('desde') : today;
  const days = Math.min(60, Math.max(7, Number(url.searchParams.get('dias')) || 14));
  const to = addDays(from, days);
  const [cabins, bookings, blocks] = await Promise.all([
    all(db, `SELECT id, name FROM cabins WHERE active = 1 ORDER BY sort`),
    all(db, `SELECT ${COLS} ${FROM} WHERE b.status IN ('confirmed', 'hold') AND b.check_in < ?2 AND b.check_out > ?1
             ORDER BY b.check_in`, from, to),
    all(db, `SELECT cabin_id, night, note FROM booking_nights WHERE booking_ref IS NULL AND night >= ?1 AND night < ?2`, from, to),
  ]);
  return json({ today, from, to, days, cabins, bookings: bookings.map(view), blocks });
}

// ── Lista de reservas ────────────────────────────────────────────────────────
export async function lista(env, url) {
  const db = env.DB;
  await releaseExpiredHolds(db);
  const p = url.searchParams;
  const today = todayCO();
  const where = [];
  const args = [];
  const add = (sql, ...a) => {
    where.push(sql.replace(/\?/g, () => `?${args.push(a.shift()) }`));
  };

  const estado = p.get('estado');
  if (['confirmed', 'hold', 'expired', 'cancelled', 'conflict'].includes(estado)) add('b.status = ?', estado);
  if (p.get('cabana')) add('b.cabin_id = ?', p.get('cabana'));
  const cuando = p.get('cuando');
  if (cuando === 'proximas') add('b.check_out >= ?', today);
  if (cuando === 'pasadas') add('b.check_out < ?', today);
  const q = String(p.get('q') || '').trim().slice(0, 60);
  if (q) {
    const like = `%${q.replace(/[%_]/g, '')}%`;
    const digits = q.replace(/\D/g, '');
    const clauses = ['b.ref LIKE ?', "(b.first_name || ' ' || b.last_name) LIKE ?", 'b.email LIKE ?'];
    const vals = [like, like, like];
    if (digits.length >= 4) {
      clauses.push('b.phone LIKE ?');
      vals.push(`%${digits}%`);
    }
    where.push(`(${clauses.map((c) => c.replace('?', () => `?${args.push(vals.shift())}`)).join(' OR ')})`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order = cuando === 'proximas' ? 'b.check_in ASC' : 'b.check_in DESC';
  const limit = 40;
  const offset = Math.max(0, Number(p.get('pagina')) || 0) * limit;
  const [rows, total, cabins] = await Promise.all([
    all(db, `SELECT ${COLS} ${FROM} ${clause} ORDER BY ${order}, b.created_at DESC LIMIT ${limit} OFFSET ${offset}`, ...args),
    one(db, `SELECT COUNT(*) n ${FROM} ${clause}`, ...args),
    all(db, `SELECT id, name FROM cabins WHERE active = 1 ORDER BY sort`),
  ]);
  return json({ items: rows.map(view), total: total.n, pageSize: limit, cabins });
}

// ── Detalle de una reserva ───────────────────────────────────────────────────
export async function detalle(env, ref) {
  const b = await one(env.DB, `SELECT ${COLS} ${FROM} WHERE b.ref = ?1`, ref);
  if (!b) return fail(404, 'not_found', 'No existe esa reserva');
  const payments = await all(
    env.DB,
    `SELECT tx_id, status, amount_in_cents, source, received_at FROM payment_events WHERE booking_ref = ?1 ORDER BY id`,
    ref,
  );
  return json({
    booking: view(b),
    payments: payments.map((e) => ({ txId: e.tx_id, status: e.status, amount: Math.round((e.amount_in_cents || 0) / 100), source: e.source, at: e.received_at })),
  });
}

// ── Analítica ────────────────────────────────────────────────────────────────
export async function analitica(env, url) {
  const db = env.DB;
  const today = todayCO();
  const dias = [30, 90, 365].includes(Number(url.searchParams.get('dias'))) ? Number(url.searchParams.get('dias')) : 30;
  const since = new Date(Date.now() - dias * 86_400_000).toISOString();
  const ahead = addDays(today, dias);

  const since2 = new Date(Date.now() - 2 * dias * 86_400_000).toISOString();
  const [bookings, prevBookings, statuses, funnel, visitSources, demand, unmet, cabins] = await Promise.all([
    all(db, `SELECT ref, nights, total_cop, extras_cop, extras, check_in, created_at, source FROM bookings
             WHERE status = 'confirmed' AND created_at >= ?1 LIMIT 5000`, since),
    all(db, `SELECT ref, nights, total_cop, extras_cop, extras, check_in, created_at FROM bookings
             WHERE status = 'confirmed' AND created_at >= ?1 AND created_at < ?2 LIMIT 5000`, since2, since),
    all(db, `SELECT status, COUNT(*) n FROM bookings WHERE created_at >= ?1 GROUP BY status`, since),
    all(db, `SELECT type, COUNT(DISTINCT sid) n FROM events WHERE created_at >= ?1 GROUP BY type`, since),
    all(db, `SELECT COALESCE(source, 'directo') source, COUNT(DISTINCT sid) n FROM events
             WHERE type = 'visit' AND created_at >= ?1 GROUP BY 1 ORDER BY n DESC LIMIT 8`, since),
    all(db, `SELECT check_in, COUNT(*) searches, SUM(CASE WHEN results = 0 THEN 1 ELSE 0 END) none FROM events
             WHERE type = 'search' AND check_in IS NOT NULL AND created_at >= ?1 GROUP BY check_in ORDER BY searches DESC, check_in LIMIT 6`, since),
    all(db, `SELECT check_in, COUNT(*) n FROM events WHERE type = 'search' AND results = 0 AND check_in IS NOT NULL AND created_at >= ?1
             GROUP BY check_in ORDER BY n DESC, check_in LIMIT 5`, since),
    all(db, `SELECT id, name FROM cabins WHERE active = 1 ORDER BY sort`),
  ]);

  // Ocupación hacia adelante, por cabaña.
  const [soldRows, blockedRows] = await Promise.all([
    all(db, `SELECT n.cabin_id, COUNT(*) n FROM booking_nights n JOIN bookings b ON b.ref = n.booking_ref
             WHERE b.status = 'confirmed' AND n.night >= ?1 AND n.night < ?2 GROUP BY n.cabin_id`, today, ahead),
    all(db, `SELECT cabin_id, COUNT(*) n FROM booking_nights WHERE booking_ref IS NULL AND night >= ?1 AND night < ?2 GROUP BY cabin_id`, today, ahead),
  ]);
  const occByCabin = cabins.map((c) => {
    const sold = soldRows.find((r) => r.cabin_id === c.id)?.n ?? 0;
    const blocked = blockedRows.find((r) => r.cabin_id === c.id)?.n ?? 0;
    const available = Math.max(0, dias - blocked);
    return { id: c.id, name: c.name, sold, available, pct: pct(sold, available) };
  });

  // Negocio (reservas confirmadas creadas en el período) y el mismo cálculo del período anterior.
  const kpisOf = (list) => {
    const count = list.length;
    const nights = list.reduce((t, b) => t + b.nights, 0);
    const lodging = list.reduce((t, b) => t + (b.total_cop - b.extras_cop), 0);
    const lead = list.reduce((t, b) => t + Math.max(0, diffDays(b.created_at.slice(0, 10), b.check_in)), 0);
    const withExtras = list.filter((b) => JSON.parse(b.extras || '[]').length).length;
    return {
      bookings: count,
      sales: list.reduce((t, b) => t + b.total_cop, 0),
      adr: nights ? Math.round(lodging / nights) : 0,
      avgStay: count ? Math.round((nights / count) * 10) / 10 : 0,
      avgLead: count ? Math.round(lead / count) : 0,
      withExtrasPct: pct(withExtras, count),
    };
  };
  const kpis = kpisOf(bookings);
  const prev = kpisOf(prevBookings);
  // Serie para la línea de tendencia: diaria (30 días), semanal (90) o mensual (365).
  const buckets = dias === 30 ? 30 : dias === 90 ? 13 : 12;
  const bucketMs = (dias * 86_400_000) / buckets;
  const sinceMs = Date.parse(since);
  const series = Array.from({ length: buckets }, () => ({ sales: 0, bookings: 0 }));
  for (const b of bookings) {
    const i = Math.min(buckets - 1, Math.max(0, Math.floor((Date.parse(b.created_at) - sinceMs) / bucketMs)));
    series[i].sales += b.total_cop;
    series[i].bookings++;
  }
  const count = bookings.length;
  const weekdays = [0, 0, 0, 0, 0, 0, 0]; // lunes … domingo (según la noche de llegada)
  const extras = {};
  const bySource = {};
  for (const b of bookings) {
    weekdays[(new Date(`${b.check_in}T00:00:00Z`).getUTCDay() + 6) % 7]++;
    const list = JSON.parse(b.extras || '[]');
    for (const e of list) {
      extras[e.id] ??= { id: e.id, name: e.name, count: 0, revenue: 0 };
      extras[e.id].count++;
      extras[e.id].revenue += e.priceCop;
    }
    const s = b.source || 'directo';
    bySource[s] ??= { source: s, bookings: 0, sales: 0 };
    bySource[s].bookings++;
    bySource[s].sales += b.total_cop;
  }
  const visitsBySource = Object.fromEntries(visitSources.map((r) => [r.source, r.n]));
  const sourceNames = new Set([...Object.keys(visitsBySource), ...Object.keys(bySource)]);
  const sources = [...sourceNames]
    .map((s) => ({ source: s, visits: visitsBySource[s] ?? 0, bookings: bySource[s]?.bookings ?? 0, sales: bySource[s]?.sales ?? 0 }))
    .sort((a, b) => b.visits + b.bookings * 10 - (a.visits + a.bookings * 10))
    .slice(0, 8);
  const f = Object.fromEntries(funnel.map((r) => [r.type, r.n]));

  return json({
    dias,
    kpis,
    prev,
    series,
    outcomes: Object.fromEntries(statuses.map((r) => [r.status, r.n])),
    funnel: [
      { key: 'visit', label: 'Visitaron la reserva', n: f.visit ?? 0 },
      { key: 'search', label: 'Buscaron fechas', n: f.search ?? 0 },
      { key: 'select', label: 'Eligieron una cabaña', n: f.select ?? 0 },
      { key: 'begin_payment', label: 'Pasaron al pago', n: f.begin_payment ?? 0 },
      { key: 'confirmed', label: 'Reservas confirmadas', n: count },
    ],
    occupancy: occByCabin,
    weekdays,
    extras: Object.values(extras).sort((a, b) => b.count - a.count),
    sources,
    demand: demand.map((r) => ({ date: r.check_in, searches: r.searches, none: r.none })),
    unmet: unmet.map((r) => ({ date: r.check_in, n: r.n })),
  });
}
