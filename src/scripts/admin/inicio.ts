// Vista Inicio: qué pasa hoy, cobros pendientes, ocupación y abandonos por recuperar.
import { api, fmtDateLong, nightsLabel } from '../reservas-comun';
import { Booking, bookingRow, Ctx, delta, empty, esc, money, stat, stay, waLinkTo } from './ui';

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
  salesPrev: { amount: number; n: number };
  occ7: { sold: number; available: number; pct: number };
  occ30: { sold: number; available: number; pct: number };
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const muted = (t: string) => `<span class="text-ink-muted">${t}</span>`;
const names = (list: Booking[], none: string) => (list.length ? list.map((b) => esc(b.cabin.name)).join(', ') : muted(none));

export async function renderInicio(el: HTMLElement, ctx: Ctx) {
  const d = await api<Inicio>('/api/admin/inicio');
  const alerts: string[] = [];
  if (d.conflicts)
    alerts.push(`<button type="button" data-go-estado="conflict" class="w-full text-left note-bad rounded-md px-4 py-3 text-[14px]"><strong class="font-medium">Requiere acción:</strong> ${d.conflicts} ${d.conflicts === 1 ? 'pago llegó' : 'pagos llegaron'} sin cabaña disponible. Toca para ver y contactar.</button>`);
  if (d.holds)
    alerts.push(`<button type="button" data-go-estado="hold" class="w-full text-left note-warn rounded-md px-4 py-3 text-[14px]">${d.holds} ${d.holds === 1 ? 'persona está pagando' : 'personas están pagando'} ahora mismo. Su cabaña queda separada unos minutos.</button>`);

  el.innerHTML = `
    <h1 class="text-[22px] font-medium leading-tight tracking-[-0.01em]">Inicio</h1>
    <p class="mt-0.5 text-[14px] text-ink-muted">${esc(cap(fmtDateLong(d.today)))}</p>
    ${alerts.length ? `<div class="mt-5 grid gap-2">${alerts.join('')}</div>` : ''}

    <div class="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
      ${stat('Llegan hoy', String(d.arrivals.length), names(d.arrivals, 'Ninguna'))}
      ${stat('Salen hoy', String(d.departures.length), names(d.departures, 'Ninguna'))}
      ${stat('Hospedados ahora', String(d.inhouse.length), d.inhouse.length ? names(d.inhouse, '') : muted('Todas libres'))}
      ${stat('Por cobrar', money(d.owed.amount), muted(d.owed.n ? `${d.owed.n} ${d.owed.n === 1 ? 'saldo pendiente' : 'saldos pendientes'}` : 'Sin saldos pendientes'))}
      ${stat('Ocupación 7 días', `${d.occ7.pct}%`, muted(`${d.occ7.sold} de ${d.occ7.available} noches`))}
      ${stat('Ocupación 30 días', `${d.occ30.pct}%`, muted(`${d.occ30.sold} de ${d.occ30.available} noches`))}
      ${stat('Ventas del mes', money(d.sales.amount), `${muted(`${d.sales.n} ${d.sales.n === 1 ? 'reserva' : 'reservas'}`)}<br>${delta(d.sales.amount, d.salesPrev.amount, 'up', 'vs. el mes anterior')}`)}
    </div>

    <section class="mt-8" aria-labelledby="h-hoy" ${d.arrivals.length + d.departures.length ? '' : 'hidden'}>
      <h2 id="h-hoy" class="text-[16px] font-medium">Hoy</h2>
      <ul class="mt-3 grid gap-2" id="lista-hoy"></ul>
    </section>

    <section class="mt-8" aria-labelledby="h-prox">
      <div class="flex items-baseline justify-between gap-4">
        <h2 id="h-prox" class="text-[16px] font-medium">Próximas llegadas</h2>
        <button type="button" class="text-[13px] link-tool py-2" data-go="proximas">Ver todas</button>
      </div>
      <ul class="mt-3 grid gap-2" id="lista-prox"></ul>
    </section>

    <section class="mt-8" aria-labelledby="h-rec">
      <div class="flex items-baseline justify-between gap-4">
        <h2 id="h-rec" class="text-[16px] font-medium">Por recuperar</h2>
        <button type="button" class="text-[13px] link-tool py-2" data-go="expired">Ver todas</button>
      </div>
      <p class="mt-1 text-[14px] text-ink-muted leading-snug">Dejaron sus datos, no completaron el pago y la cabaña se liberó (últimos 14 días). Un mensaje a tiempo suele cerrar la venta.</p>
      <ul class="mt-3 grid gap-2" id="lista-rec"></ul>
    </section>`;

  const hoy = el.querySelector('#lista-hoy')!;
  d.arrivals.forEach((b) => hoy.appendChild(labelled('Llega', b, ctx)));
  d.departures.forEach((b) => hoy.appendChild(labelled('Sale', b, ctx)));

  const prox = el.querySelector('#lista-prox')!;
  if (d.next.length) d.next.forEach((b) => prox.appendChild(bookingRow(b, ctx.open, { showStatus: false })));
  else prox.innerHTML = `<li>${empty('Aún no hay llegadas próximas', 'Cuando alguien confirme una reserva, aparecerá aquí con su saldo por cobrar.')}</li>`;

  const rec = el.querySelector('#lista-rec')!;
  if (!d.recover.length) rec.innerHTML = `<li>${empty('Nada por recuperar', 'Si alguien deja sus datos y no paga, lo verás aquí con un botón para escribirle por WhatsApp.')}</li>`;
  d.recover.forEach((b) => {
    const li = document.createElement('li');
    li.className = 'bg-paper border border-linen rounded-md px-4 py-3 flex flex-wrap items-center justify-between gap-3';
    const first = b.name.split(' ')[0];
    const text = `Hola ${first}, te escribimos de Amantia. Vimos que querías reservar ${b.cabin.name} del ${stay(b)} y no alcanzaste a completar el pago. ¿Te ayudamos a terminarlo?`;
    li.innerHTML = `<button type="button" class="text-left min-w-0" data-open>
        <span class="block text-[15px] font-medium">${esc(b.name)}</span>
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
  btn.insertAdjacentHTML('afterbegin', `<span class="text-[12px] font-medium text-gold-dark w-12 shrink-0 pt-0.5">${label}</span>`);
  return li;
}
