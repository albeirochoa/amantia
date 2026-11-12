// API del motor de reservas. Rutas bajo /api/reservas y /api/wompi (ver ADR-004).
import { BOOKING, EXTRAS, runtime } from './config.js';
import { addDays, diffDays, fail, isDate, json, nightsBetween, nowIso, randomCode, todayCO } from './util.js';
import {
  applyTransaction,
  bookableCabins,
  bumpPaymentAttempt,
  countActiveHoldsByIp,
  createHold,
  freeCabins,
  getBooking,
  occupiedNights,
  releaseExpiredHolds,
} from './store.js';
import { checkoutUrl, fetchTransaction, paymentReference, verifyEvent } from './wompi.js';
import { handleAdmin } from './admin.js';
import { notifyBooking } from './mail.js';

const deposit = (total) => Math.round((total * BOOKING.depositPercent) / 100);

/** Aplica la transacción y avisa al dueño si la reserva acaba de confirmarse o quedó en conflicto. */
async function applyAndNotify(env, url, ctx, tx, source) {
  const before = await getBooking(env.DB, String(tx.reference || '').replace(/-\d+$/, ''));
  const after = await applyTransaction(env.DB, tx, source);
  if (after && before && before.status !== after.status && ['confirmed', 'conflict'].includes(after.status)) {
    const task = notifyBooking(env, after, env.SITE_ORIGIN || url.origin);
    if (ctx?.waitUntil) ctx.waitUntil(task);
    else await task;
  }
  return after;
}

export async function handleApi(request, env, url, ctx) {
  const rt = runtime(env);
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method;

  if (!env.DB) return fail(503, 'no_db', 'Base de datos no configurada');

  // Panel de administración (funciona aunque el motor esté apagado).
  if (path.startsWith('/api/admin/')) return handleAdmin(request, env, url);

  // El webhook de Wompi se acepta aunque el motor esté apagado (pagos en curso).
  if (path === '/api/wompi/eventos' && method === 'POST') return wompiEvent(request, env, url, ctx);

  if (!rt.enabled) return fail(503, 'disabled', 'Las reservas en línea todavía no están abiertas');

  try {
    if (path === '/api/reservas/calendario' && method === 'GET') return calendar(env, rt, url);
    if (path === '/api/reservas/disponibilidad' && method === 'GET') return availability(env, rt, url);
    if (path === '/api/reservas' && method === 'POST') return createBooking(request, env, rt, url);
    if (path === '/api/reservas/evento' && method === 'POST') return logEvent(request, env);

    const m = path.match(/^\/api\/reservas\/(AMT-[A-Z0-9]{6})(\/reintentar|\/simular-pago)?$/);
    if (m) {
      const [, ref, action] = m;
      if (!action && method === 'GET') return bookingStatus(env, rt, url, ref, ctx);
      if (action === '/reintentar' && method === 'POST') return retryPayment(request, env, rt, url, ref);
      if (action === '/simular-pago' && method === 'POST') return simulatePayment(request, env, rt, url, ref, ctx);
    }
    return fail(404, 'not_found', 'Ruta no encontrada');
  } catch (err) {
    console.error('booking api error', err);
    return fail(500, 'server_error', 'Algo falló de nuestro lado. Intenta de nuevo en un momento.');
  }
}

/** Ventana reservable: desde mañana (o la apertura) hasta maxAdvanceDays. */
function window_(rt) {
  const tomorrow = addDays(todayCO(), 1);
  const earliest = rt.opensOn && rt.opensOn > tomorrow ? rt.opensOn : tomorrow;
  return { earliest, latest: addDays(todayCO(), BOOKING.maxAdvanceDays) };
}

const humanDate = (d) =>
  new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`));

function validateStay(rt, checkIn, checkOut) {
  if (!isDate(checkIn) || !isDate(checkOut)) return 'Fechas inválidas';
  const { earliest, latest } = window_(rt);
  if (checkIn < earliest) return `La primera llegada posible es el ${humanDate(earliest)}`;
  if (checkOut > latest) return 'Esas fechas todavía no están abiertas';
  const nights = diffDays(checkIn, checkOut);
  if (nights < BOOKING.minNights) return `La estadía mínima es de ${BOOKING.minNights} noche(s)`;
  if (nights > BOOKING.maxNights) return `La estadía máxima es de ${BOOKING.maxNights} noches`;
  return null;
}

const modeOf = (rt) => (rt.provider === 'simulated' ? 'simulated' : rt.wompiEnv);

// GET /api/reservas/calendario?desde=&hasta= → noches sin ninguna cabaña libre.
async function calendar(env, rt, url) {
  await releaseExpiredHolds(env.DB);
  const { earliest, latest } = window_(rt);
  let from = url.searchParams.get('desde');
  let to = url.searchParams.get('hasta');
  if (!isDate(from) || from < earliest) from = earliest;
  if (!isDate(to) || to > latest || diffDays(from, to) > 120) to = addDays(from, 120);

  const cabins = await bookableCabins(env.DB);
  const occupied = await occupiedNights(env.DB, from, to);
  const fullNights = cabins.length
    ? [...occupied.entries()].filter(([, set]) => cabins.every((c) => set.has(c.id))).map(([n]) => n).sort()
    : [];
  return json({
    mode: modeOf(rt),
    earliest,
    latest,
    minNights: BOOKING.minNights,
    maxNights: BOOKING.maxNights,
    guests: BOOKING.guests,
    depositPercent: BOOKING.depositPercent,
    holdMinutes: BOOKING.holdMinutes,
    extras: EXTRAS,
    bookableCabins: cabins.length,
    fullNights,
  });
}

// GET /api/reservas/disponibilidad?llegada=&salida=
async function availability(env, rt, url) {
  const checkIn = url.searchParams.get('llegada');
  const checkOut = url.searchParams.get('salida');
  const invalid = validateStay(rt, checkIn, checkOut);
  if (invalid) return fail(400, 'invalid_dates', invalid);

  await releaseExpiredHolds(env.DB);
  const nights = diffDays(checkIn, checkOut);
  const cabins = await bookableCabins(env.DB);
  const w = BOOKING.alternativesWindowDays;
  const occupied = await occupiedNights(env.DB, addDays(checkIn, -w), addDays(checkOut, w));

  const quote = (c) => {
    const total = c.nightly_rate_cop * nights;
    return { id: c.id, name: c.name, nightlyRate: c.nightly_rate_cop, total, deposit: deposit(total) };
  };
  const free = freeCabins(cabins, occupied, checkIn, checkOut).map(quote);

  // Sin disponibilidad: fechas cercanas con la misma cantidad de noches.
  const alternatives = [];
  if (!free.length && cabins.length) {
    const { earliest, latest } = window_(rt);
    for (let i = 1; i <= w && alternatives.length < 3; i++) {
      for (const shift of [-i, i]) {
        const ci = addDays(checkIn, shift);
        const co = addDays(checkOut, shift);
        if (ci < earliest || co > latest || alternatives.length >= 3) continue;
        const options = freeCabins(cabins, occupied, ci, co);
        if (options.length) {
          alternatives.push({ llegada: ci, salida: co, fromTotal: Math.min(...options.map((c) => c.nightly_rate_cop)) * nights });
        }
      }
    }
    alternatives.sort((a, b) => (a.llegada < b.llegada ? -1 : 1));
  }

  return json({ checkIn, checkOut, nights, guests: BOOKING.guests, depositPercent: BOOKING.depositPercent, cabins: free, alternatives });
}

// POST /api/reservas/evento → evento anónimo del embudo (sin IP ni datos personales).
const EVENT_TYPES = ['visit', 'search', 'select', 'begin_payment'];
const label = (v, max = 60) => {
  const t = String(v ?? '').toLowerCase().replace(/[^a-z0-9._\- ]/g, '').trim().slice(0, max);
  return t || null;
};
async function logEvent(request, env) {
  const b = await request.json().catch(() => null);
  if (!b || !EVENT_TYPES.includes(b.tipo) || !/^[\w-]{8,64}$/.test(String(b.sid ?? ''))) return new Response(null, { status: 204 });
  const checkIn = isDate(b.llegada) ? b.llegada : null;
  const nights = Number.isInteger(b.noches) && b.noches > 0 && b.noches <= 30 ? b.noches : null;
  const results = Number.isInteger(b.resultados) && b.resultados >= 0 && b.resultados <= 10 ? b.resultados : null;
  await env.DB.prepare(
    `INSERT INTO events (created_at, type, sid, source, medium, check_in, nights, cabin_id, results) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
  ).bind(nowIso(), b.tipo, b.sid, label(b.fuente), label(b.medio), checkIn, nights, label(b.cabana, 30), results).run();
  return new Response(null, { status: 204 });
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const clean = (v, max) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

// POST /api/reservas → crea la retención y devuelve a dónde ir a pagar.
async function createBooking(request, env, rt, url) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'bad_json', 'Solicitud inválida');
  }
  const checkIn = body.llegada;
  const checkOut = body.salida;
  const invalid = validateStay(rt, checkIn, checkOut);
  if (invalid) return fail(400, 'invalid_dates', invalid);

  const firstName = clean(body.nombre, 80);
  const lastName = clean(body.apellido, 80);
  const email = clean(body.email, 254).toLowerCase();
  const phone = String(body.telefono ?? '').replace(/[^\d+]/g, '').slice(0, 20);
  const errors = {};
  if (!firstName) errors.nombre = 'Escribe tu nombre';
  if (!lastName) errors.apellido = 'Escribe tu apellido';
  if (!EMAIL_RE.test(email)) errors.email = 'Revisa el correo';
  if (phone.replace(/\D/g, '').length < 7) errors.telefono = 'Revisa el número de WhatsApp';
  if (body.aceptaCondiciones !== true) errors.aceptaCondiciones = 'Es necesario aceptar las condiciones';
  if (Object.keys(errors).length) return json({ error: { code: 'invalid_fields', message: 'Revisa los datos', fields: errors } }, 400);

  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  await releaseExpiredHolds(env.DB);
  if ((await countActiveHoldsByIp(env.DB, ip)) >= BOOKING.maxActiveHoldsPerIp) {
    return fail(429, 'too_many_holds', 'Ya tienes reservas en proceso de pago. Termínalas o espera unos minutos.');
  }

  const cabin = (await bookableCabins(env.DB)).find((c) => c.id === body.cabana);
  if (!cabin) return fail(400, 'invalid_cabin', 'Esa cabaña no está disponible para reservar');

  const extraIds = Array.isArray(body.extras) ? [...new Set(body.extras)] : [];
  const extras = extraIds.map((id) => EXTRAS.find((e) => e.id === id));
  if (extras.some((e) => !e)) return fail(400, 'invalid_extra', 'Uno de los extras no existe');
  const extrasCop = extras.reduce((sum, e) => sum + e.priceCop, 0);

  const nights = nightsBetween(checkIn, checkOut).length;
  const total = cabin.nightly_rate_cop * nights + extrasCop;
  const booking = {
    ref: `AMT-${randomCode(6)}`,
    token: randomCode(24),
    cabinId: cabin.id,
    checkIn,
    checkOut,
    nights,
    firstName,
    lastName,
    email,
    phone,
    nightlyRate: cabin.nightly_rate_cop,
    total,
    deposit: deposit(total),
    extras: extras.map(({ id, name, priceCop }) => ({ id, name, priceCop })),
    extrasCop,
    source: label(body.fuente),
    medium: label(body.medio),
    holdExpiresAt: new Date(Date.now() + BOOKING.holdMinutes * 60_000).toISOString(),
    ip,
  };
  const ok = await createHold(env.DB, booking);
  if (!ok) return fail(409, 'taken', 'Alguien acaba de tomar esas fechas en esta cabaña. Elige otra opción.');

  const payment = await paymentStep(env, rt, url, await getBooking(env.DB, booking.ref));
  return json({ ref: booking.ref, token: booking.token, holdExpiresAt: booking.holdExpiresAt, payment }, 201);
}

/** Destino de pago: Web Checkout de Wompi o el simulador local. */
async function paymentStep(env, rt, url, b) {
  // SITE_ORIGIN permite probar Wompi sandbox en local (wrangler dev reescribe el host al dominio de la ruta).
  const origin = env.SITE_ORIGIN || url.origin;
  const confirmUrl = new URL(`/reservas/confirmacion/?ref=${b.ref}&t=${b.token}`, origin).toString();
  if (rt.provider === 'simulated') {
    return { provider: 'simulated', url: `/reservas/pago-simulado/?ref=${b.ref}&t=${b.token}` };
  }
  // Wompi exige que la expiración sea futura; se usa la de la retención.
  const wompiUrl = await checkoutUrl(env, {
    reference: paymentReference(b.ref, b.payment_attempts),
    amountCop: b.deposit_cop,
    expiresAt: b.hold_expires_at,
    redirectUrl: confirmUrl,
    email: b.email,
    fullName: `${b.first_name} ${b.last_name}`,
  });
  return { provider: 'wompi', url: wompiUrl };
}

async function authorized(env, url, ref, token) {
  const b = await getBooking(env.DB, ref);
  if (!b || !token || b.token !== token) return null;
  return b;
}

/** Vista pública de la reserva (sin datos personales salvo el nombre). */
function publicView(b) {
  return {
    ref: b.ref,
    status: b.status,
    paymentStatus: b.payment_status,
    cabin: { id: b.cabin_id, name: b.cabin_name },
    checkIn: b.check_in,
    checkOut: b.check_out,
    nights: b.nights,
    guests: b.guests,
    firstName: b.first_name,
    lodging: b.total_cop - b.extras_cop,
    extras: JSON.parse(b.extras || '[]'),
    extrasTotal: b.extras_cop,
    total: b.total_cop,
    deposit: b.deposit_cop,
    balance: b.total_cop - b.deposit_cop,
    holdExpiresAt: b.hold_expires_at,
  };
}

// GET /api/reservas/:ref?t=&tx= → estado. Si llega tx (vuelta de Wompi), concilia con la API de Wompi.
async function bookingStatus(env, rt, url, ref, ctx) {
  await releaseExpiredHolds(env.DB);
  let b = await authorized(env, url, ref, url.searchParams.get('t'));
  if (!b) return fail(404, 'not_found', 'No encontramos esa reserva');

  const txId = url.searchParams.get('tx');
  if (txId && rt.provider === 'wompi' && b.status !== 'confirmed') {
    const tx = await fetchTransaction(rt.wompiEnv, txId);
    if (tx && String(tx.reference).startsWith(`${ref}-`)) {
      b = (await applyAndNotify(env, url, ctx, tx, 'redirect')) ?? b;
    }
  }
  return json(publicView(b));
}

// POST /api/reservas/:ref/reintentar {t} → nuevo intento de pago si la retención sigue vigente.
async function retryPayment(request, env, rt, url, ref) {
  const { t } = await request.json().catch(() => ({}));
  await releaseExpiredHolds(env.DB);
  const b = await authorized(env, url, ref, t);
  if (!b) return fail(404, 'not_found', 'No encontramos esa reserva');
  if (b.status !== 'hold') return fail(409, 'not_on_hold', 'La reserva ya no está separada');
  if (b.payment_status === 'PENDING') return fail(409, 'pending', 'Hay un pago en verificación. Espera unos minutos.');
  await bumpPaymentAttempt(env.DB, ref);
  return json({ payment: await paymentStep(env, rt, url, await getBooking(env.DB, ref)) });
}

// POST /api/reservas/:ref/simular-pago {t, resultado} → SOLO desarrollo local.
async function simulatePayment(request, env, rt, url, ref, ctx) {
  if (rt.provider !== 'simulated') return fail(404, 'not_found', 'Ruta no encontrada');
  const { t, resultado } = await request.json().catch(() => ({}));
  const b = await getBooking(env.DB, ref);
  if (!b || b.token !== t) return fail(404, 'not_found', 'No encontramos esa reserva');
  const status = ['APPROVED', 'DECLINED', 'PENDING', 'ERROR'].includes(resultado) ? resultado : 'APPROVED';
  const tx = {
    id: `sim-${randomCode(8)}`,
    status,
    reference: paymentReference(ref, b.payment_attempts),
    amount_in_cents: b.deposit_cop * 100,
    currency: 'COP',
  };
  const updated = await applyAndNotify(env, url, ctx, tx, 'simulated');
  return json(publicView(updated));
}

// POST /api/wompi/eventos → webhook de Wompi (configurar la URL en el panel de Wompi).
async function wompiEvent(request, env, url, ctx) {
  let event;
  try {
    event = await request.json();
  } catch {
    return fail(400, 'bad_json', 'invalid');
  }
  if (!(await verifyEvent(env, event))) return fail(401, 'bad_signature', 'invalid signature');
  if (event.event === 'transaction.updated' && event.data?.transaction) {
    await applyAndNotify(env, url, ctx, event.data.transaction, 'webhook');
  }
  // Wompi reintenta si no recibe 200.
  return json({ ok: true, at: nowIso() });
}
