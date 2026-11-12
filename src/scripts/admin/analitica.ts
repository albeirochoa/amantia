// Vista Analítica: negocio, embudo, ocupación, extras, fuentes y demanda. Sin librerías de gráficos.
import { api, fmtDate, money } from '../reservas-comun';
import { bar, Ctx, esc, stat } from './ui';

interface Data {
  dias: number;
  kpis: { bookings: number; sales: number; adr: number; avgStay: number; avgLead: number; withExtrasPct: number };
  outcomes: Record<string, number>;
  funnel: { key: string; label: string; n: number }[];
  occupancy: { id: string; name: string; sold: number; available: number; pct: number }[];
  weekdays: number[];
  extras: { id: string; name: string; count: number; revenue: number }[];
  sources: { source: string; visits: number; bookings: number; sales: number }[];
  demand: { date: string; searches: number; none: number }[];
  unmet: { date: string; n: number }[];
}

let dias = 30;
const WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const card = (title: string, hint: string, inner: string) => `
  <section class="bg-paper border border-linen p-5">
    <h2 class="font-serif font-normal text-[20px]">${esc(title)}</h2>
    ${hint ? `<p class="mt-1 text-[13px] text-ink-muted leading-snug">${esc(hint)}</p>` : ''}
    <div class="mt-3">${inner}</div>
  </section>`;
const none = (t: string) => `<p class="text-[14px] text-ink-muted py-2">${esc(t)}</p>`;

export async function renderAnalitica(el: HTMLElement, ctx: Ctx) {
  const d = await api<Data>(`/api/admin/analitica?dias=${dias}`);
  const k = d.kpis;
  const top = d.funnel[0].n;
  const hasEvents = d.funnel.slice(0, 4).some((s) => s.n > 0);
  const lost = (d.outcomes.expired ?? 0) + (d.outcomes.cancelled ?? 0);

  const funnel = hasEvents
    ? d.funnel
        .map((s, i) => {
          const prev = i === 0 ? 0 : d.funnel[i - 1].n;
          const step = i === 0 || prev === 0 ? '' : ` · ${Math.round((s.n / prev) * 100)}% del paso anterior`;
          return bar(s.label, s.n, top || 1, `${s.n}${step}`);
        })
        .join('')
    : none('Aún no hay visitas registradas. Los datos se acumulan desde que alguien entra a la reserva.');

  const occ = d.occupancy.length ? d.occupancy.map((c) => bar(c.name, c.pct, 100, `${c.pct}% · ${c.sold} de ${c.available} noches`)).join('') : none('Sin cabañas.');
  const maxWeek = Math.max(1, ...d.weekdays);
  const week = k.bookings ? d.weekdays.map((n, i) => bar(WEEK[i], n, maxWeek, String(n))).join('') : none('Sin reservas confirmadas en el período.');
  const maxExtra = Math.max(1, ...d.extras.map((e) => e.count));
  const extras = d.extras.length ? d.extras.map((e) => bar(e.name, e.count, maxExtra, `${e.count} · ${money(e.revenue)}`)).join('') : none('Nadie ha pedido extras en el período.');
  const sources = d.sources.length
    ? `<div class="overflow-x-auto"><table class="w-full text-[14px] text-left"><thead class="text-[11px] tracking-[0.14em] uppercase text-ink-muted"><tr><th class="py-2 font-normal">Origen</th><th class="py-2 font-normal text-right">Visitas</th><th class="py-2 font-normal text-right">Reservas</th><th class="py-2 font-normal text-right">Ventas</th></tr></thead><tbody>${d.sources
        .map((s) => `<tr class="border-t border-linen"><td class="py-2">${esc(s.source)}</td><td class="py-2 text-right">${s.visits}</td><td class="py-2 text-right">${s.bookings}</td><td class="py-2 text-right">${s.sales ? money(s.sales) : '—'}</td></tr>`)
        .join('')}</tbody></table></div>`
    : none('Aún no hay datos de origen.');
  const demand = d.demand.length
    ? `<ul class="divide-y divide-linen text-[14px]">${d.demand
        .map((r) => `<li class="py-2 flex justify-between gap-3"><span>${esc(fmtDate(r.date))}</span><span class="text-ink-muted">${r.searches} ${r.searches === 1 ? 'búsqueda' : 'búsquedas'}${r.none ? ` · ${r.none} sin cabaña libre` : ''}</span></li>`)
        .join('')}</ul>`
    : none('Aún no hay búsquedas registradas.');

  el.innerHTML = `
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="font-serif font-normal text-[30px] leading-tight">Analítica</h1>
        <p class="mt-1 text-[14px] text-ink-muted">Reservas y visitas de los últimos ${d.dias} días. La ocupación mira los próximos ${d.dias}.</p>
      </div>
      <div class="flex gap-2" role="group" aria-label="Período">
        ${[30, 90, 365].map((n) => `<button type="button" class="accion ${n === dias ? 'bg-navy text-paper border-navy' : ''}" data-dias="${n}" aria-pressed="${n === dias}">${n === 365 ? '1 año' : n + ' días'}</button>`).join('')}
      </div>
    </div>

    <div class="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3">
      ${stat('Reservas confirmadas', String(k.bookings), lost ? `${lost} sin pago o canceladas` : '')}
      ${stat('Ventas', money(k.sales))}
      ${stat('Tarifa promedio por noche', k.adr ? money(k.adr) : '—', 'Solo alojamiento, sin extras')}
      ${stat('Estancia promedio', k.bookings ? `${k.avgStay} noches` : '—')}
      ${stat('Antelación promedio', k.bookings ? `${k.avgLead} días` : '—', 'Entre reservar y llegar')}
      ${stat('Con extras', k.bookings ? `${k.withExtrasPct}%` : '—', 'De las reservas confirmadas')}
    </div>

    <div class="mt-6 grid gap-4 lg:grid-cols-2">
      ${card('Embudo de reserva', 'Personas distintas en cada paso. El último paso cuenta reservas confirmadas.', funnel)}
      ${card('Ocupación por cabaña', 'Noches vendidas sobre noches disponibles (sin contar bloqueos).', occ)}
      ${card('Día de llegada', 'Reservas confirmadas según el día en que llegan.', week)}
      ${card('Extras', 'Cuántas veces se pidió cada uno.', extras)}
      ${card('Origen del tráfico', 'De dónde llegan a la reserva y cuánto compran. Etiqueta tus enlaces con ?utm_source=instagram para distinguirlos.', sources)}
      ${card('Fechas más buscadas', 'Llegadas que más consultan y si había cabaña libre.', demand)}
      ${d.unmet.length ? card('Demanda sin atender', 'Fechas que buscaron y no tenían cabaña libre. Sirven para decidir precios o abrir bloqueos.', `<ul class="divide-y divide-linen text-[14px]">${d.unmet.map((r) => `<li class="py-2 flex justify-between"><span>${esc(fmtDate(r.date))}</span><span class="text-ink-muted">${r.n} ${r.n === 1 ? 'vez' : 'veces'}</span></li>`).join('')}</ul>`) : ''}
    </div>`;

  el.querySelectorAll<HTMLElement>('[data-dias]').forEach((b) =>
    b.addEventListener('click', () => {
      dias = Number(b.dataset.dias);
      ctx.refresh();
    }),
  );
}
