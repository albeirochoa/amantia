// Utilidades de interfaz del panel: formato, estados, hojas (sheets), avisos y componentes de datos.
import { fmtDate, money } from '../reservas-comun';

export { fmtDate, money };

export interface Booking {
  ref: string;
  status: 'hold' | 'confirmed' | 'expired' | 'cancelled' | 'conflict';
  cabin: { id: string; name: string };
  checkIn: string;
  checkOut: string;
  nights: number;
  name: string;
  email: string;
  phone: string;
  total: number;
  paid: number;
  balance: number;
  lodging: number;
  extrasTotal: number;
  extras: { id: string; name: string; priceCop: number }[];
  paymentStatus: string | null;
  attempts: number;
  balancePaidAt: string | null;
  cancelledAt: string | null;
  holdExpiresAt: string;
  createdAt: string;
  source: string | null;
  medium: string | null;
  note: string | null;
}

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Estados con color semántico: verde = bien, ámbar = en proceso, rojo = requiere acción, gris = cerrada. */
const STATUS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmada', cls: 'chip-ok' },
  hold: { label: 'Pagando', cls: 'chip-warn' },
  expired: { label: 'Sin pago', cls: 'chip-off' },
  cancelled: { label: 'Cancelada', cls: 'chip-off' },
  conflict: { label: 'Pago sin cabaña', cls: 'chip-bad' },
};
export const statusLabel = (s: string) => STATUS[s]?.label ?? s;
export const chip = (s: string) => `<span class="chip ${STATUS[s]?.cls ?? 'chip-off'}">${esc(statusLabel(s))}</span>`;

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Teléfono colombiano de 10 dígitos → con indicativo para wa.me. */
export const waPhone = (p: string) => {
  const d = p.replace(/\D/g, '');
  return d.length === 10 ? `57${d}` : d;
};
export const waLinkTo = (b: Pick<Booking, 'phone' | 'name' | 'ref'>, text?: string) =>
  `https://wa.me/${waPhone(b.phone)}?text=${encodeURIComponent(text ?? `Hola ${b.name.split(' ')[0]}, te escribimos de Amantia sobre tu reserva ${b.ref}.`)}`;

export const stay = (b: Pick<Booking, 'checkIn' | 'checkOut'>) => `${fmtDate(b.checkIn)} – ${fmtDate(b.checkOut)}`;

/** Aviso breve (no bloquea). */
export function toast(message: string, error = false) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.className = `app-ui fixed left-1/2 -translate-x-1/2 bottom-24 lg:bottom-8 z-50 max-w-[90vw] px-5 py-3 text-[14px] rounded-md shadow-lg ${error ? 'toast-bad' : 'toast'}`;
  el.textContent = message;
  el.hidden = false;
  clearTimeout((el as unknown as { t?: number }).t);
  (el as unknown as { t?: number }).t = window.setTimeout(() => (el!.hidden = true), 3500);
}

/** Hoja modal: desde abajo en el celular, centrada en pantallas grandes. Esc o el fondo la cierran. */
export function sheet(title: string, build: (body: HTMLElement, close: () => void) => void) {
  const previous = document.activeElement as HTMLElement | null;
  const overlay = document.createElement('div');
  overlay.className = 'app-ui fixed inset-0 z-40 bg-navy/40 flex items-end md:items-center justify-center';
  overlay.innerHTML = `
    <div role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1"
         class="bg-paper w-full md:max-w-xl max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)] outline-none rounded-t-xl md:rounded-xl">
      <div class="sticky top-0 bg-paper border-b border-linen px-6 h-14 flex items-center justify-between">
        <p class="text-[17px] font-medium">${esc(title)}</p>
        <button type="button" class="h-11 w-11 -mr-3 flex items-center justify-center" aria-label="Cerrar" data-close>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div class="px-6 py-6" data-body></div>
    </div>`;
  const panel = overlay.firstElementChild as HTMLElement;
  const close = () => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    document.body.style.overflow = '';
    previous?.focus?.();
  };
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
  overlay.addEventListener('click', (e) => e.target === overlay && close());
  overlay.querySelector('[data-close]')!.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
  document.body.appendChild(overlay);
  build(overlay.querySelector('[data-body]') as HTMLElement, close);
  panel.focus();
  return close;
}

/** Botón de dos pasos para acciones destructivas (sin ventanas emergentes del navegador). */
export function confirmButton(label: string, confirmLabel: string, onConfirm: () => void, cls = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `accion peligro ${cls}`;
  b.textContent = label;
  let armed = false;
  b.addEventListener('click', () => {
    if (armed) return onConfirm();
    armed = true;
    b.textContent = confirmLabel;
    setTimeout(() => {
      armed = false;
      b.textContent = label;
    }, 5000);
  });
  return b;
}

export function actionButton(label: string, onClick: () => void, cls = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `accion ${cls}`;
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

// ── Componentes de datos ─────────────────────────────────────────────────────

/**
 * Variación porcentual contra el período anterior.
 * good: 'up' = subir es bueno; 'neutral' = ni bueno ni malo (se muestra en gris).
 */
export function delta(current: number, previous: number, good: 'up' | 'neutral' = 'up', label = 'vs. período anterior') {
  if (previous === 0 && current === 0) return `<span class="text-ink-muted">Sin datos en el período anterior</span>`;
  if (previous === 0) return `<span class="text-ink-muted">Sin datos previos para comparar</span>`;
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return `<span class="text-ink-muted">Igual ${esc(label)}</span>`;
  const up = change > 0;
  const tone = good === 'neutral' ? 'text-ink-muted' : up ? 'text-good' : 'text-bad';
  return `<span class="${tone} font-medium">${up ? '▲' : '▼'} ${Math.abs(change)} %</span> <span class="text-ink-muted">${esc(label)}</span>`;
}

/** Línea de tendencia (SVG, sin librerías). */
export function spark(values: number[]) {
  if (values.length < 2 || Math.max(...values) === 0) return '';
  const w = 120;
  const h = 28;
  const max = Math.max(...values);
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 3 - (v / max) * (h - 6)).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="mt-3 text-gold-dark" preserveAspectRatio="none" role="img" aria-label="Tendencia del período">
    <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" /></svg>`;
}

/** Tarjeta de indicador. `foot` es HTML ya escapado (variación, texto de apoyo). */
export const stat = (label: string, value: string, foot = '', trend = '') => `
  <div class="bg-paper border border-linen rounded-md p-4">
    <p class="text-[13px] text-ink-muted">${esc(label)}</p>
    <p class="mt-1.5 font-serif text-[28px] leading-none tabular-nums">${value}</p>
    ${foot ? `<p class="mt-2 text-[13px] leading-snug">${foot}</p>` : ''}
    ${trend}
  </div>`;

/** Barra horizontal simple (sin librerías de gráficos). */
export const bar = (label: string, value: number, max: number, right: string) => `
  <div class="py-2">
    <div class="flex justify-between gap-3 text-[14px]"><span>${esc(label)}</span><span class="text-ink-muted whitespace-nowrap tabular-nums">${right}</span></div>
    <div class="mt-1.5 h-1.5 bg-linen rounded-full" role="presentation"><div class="h-1.5 bg-gold-dark rounded-full" style="width:${max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0}%"></div></div>
  </div>`;

/** Estado vacío: dice qué falta y qué hacer, en lugar de una lista en blanco. */
export const empty = (title: string, text = '') => `
  <div class="border border-dashed border-linen rounded-md px-5 py-6 text-center">
    <p class="text-[15px] font-medium">${esc(title)}</p>
    ${text ? `<p class="mt-1 text-[14px] text-ink-muted leading-snug max-w-md mx-auto">${esc(text)}</p>` : ''}
  </div>`;

/** Fila de reserva para listas en tarjetas (celular), clicable. */
export function bookingRow(b: Booking, onOpen: (ref: string) => void, opts: { showStatus?: boolean } = {}) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'w-full text-left bg-paper border border-linen rounded-md px-4 py-3 hover:border-gold-dark flex items-start justify-between gap-4';
  btn.innerHTML = `
    <span class="min-w-0">
      <span class="block text-[15px] font-medium">${esc(b.name)}</span>
      <span class="block text-[13px] text-ink-muted">${esc(stay(b))} · ${esc(b.cabin.name)}</span>
    </span>
    <span class="text-right shrink-0">
      ${opts.showStatus === false ? '' : `<span class="block">${chip(b.status)}</span>`}
      <span class="block mt-1 text-[13px] tabular-nums ${b.status === 'confirmed' && !b.balancePaidAt && b.balance > 0 ? '' : 'text-ink-muted'}">${balanceText(b)}</span>
    </span>`;
  btn.addEventListener('click', () => onOpen(b.ref));
  li.appendChild(btn);
  return li;
}

export const balanceText = (b: Booking) =>
  b.status === 'confirmed' ? (b.balancePaidAt || b.balance === 0 ? 'Pagada' : `Saldo ${money(b.balance)}`) : money(b.total);

/** Contexto que el enrutador entrega a cada vista. */
export interface Ctx {
  open: (ref: string) => void;
  go: (view: 'inicio' | 'calendario' | 'reservas' | 'analitica', params?: Record<string, string>) => void;
  refresh: () => void;
  params: Record<string, string>;
}
