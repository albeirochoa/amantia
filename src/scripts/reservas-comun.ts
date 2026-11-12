// Utilidades compartidas por /reservas/ y /reservas/confirmacion/.

const moneyFmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
export const money = (n: number) => moneyFmt.format(n);

const dateFmt = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const dateLongFmt = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const toUTC = (d: string) => new Date(`${d}T00:00:00Z`);
export const fmtDate = (d: string) => dateFmt.format(toUTC(d)).replace(/\./g, '');
export const fmtDateLong = (d: string) => dateLongFmt.format(toUTC(d));
export const nightsLabel = (n: number) => `${n} ${n === 1 ? 'noche' : 'noches'}`;

export function addDays(d: string, n: number) {
  return new Date(toUTC(d).getTime() + n * 86_400_000).toISOString().slice(0, 10);
}
export function diffDays(a: string, b: string) {
  return Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / 86_400_000);
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string>) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  } catch {
    throw new ApiError(0, 'network', 'No hay conexión. Revisa tu internet e intenta de nuevo.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = body?.error || {};
    throw new ApiError(res.status, e.code || 'error', e.message || 'Algo falló. Intenta de nuevo.', e.fields);
  }
  return body as T;
}

/** Sesión anónima de la pestaña + origen (utm_source o sitio de referencia). No identifica a la persona. */
function store(key: string, make: () => string): string {
  try {
    let v = sessionStorage.getItem(key);
    if (!v) {
      v = make();
      sessionStorage.setItem(key, v);
    }
    return v;
  } catch {
    return make();
  }
}
export function origen() {
  const qs = new URLSearchParams(location.search);
  const sid = store('amt_sid', () => crypto.randomUUID());
  const fuente = store('amt_src', () => {
    const utm = qs.get('utm_source');
    if (utm) return utm;
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '');
      if (host && host !== location.hostname.replace(/^www\./, '')) return host;
    } catch { /* sin referrer */ }
    return 'directo';
  });
  const medio = store('amt_med', () => qs.get('utm_medium') || '');
  return { sid, fuente, medio };
}

/** Evento anónimo propio (embudo y demanda), además del dataLayer de GTM. */
export function logEvent(tipo: string, extra: Record<string, unknown> = {}) {
  const o = origen();
  try {
    fetch('/api/reservas/evento', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, sid: o.sid, fuente: o.fuente, medio: o.medio, ...extra }),
    }).catch(() => {});
  } catch { /* nunca debe afectar la reserva */ }
}

const OWN_EVENTS: Record<string, string> = {
  booking_search: 'search',
  booking_select: 'select',
  booking_begin_payment: 'begin_payment',
};

/** Evento para GTM (mismo dataLayer que click_whatsapp) y, si aplica, para la analítica propia. */
export function track(event: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { dataLayer?: unknown[] };
  (w.dataLayer = w.dataLayer || []).push({ event, page_path: location.pathname, ...params });
  const own = OWN_EVENTS[event];
  if (own) {
    logEvent(own, {
      llegada: params.check_in,
      noches: params.nights,
      resultados: params.results,
      cabana: params.cabin,
    });
  }
}

export const waUrl = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
