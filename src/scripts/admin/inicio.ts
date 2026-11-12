// Vista Inicio: qué pasa hoy, cobros pendientes, ocupación y abandonos por recuperar.
import { api, fmtDateLong } from '../reservas-comun';
import { nightsLabel } from '../reservas-comun';
import { Booking, bookingRow, Ctx, emptyNote, esc, money, stat, stay, waLinkTo } from './ui';

interface Inicio {
  today: string;
  arrivals: Booking[];
  departures: Booking[];
  inhouse: Booking[];
  next: Booking[];
  recover: Booking[];
  holds: number;
  conflicts: number;
  owed: { amount: number; n: number };
  sales: { amount: number; n: number };
  occ7: { sold: number; available: number; pct: number };
  occ30: { sold: number; available: number; pct: number };
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const names = (list: Booking[]) => (list.length ? list.map((b) => esc(b.cabin.name)).join(', ') : 'Ninguna');

export async function renderInicio(el: HTMLElement, ctx: Ctx) {
  const d = await api<Inicio>('/api/admin/inicio');
  const alerts: string[] = [];
  if (d.conflicts)
    alerts.push(`<button type="button" data-go-estado="conflict" class="w-full text-left bg-[#f4dcdc] text-[#9b2c2c] px-4 py-3 text-[14px]">${d.conflicts} ${d.conflicts === 1 ? 'pago llegó' : 'pagos llegaron'} sin cabaña disponible. Toca para ver y contactar.</button>`);
  if (d.holds)
    alerts.push(`<button type="button" data-go-estado="hold" class="w-full text-left bg-sand px-4 py-3 text-[14px]">${d.holds} ${d.holds === 1 ? 'persona está pagando' : 'personas están pagando'} ahora mismo.</button>`);

  el.innerHTML = `
    <h1 class="font-serif font-normal text-[30px] leading-tight">Inicio</h1>
    <p class="mt-1 text-[14px] text-ink-muted">${esc(cap(fmtDateLong(d.today)))}</p>
    ${alerts.length ? `<div class="mt-5 grid gap-2">${alerts.join('')}</div>` : ''}

    <div class="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
      ${stat('Llegan hoy', String(d.arrivals.length), names(d.arrivals))}
      ${stat('Salen hoy', String(d.departures.length), names(d.departures))}
      ${stat('Hospedados ahora', String(d.inhouse.length), d.inhouse.length ? d.inhouse.map((b) => esc(b.cabin.name)).join(', ') : 'Todas libres')}
      ${stat('Por cobrar', money(d.owed.amount), d.owed.n ? `${d.owed.n} ${d.owed.n === 1 ? 'saldo pendiente' : 'saldos pendientes'}` : 'Sin saldos pendientes')}
      ${stat('Ocupación 7 días', `${d.occ7.pct}%`, `${d.occ7.sold} de ${d.occ7.available} noches`)}
      ${stat('Ocupación 30 días', `${d.occ30.pct}%`, `${d.occ30.sold} de ${d.occ30.available} noches`)}
      ${stat('Ventas del mes', money(d.sales.amount), `${d.sales.n} ${d.sales.n === 1 ? 'reserva' : 'reservas'} confirmadas`)}
    </div>

    <section class="mt-10" aria-labelledby="h-hoy" ${d.arrivals.length + d.departures.length ? '' : 'hidden'}>
      <h2 id="h-hoy" class="font-serif font-normal text-[22px]">Hoy</h2>
      <ul class="mt-3 grid gap-2" id="lista-hoy"></ul>
    </section>

    <section class="mt-10" aria-labelledby="h-prox">
      <div class="flex items-baseline justify-between gap-4">
        <h2 id="h-prox" class="font-serif font-normal text-[22px]">Próximas llegadas</h2>
        <button type="button" class="text-[13px] underline underline-offset-4 py-2" data-go="proximas">Ver todas</button>
      </div>
      <ul class="mt-3 grid gap-2" id="lista-prox"></ul>
    </section>

    <section class="mt-10" aria-labelledby="h-rec">
      <div class="flex items-baseline justify-between gap-4">
        <h2 id="h-rec" class="font-serif font-normal text-[22px]">Por recuperar</h2>
        <button type="button" class="text-[13px] underline underline-offset-4 py-2" data-go="expired">Ver todas</button>
      </div>
      <p class="mt-1 text-[14px] text-ink-muted">Dejaron sus datos, no completaron el pago y la cabaña se liberó (últimos 14 días). Un mensaje a tiempo suele cerrar la venta.</p>
      <ul class="mt-3 grid gap-2" id="lista-rec"></ul>
    </section>`;

  const hoy = el.querySelector('#lista-hoy')!;
  d.arrivals.forEach((b) => hoy.appendChild(labelled('Llega', b, ctx)));
  d.departures.forEach((b) => hoy.appendChild(labelled('Sale', b, ctx)));

  const prox = el.querySelector('#lista-prox')!;
  if (d.next.length) d.next.forEach((b) => prox.appendChild(bookingRow(b, ctx.open, { showStatus: false })));
  else prox.innerHTML = emptyNote('No hay llegadas próximas.');

  const rec = el.querySelector('#lista-rec')!;
  if (!d.recover.length) rec.innerHTML = emptyNote('Nada por recuperar.');
  d.recover.forEach((b) => {
    const li = document.createElement('li');
    li.className = 'bg-paper border border-linen px-4 py-3 flex flex-wrap items-center justify-between gap-3';
    const first = b.name.split(' ')[0];
    const text = `Hola ${first}, te escribimos de Amantia. Vimos que querías reservar ${b.cabin.name} del ${stay(b)} y no alcanzaste a completar el pago. ¿Te ayudamos a terminarlo?`;
    li.innerHTML = `<button type="button" class="text-left min-w-0" data-open>
        <span class="block text-[15px]">${esc(b.name)}</span>
        <span class="block text-[13px] text-ink-muted">${esc(stay(b))} · ${esc(b.cabin.name)} · ${nightsLabel(b.nights)} · ${money(b.total)}</span>
      </button>
      <a class="accion inline-flex items-center" href="${esc(waLinkTo(b, text))}" target="_blank" rel="noopener">Escribir por WhatsApp</a>`;
    li.querySelector('[data-open]')!.addEventListener('click', () => ctx.open(b.ref));
    rec.appendChild(li);
  });

  el.querySelector('[data-go="proximas"]')!.addEventListener('click', () => ctx.go('reservas', { cuando: 'proximas', estado: 'confirmed' }));
  el.querySelector('[data-go="expired"]')!.addEventListener('click', () => ctx.go('reservas', { estado: 'expired', cuando: '' }));
  el.querySelectorAll<HTMLElement>('[data-go-estado]').forEach((b) =>
    b.addEventListener('click', () => ctx.go('reservas', { estado: b.dataset.goEstado!, cuando: '' })),
  );
}

function labelled(label: string, b: Booking, ctx: Ctx) {
  const li = bookingRow(b, ctx.open, { showStatus: false });
  const btn = li.firstElementChild as HTMLElement;
  btn.insertAdjacentHTML('afterbegin', `<span class="text-[11px] tracking-[0.14em] uppercase text-gold-dark w-12 shrink-0 pt-0.5">${label}</span>`);
  return li;
}
