// API del panel de administración (MVP). Todas las rutas bajo /api/admin/.
import { adminEmails, clearCookie, currentAdmin, sessionCookie, sign, verify } from './auth.js';
import { sendLoginLink } from './mail.js';
import { analitica, calendario, detalle, inicio, lista } from './admin-data.js';
import { addDays, diffDays, fail, isDate, json, nightsBetween, nowIso, randomCode, todayCO } from './util.js';

const LINK_MINUTES = 15;

export async function handleAdmin(request, env, url) {
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method;

  // Protección CSRF: toda escritura debe venir del mismo origen y en JSON.
  if (method !== 'GET') {
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return fail(403, 'bad_origin', 'Origen no permitido');
    if (!String(request.headers.get('Content-Type')).includes('application/json')) return fail(415, 'json_only', 'Solo JSON');
  }

  if (path === '/api/admin/login' && method === 'POST') return requestLink(request, env, url);
  if (path === '/api/admin/verificar' && method === 'POST') return verifyLink(request, env);
  if (path === '/api/admin/salir' && method === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });

  const admin = await currentAdmin(request, env);
  if (!admin) return fail(401, 'no_session', 'Inicia sesión');

  try {
    if (method === 'GET') {
      if (path === '/api/admin/sesion') return json({ admin, open: env.ADMIN_OPEN === 'true' });
      if (path === '/api/admin/inicio') return inicio(env);
      if (path === '/api/admin/calendario') return calendario(env, url);
      if (path === '/api/admin/reservas') return lista(env, url);
      if (path === '/api/admin/analitica') return analitica(env, url);
      const d = path.match(/^\/api\/admin\/reservas\/(AMT-[A-Z0-9]{6})$/);
      if (d) return detalle(env, d[1]);
    }
    const m = path.match(/^\/api\/admin\/reservas\/(AMT-[A-Z0-9]{6})\/(cancelar|saldo|nota)$/);
    if (m && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (m[2] === 'cancelar') return cancel(env, m[1]);
      if (m[2] === 'nota') return saveNote(env, m[1], body.nota);
      return markBalance(env, m[1], body.pagado !== false);
    }
    if (path === '/api/admin/bloqueos' && method === 'POST') return block(env, await request.json().catch(() => ({})));
    if (path === '/api/admin/bloqueos/liberar' && method === 'POST') return unblock(env, await request.json().catch(() => ({})));
    return fail(404, 'not_found', 'Ruta no encontrada');
  } catch (err) {
    console.error('admin error', err);
    return fail(500, 'server_error', 'Algo falló. Intenta de nuevo.');
  }
}

// ── Ingreso ──────────────────────────────────────────────────────────────────
async function requestLink(request, env, url) {
  const { email: raw } = await request.json().catch(() => ({}));
  const email = String(raw || '').trim().toLowerCase();
  const generic = { ok: true, message: 'Si el correo está autorizado, te llegó un enlace para entrar.' };
  if (!adminEmails(env).includes(email)) return json(generic);

  // Máximo un enlace por minuto por correo.
  const recent = await env.DB.prepare(`SELECT created_at FROM admin_tokens WHERE email = ?1 ORDER BY created_at DESC LIMIT 1`).bind(email).first();
  if (recent && Date.now() - Date.parse(recent.created_at) < 60_000) return json(generic);

  const nonce = randomCode(20);
  const exp = Date.now() + LINK_MINUTES * 60_000;
  await env.DB.prepare(`INSERT INTO admin_tokens (nonce, email, expires_at, created_at) VALUES (?1, ?2, ?3, ?4)`)
    .bind(nonce, email, new Date(exp).toISOString(), nowIso())
    .run();
  const token = await sign(env, { t: 'link', e: email, n: nonce, exp });
  const link = `${env.SITE_ORIGIN || url.origin}/admin/?entrar=${encodeURIComponent(token)}`;
  const sent = await sendLoginLink(env, email, link);
  // En desarrollo local no hay correo: se devuelve el enlace para poder entrar.
  if (env.ENVIRONMENT === 'development') return json({ ...generic, devLink: link, sent });
  return json(generic);
}

async function verifyLink(request, env) {
  const { token } = await request.json().catch(() => ({}));
  const p = await verify(env, token, 'link');
  if (!p || !adminEmails(env).includes(p.e)) return fail(401, 'bad_link', 'El enlace no es válido o ya venció. Pide uno nuevo.');
  // Un solo uso.
  const res = await env.DB.prepare(`UPDATE admin_tokens SET used_at = ?2 WHERE nonce = ?1 AND used_at IS NULL AND email = ?3`)
    .bind(p.n, nowIso(), p.e)
    .run();
  if (!res.meta?.changes) return fail(401, 'used_link', 'Ese enlace ya se usó. Pide uno nuevo.');
  return json({ ok: true, email: p.e }, 200, { 'Set-Cookie': await sessionCookie(env, p.e) });
}

// ── Acciones ─────────────────────────────────────────────────────────────────
async function cancel(env, ref) {
  const b = await env.DB.prepare(`SELECT status FROM bookings WHERE ref = ?1`).bind(ref).first();
  if (!b) return fail(404, 'not_found', 'No existe esa reserva');
  if (!['confirmed', 'hold', 'conflict'].includes(b.status)) return fail(409, 'not_cancellable', 'Esa reserva no se puede cancelar');
  const now = nowIso();
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM booking_nights WHERE booking_ref = ?1`).bind(ref),
    env.DB.prepare(`UPDATE bookings SET status = 'cancelled', cancelled_at = ?2, updated_at = ?2 WHERE ref = ?1`).bind(ref, now),
  ]);
  return json({ ok: true });
}

async function saveNote(env, ref, nota) {
  const text = String(nota ?? '').trim().slice(0, 1000) || null;
  const res = await env.DB.prepare(`UPDATE bookings SET internal_note = ?2, updated_at = ?3 WHERE ref = ?1`).bind(ref, text, nowIso()).run();
  if (!res.meta?.changes) return fail(404, 'not_found', 'No existe esa reserva');
  return json({ ok: true });
}

async function markBalance(env, ref, paid) {
  const res = await env.DB.prepare(`UPDATE bookings SET balance_paid_at = ?2, updated_at = ?3 WHERE ref = ?1 AND status = 'confirmed'`)
    .bind(ref, paid ? nowIso() : null, nowIso())
    .run();
  if (!res.meta?.changes) return fail(404, 'not_found', 'No existe esa reserva confirmada');
  return json({ ok: true });
}

/** Bloquea noches de una cabaña: desde (incluida) hasta (incluida). */
async function block(env, body) {
  const { cabana, desde, hasta } = body;
  const note = String(body.nota || '').trim().slice(0, 120) || null;
  if (!isDate(desde) || !isDate(hasta) || hasta < desde) return fail(400, 'invalid_dates', 'Revisa las fechas');
  if (diffDays(desde, hasta) > 180) return fail(400, 'too_long', 'Máximo 180 noches por bloqueo');
  const cabin = await env.DB.prepare(`SELECT id FROM cabins WHERE id = ?1`).bind(cabana).first();
  if (!cabin) return fail(400, 'invalid_cabin', 'Elige una cabaña');

  const nights = nightsBetween(desde, addDays(hasta, 1));
  // Noches ya ocupadas: se informan y no se bloquea nada.
  const taken = await env.DB.prepare(
    `SELECT night, booking_ref FROM booking_nights WHERE cabin_id = ?1 AND night >= ?2 AND night <= ?3`,
  ).bind(cabana, desde, hasta).all();
  if (taken.results.length) {
    const fmt = (d) => new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`));
    const list = taken.results.map((r) => `${fmt(r.night)}${r.booking_ref ? ` (reserva ${r.booking_ref})` : ' (ya bloqueada)'}`).join(', ');
    return fail(409, 'taken', `Estas noches ya están ocupadas: ${list}`);
  }
  try {
    await env.DB.batch(
      nights.map((n) =>
        env.DB.prepare(`INSERT INTO booking_nights (cabin_id, night, source, note) VALUES (?1, ?2, 'manual', ?3)`).bind(cabana, n, note),
      ),
    );
  } catch (err) {
    if (String(err).includes('UNIQUE')) return fail(409, 'taken', 'Alguien reservó una de esas noches justo ahora. Revisa y vuelve a intentar.');
    throw err;
  }
  return json({ ok: true, nights: nights.length });
}

async function unblock(env, { cabana, noche }) {
  if (!isDate(noche)) return fail(400, 'invalid_date', 'Fecha inválida');
  await env.DB.prepare(`DELETE FROM booking_nights WHERE cabin_id = ?1 AND night = ?2 AND booking_ref IS NULL`).bind(cabana, noche).run();
  return json({ ok: true });
}
