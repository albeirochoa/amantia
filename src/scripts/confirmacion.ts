// /reservas/confirmacion/?ref=AMT-XXXXXX&t=TOKEN[&id=TX_WOMPI]
// Consulta el estado en el servidor (que concilia con Wompi) hasta que el pago se resuelva.
import { api, fmtDateLong, money, track, waUrl } from './reservas-comun';

interface View {
  ref: string;
  status: 'hold' | 'confirmed' | 'expired' | 'cancelled' | 'conflict';
  paymentStatus: string | null;
  cabin: { id: string; name: string };
  checkIn: string;
  checkOut: string;
  firstName: string;
  lodging: number;
  extras: { id: string; name: string; priceCop: number }[];
  total: number;
  deposit: number;
  balance: number;
  holdExpiresAt: string;
}

const FAILED = ['DECLINED', 'VOIDED', 'ERROR'];
const POLL_MS = 3000;
const MAX_POLLS = 40; // ≈ 2 minutos

export function initConfirmacion() {
  const root = document.getElementById('confirmacion')!;
  const wa = root.dataset.wa!;
  const qs = new URLSearchParams(location.search);
  const ref = qs.get('ref') || '';
  const token = qs.get('t') || '';
  const txId = qs.get('id') || ''; // lo agrega Wompi al volver
  let polls = 0;
  let countdown: number | undefined;

  const set = (campo: string, text: string) =>
    root.querySelectorAll<HTMLElement>(`[data-campo="${campo}"]`).forEach((el) => (el.textContent = text));
  const action = (name: string, visible: boolean) => {
    const el = root.querySelector<HTMLElement>(`[data-accion="${name}"]`);
    if (el) el.hidden = !visible;
  };
  function state(name: string) {
    root.querySelectorAll<HTMLElement>('[data-estado]').forEach((s) => (s.hidden = s.dataset.estado !== name));
  }

  function render(v: View) {
    const detail = document.getElementById('detalle')!;
    detail.hidden = false;
    set('ref', v.ref);
    set('nombre', v.firstName);
    set('cabana', v.cabin.name);
    set('llegada', fmtDateLong(v.checkIn));
    set('salida', fmtDateLong(v.checkOut));
    set('alojamiento', money(v.lodging));
    const ex = document.getElementById('lista-extras-conf')!;
    ex.innerHTML = '';
    for (const e of v.extras) {
      const dt = document.createElement('dt');
      dt.textContent = e.name;
      const dd = document.createElement('dd');
      dd.className = 'text-right';
      dd.textContent = money(e.priceCop);
      ex.append(dt, dd);
    }
    set('total', money(v.total));
    set('anticipo', money(v.deposit));
    set('saldo', money(v.balance));
    set('lbl-anticipo', v.status === 'confirmed' ? 'Pagado' : 'Anticipo');

    const waLink = root.querySelector<HTMLAnchorElement>('[data-accion="whatsapp"]')!;
    waLink.href = waUrl(wa, `Hola, mi código de reserva en Amantia es ${v.ref}.`);
    ['reintentar', 'buscar', 'mapa'].forEach((a) => action(a, false));
    clearInterval(countdown);

    if (v.status === 'confirmed') {
      state('confirmada');
      action('mapa', true);
      const key = `amantia_tracked_${v.ref}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        track('booking_confirmed', { booking_ref: v.ref, cabin: v.cabin.id, value: v.deposit, currency: 'COP' });
      }
      return true;
    }
    if (v.status === 'expired' || v.status === 'cancelled') {
      state('vencida');
      const a = root.querySelector<HTMLAnchorElement>('[data-accion="buscar"]')!;
      a.href = `/reservas/?llegada=${v.checkIn}&salida=${v.checkOut}`;
      action('buscar', true);
      return true;
    }
    if (v.status === 'conflict') {
      state('conflicto');
      return true;
    }
    // status = hold
    const failed = v.paymentStatus !== null && FAILED.includes(v.paymentStatus);
    const gaveUp = polls >= MAX_POLLS || (!txId && !v.paymentStatus && polls >= 3);
    if (failed || gaveUp) {
      state('fallida');
      action('reintentar', true);
      startCountdown(v.holdExpiresAt);
      return failed;
    }
    state('cargando');
    return false;
  }

  function startCountdown(iso: string) {
    const tick = () => {
      const ms = new Date(iso).getTime() - Date.now();
      if (ms <= 0) {
        clearInterval(countdown);
        load();
        return;
      }
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      set('restante', `durante ${m}:${String(s).padStart(2, '0')} minutos más`);
    };
    tick();
    countdown = window.setInterval(tick, 1000);
  }

  async function load() {
    polls++;
    try {
      const v = await api<View>(`/api/reservas/${encodeURIComponent(ref)}?t=${encodeURIComponent(token)}${txId ? `&tx=${encodeURIComponent(txId)}` : ''}`);
      const done = render(v);
      if (!done && polls < MAX_POLLS) setTimeout(load, POLL_MS);
    } catch {
      if (polls === 1) state('error');
    }
  }

  root.querySelector('[data-accion="reintentar"]')!.addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.disabled = true;
    try {
      const r = await api<{ payment: { url: string } }>(`/api/reservas/${encodeURIComponent(ref)}/reintentar`, {
        method: 'POST',
        body: JSON.stringify({ t: token }),
      });
      location.href = r.payment.url;
    } catch (err) {
      btn.disabled = false;
      document.getElementById('error-accion')!.textContent = (err as Error).message;
      load();
    }
  });

  if (!ref || !token) state('error');
  else load();
}
