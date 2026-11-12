// Vista Analítica: negocio, embudo, ocupación, extras, fuentes y demanda. Sin librerías de gráficos.
import { api, fmtDate, money } from '../reservas-comun';
import { bar, Ctx, delta, empty, esc, spark, stat } from './ui';

interface Kpis {
  bookings: number;
  sales: number;
  adr: number;
  avgStay: number;
  avgLead: number;
  withExtrasPct: number;
}
interface Data {
  dias: number;
  kpis: Kpis;
  prev: Kpis;
  series: { sales: number; bookings: number }[];
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
const muted = (t: string) => `<span class="text-ink-muted">${t}</span>`;
const card = (title: string, hint: string, inner: string) => `
  <section class="bg-paper border border-linen rounded-md p-5">
    <h2 class="text-[16px] font-medium">${esc(title)}</h2>
    ${hint ? `<p class="mt-0.5 text-[13px] text-ink-muted leading-snug">${esc(hint)}</p>` : ''}
    <div class="mt-3">${inner}</div>
  </section>`;

export async function renderAnalitica(el: HTMLElement, ctx: Ctx) {
  const d = await api<Data>(`/api/admin/analitica?dias=${dias}`);
  const k = d.kpis;
  const p = d.prev;
  const top = d.funnel[0].n;
  const hasEvents = d.funnel.slice(0, 4).some((s) => s.n > 0);
  const lost = (d.outcomes.expired ?? 0) + (d.outcomes.cancelled ?? 0);
  const vs = `vs. ${d.dias === 365 ? 'el año anterior' : `los ${d.dias} días previos`}`;
  // Sin reservas en el período anterior no hay con qué comparar: se avisa una sola vez, no en cada tarjeta.
  const noPrev = p.bookings === 0;
  const cmp = (cur: number, prev: number, good: 'up' | 'neutral' = 'up') => (noPrev ? '' : delta(cur, prev, good, vs));
  const lines = (...parts: string[]) => parts.filter(Boolean).join('<br>');

  const funnel = hasEvents
    ? d.funnel
        .map((s, i) => {
          const prev = i === 0 ? 0 : d.funnel[i - 1].n;
          const step = i === 0 || prev === 0 ? '' : ` · ${Math.round((s.n / prev) * 100)} % del paso anterior`;
          return bar(s.label, s.n, top || 1, `${s.n}${step}`);
        })
        .join('')
    : empty('Aún no hay visitas registradas', 'Las visitas, búsquedas y pagos se cuentan desde el 12 de noviembre. Aparecerán aquí en cuanto alguien use la reserva.');

  const occ = d.occupancy.length ? d.occupancy.map((c) => bar(c.name, c.pct, 100, `${c.pct} % · ${c.sold} de ${c.available} noches`)).join('') : empty('No hay cabañas activas');
  const maxWeek = Math.max(1, ...d.weekdays);
  const week = k.bookings ? d.weekdays.map((n, i) => bar(WEEK[i], n, maxWeek, String(n))).join('') : empty('Sin reservas confirmadas en el período', 'Cuando haya reservas, verás qué días de la semana llegan más. Sirve para ajustar tarifas.');
  const maxExtra = Math.max(1, ...d.extras.map((e) => e.count));
  const extras = d.extras.length ? d.extras.map((e) => bar(e.name, e.count, maxExtra, `${e.count} · ${money(e.revenue)}`)).join('') : empty('Nadie ha pedido extras', 'Aquí verás cuáles se piden más y cuánto suman a las ventas.');
  const sources = d.sources.length
    ? `<div class="overflow-x-auto"><table class="w-full text-[14px] text-left"><thead class="text-[12px] text-ink-muted"><tr><th class="py-2 font-medium">Origen</th><th class="py-2 font-medium text-right">Visitas</th><th class="py-2 font-medium text-right">Reservas</th><th class="py-2 font-medium text-right">Ventas</th></tr></thead><tbody>${d.sources
        .map((s) => `<tr class="border-t border-linen"><td class="py-2">${esc(s.source)}</td><td class="py-2 text-right tabular-nums">${s.visits}</td><td class="py-2 text-right tabular-nums">${s.bookings}</td><td class="py-2 text-right tabular-nums">${s.sales ? money(s.sales) : '—'}</td></tr>`)
        .join('')}</tbody></table></div>`
    : empty('Aún no hay datos de origen', 'Etiqueta tus enlaces, por ejemplo amantia.com.co/reservas/?utm_source=instagram, y verás qué canal trae reservas.');
  const demand = d.demand.length
    ? `<ul class="divide-y divide-linen text-[14px]">${d.demand
        .map((r) => `<li class="py-2 flex justify-between gap-3"><span>${esc(fmtDate(r.date))}</span><span class="text-ink-muted">${r.searches} ${r.searches === 1 ? 'búsqueda' : 'búsquedas'}${r.none ? ` · ${r.none} sin cabaña libre` : ''}</span></li>`)
        .join('')}</ul>`
    : empty('Aún no hay búsquedas', 'Aquí verás qué fechas consultan más, aunque no reserven.');
  const unmet = d.unmet.length
    ? card('Demanda sin atender', 'Fechas que buscaron y no tenían cabaña libre. Sirven para decidir precios o liberar bloqueos.', `<ul class="divide-y divide-linen text-[14px]">${d.unmet.map((r) => `<li class="py-2 flex justify-between"><span>${esc(fmtDate(r.date))}</span><span class="text-ink-muted">${r.n} ${r.n === 1 ? 'vez' : 'veces'}</span></li>`).join('')}</ul>`)
    : '';

  el.innerHTML = `
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[22px] font-medium leading-tight tracking-[-0.01em]">Analítica</h1>
        <p class="mt-0.5 text-[14px] text-ink-muted">Reservas y visitas de los últimos ${d.dias === 365 ? '12 meses' : `${d.dias} días`}. La ocupación mira los próximos ${d.dias === 365 ? '12 meses' : `${d.dias} días`}.</p>
      </div>
      <div class="flex gap-2" role="group" aria-label="Período">
        ${[30, 90, 365].map((n) => `<button type="button" class="accion ${n === dias ? 'accion-on' : ''}" data-dias="${n}" aria-pressed="${n === dias}">${n === 365 ? '1 año' : n + ' días'}</button>`).join('')}
      </div>
    </div>

    ${noPrev ? `<p class="mt-4 text-[13px] text-ink-muted">Todavía no hay un período anterior con reservas para comparar. Las variaciones aparecerán solas cuando lo haya.</p>` : ''}
    <div class="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
      ${stat('Ventas', money(k.sales), lines(cmp(k.sales, p.sales)), spark(d.series.map((s) => s.sales)))}
      ${stat('Reservas confirmadas', String(k.bookings), lines(cmp(k.bookings, p.bookings), lost ? muted(`${lost} sin pago o canceladas`) : ''), spark(d.series.map((s) => s.bookings)))}
      ${stat('Tarifa promedio por noche', k.adr ? money(k.adr) : '—', lines(cmp(k.adr, p.adr), muted('Solo alojamiento, sin extras')))}
      ${stat('Estancia promedio', k.bookings ? `${k.avgStay} noches` : '—', lines(cmp(k.avgStay, p.avgStay, 'neutral')))}
      ${stat('Antelación promedio', k.bookings ? `${k.avgLead} días` : '—', lines(cmp(k.avgLead, p.avgLead, 'neutral'), muted('Entre reservar y llegar')))}
      ${stat('Con extras', k.bookings ? `${k.withExtrasPct} %` : '—', lines(cmp(k.withExtrasPct, p.withExtrasPct), muted('De las reservas confirmadas')))}
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      ${card('Embudo de reserva', 'Personas distintas en cada paso. El último paso cuenta reservas confirmadas.', funnel)}
      ${card('Ocupación por cabaña', 'Noches vendidas sobre noches disponibles (sin contar bloqueos).', occ)}
      ${card('Día de llegada', 'Reservas confirmadas según el día en que llegan.', week)}
      ${card('Extras', 'Cuántas veces se pidió cada uno.', extras)}
      ${card('Origen del tráfico', 'De dónde llegan a la reserva y cuánto compran.', sources)}
      ${card('Fechas más buscadas', 'Llegadas que más consultan y si había cabaña libre.', demand)}
      ${unmet}
    </div>`;

  el.querySelectorAll<HTMLElement>('[data-dias]').forEach((b) =>
    b.addEventListener('click', () => {
      dias = Number(b.dataset.dias);
      ctx.refresh();
    }),
  );
}
