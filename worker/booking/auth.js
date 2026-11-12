// Ingreso al panel con enlace mágico + cookie de sesión firmada (HMAC-SHA256).
// Secreto: ADMIN_SECRET (wrangler secret put ADMIN_SECRET). Correos autorizados: ADMIN_EMAILS (separados por coma).
import { safeEqual } from './util.js';

const COOKIE = 'amantia_admin';
const SESSION_DAYS = 30;
const enc = new TextEncoder();

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlText = (s) => b64url(enc.encode(s));
const fromB64url = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export async function sign(env, payload) {
  if (!env.ADMIN_SECRET) throw new Error('Falta ADMIN_SECRET');
  const body = b64urlText(JSON.stringify(payload));
  return `${body}.${await hmac(env.ADMIN_SECRET, body)}`;
}

/** Devuelve el payload si la firma es válida y no venció; si no, null. */
export async function verify(env, token, type) {
  if (!env.ADMIN_SECRET || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!safeEqual(sig, await hmac(env.ADMIN_SECRET, body))) return null;
  try {
    const p = JSON.parse(fromB64url(body));
    if (p.t !== type || typeof p.exp !== 'number' || p.exp < Date.now()) return null;
    return p;
  } catch {
    return null;
  }
}

export const adminEmails = (env) =>
  String(env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export async function sessionCookie(env, email) {
  const token = await sign(env, { t: 'session', e: email, exp: Date.now() + SESSION_DAYS * 86_400_000 });
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86_400}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

/** Email del administrador con sesión válida, o null. */
export async function currentAdmin(request, env) {
  // Interruptor de emergencia: ADMIN_OPEN = "true" abre el panel sin ingreso. Producción debe tenerlo en "false".
  if (env.ADMIN_OPEN === 'true') return 'Acceso abierto (temporal)';
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  const p = await verify(env, m[1], 'session');
  if (!p || !adminEmails(env).includes(p.e)) return null;
  return p.e;
}
