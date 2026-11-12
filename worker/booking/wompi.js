// Integración con Wompi (Web Checkout + eventos). Docs: https://docs.wompi.co
// Secretos (nunca en el repo, HARD RULE 9): WOMPI_PUBLIC_KEY, WOMPI_INTEGRITY_SECRET, WOMPI_EVENTS_SECRET.
import { sha256Hex, safeEqual } from './util.js';

const API_BASE = {
  sandbox: 'https://sandbox.wompi.co/v1',
  production: 'https://production.wompi.co/v1',
};
const CHECKOUT_URL = 'https://checkout.wompi.co/p/';

/** Referencia de pago única por intento: AMT-XXXXXX-1, AMT-XXXXXX-2… */
export const paymentReference = (ref, attempt) => `${ref}-${attempt}`;
export const bookingRefFromPayment = (reference) => String(reference || '').replace(/-\d+$/, '');

/**
 * URL del Web Checkout con firma de integridad.
 * Firma: SHA256(referencia + montoEnCentavos + moneda + [fechaExpiracion] + secretoIntegridad).
 */
export async function checkoutUrl(env, { reference, amountCop, expiresAt, redirectUrl, email, fullName }) {
  if (!env.WOMPI_PUBLIC_KEY || !env.WOMPI_INTEGRITY_SECRET) {
    throw new Error('Faltan WOMPI_PUBLIC_KEY o WOMPI_INTEGRITY_SECRET');
  }
  const amountInCents = String(amountCop * 100);
  const currency = 'COP';
  const signature = await sha256Hex(`${reference}${amountInCents}${currency}${expiresAt}${env.WOMPI_INTEGRITY_SECRET}`);
  const params = new URLSearchParams({
    'public-key': env.WOMPI_PUBLIC_KEY,
    currency,
    'amount-in-cents': amountInCents,
    reference,
    'signature:integrity': signature,
    'redirect-url': redirectUrl,
    'expiration-time': expiresAt,
    'customer-data:email': email,
    'customer-data:full-name': fullName,
  });
  return `${CHECKOUT_URL}?${params}`;
}

/** Consulta una transacción (endpoint público de Wompi). Devuelve null si no existe. */
export async function fetchTransaction(wompiEnv, txId) {
  if (!/^[\w-]{1,64}$/.test(txId)) return null;
  const res = await fetch(`${API_BASE[wompiEnv]}/transactions/${txId}`);
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data ?? null;
}

/**
 * Verifica la firma de un evento de Wompi.
 * checksum = SHA256(valores de signature.properties en orden + timestamp + secretoEventos).
 */
export async function verifyEvent(env, event) {
  const secret = env.WOMPI_EVENTS_SECRET;
  const sig = event?.signature;
  if (!secret || !sig?.checksum || !Array.isArray(sig.properties)) return false;
  const values = sig.properties.map((path) =>
    path.split('.').reduce((obj, key) => (obj == null ? undefined : obj[key]), event.data),
  );
  if (values.some((v) => v === undefined)) return false;
  const expected = await sha256Hex(`${values.join('')}${event.timestamp}${secret}`);
  return safeEqual(expected.toUpperCase(), String(sig.checksum).toUpperCase());
}
