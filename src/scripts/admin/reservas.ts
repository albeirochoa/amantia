// Vista Reservas: búsqueda y filtros. Tabla densa en pantallas grandes, tarjetas en el celular.
import { api, fmtDate, nightsLabel } from '../reservas-comun';
import { Booking, bookingRow, chip, Ctx, empty, esc, money } from './ui';

interface Lista {
  items: Booking[];
  total: number;
  pageSize: number;
  cabins: { id: string; name: string }[];
}

// Los filtros se conservan al cambiar de pestaña.
const filters: Record<string, string> = { q: '', estado: 'confirmed', cuando: 'proximas', cabana: '' };

export async function renderReservas(el: HTMLElement, ctx: Ctx) {
  for (const k of ['estado', 'cuando', 'cabana', 'q']) if (k in ctx.params) filters[k] = ctx.params[k];
  let page = 0;
  let cabins: Lista['cabins'] = [];
  let shown: Booking[] = [];

  el.innerHTML = `
    <h1 class="text-[22px] font-medium leading-tight tracking-[-0.01em]">Reservas</h1>
    <form class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_170px_190px_150px] lg:items-end" role="search" novalidate>
      <label class="block sm:col-span-2 lg:col-span-1">
        <span class="etiqueta">Buscar</span>
        <input type="search" name="q" placeholder="Nombre, teléfono, correo o código" class="campo" value="${esc(filters.q)}" autocomplete="off" />
      </label>
      <label class="block"><span class="etiqueta">Estado</span>
        <select name="estado" class="campo">
          ${[['', 'Todos'], ['confirmed', 'Confirmadas'], ['hold', 'Pagando'], ['expired', 'Sin pago'], ['cancelled', 'Canceladas'], ['conflict', 'Pago sin cabaña']]
            .map(([v, l]) => `<option value="${v}" ${filters.estado === v ? 'selected' : ''}>${l}</option>`)
            .join('')}
        </select></label>
      <label class="block"><span class="etiqueta">Fechas</span>
        <select name="cuando" class="campo">
          ${[['', 'Todas'], ['proximas', 'Próximas y en curso'], ['pasadas', 'Pasadas']]
            .map(([v, l]) => `<option value="${v}" ${filters.cuando === v ? 'selected' : ''}>${l}</option>`)
            .join('')}
        </select></label>
      <label class="block"><span class="etiqueta">Cabaña</span>
        <select name="cabana" class="campo" id="f-cabana"><option value="">Todas</option></select></label>
    </form>
    <p class="mt-4 text-[13px] text-ink-muted" id="r-count" aria-live="polite"></p>

    <div class="mt-2 hidden lg:block border border-linen rounded-md overflow-hidden bg-paper" id="r-table-wrap">
      <table class="w-full text-[14px] text-left">
        <thead class="bg-sand text-[12px] text-ink-muted">
          <tr>
            <th class="px-4 py-2.5 font-medium">Fechas</th>
            <th class="px-4 py-2.5 font-medium">Cabaña</th>
            <th class="px-4 py-2.5 font-medium">Huésped</th>
            <th class="px-4 py-2.5 font-medium">Estado</th>
            <th class="px-4 py-2.5 font-medium text-right">Total</th>
            <th class="px-4 py-2.5 font-medium text-right">Saldo</th>
          </tr>
        </thead>
        <tbody id="r-tbody"></tbody>
      </table>
    </div>
    <ul class="mt-2 grid gap-2 lg:hidden" id="r-list"></ul>
    <div id="r-empty" class="mt-2" hidden></div>
    <div class="mt-4"><button type="button" class="btn-outline" id="r-more" hidden>Cargar más</button></div>`;

  const form = el.querySelector('form')!;
  const list = el.querySelector('#r-list')!;
  const tbody = el.querySelector('#r-tbody')!;
  const wrap = el.querySelector('#r-table-wrap') as HTMLElement;
  const emptyBox = el.querySelector('#r-empty') as HTMLElement;
  const count = el.querySelector('#r-count')!;
  const more = el.querySelector('#r-more') as HTMLButtonElement;

  function addRows(items: Booking[]) {
    for (const b of items) {
      list.appendChild(bookingRow(b, ctx.open));
      const tr = document.createElement('tr');
      tr.className = 'border-t border-linen hover:bg-sand cursor-pointer';
      const owes = b.status === 'confirmed' && !b.balancePaidAt && b.balance > 0;
      tr.innerHTML = `
        <td class="px-4 py-3 whitespace-nowrap"><button type="button" class="font-medium text-left" data-open>${esc(fmtDate(b.checkIn))} – ${esc(fmtDate(b.checkOut))}</button>
          <span class="block text-[12px] text-ink-muted">${nightsLabel(b.nights)}</span></td>
        <td class="px-4 py-3">${esc(b.cabin.name)}</td>
        <td class="px-4 py-3">${esc(b.name)}<span class="block text-[12px] text-ink-muted">${esc(b.ref)}</span></td>
        <td class="px-4 py-3">${chip(b.status)}</td>
        <td class="px-4 py-3 text-right tabular-nums">${money(b.total)}</td>
        <td class="px-4 py-3 text-right tabular-nums ${owes ? 'font-medium' : 'text-ink-muted'}">${b.status === 'confirmed' ? (owes ? money(b.balance) : 'Pagada') : '—'}</td>`;
      tr.addEventListener('click', () => ctx.open(b.ref));
      (tr.querySelector('[data-open]') as HTMLElement).addEventListener('click', (e) => {
        e.stopPropagation();
        ctx.open(b.ref);
      });
      tbody.appendChild(tr);
    }
  }

  async function load(reset: boolean) {
    if (reset) {
      page = 0;
      shown = [];
      list.innerHTML = '';
      tbody.innerHTML = '';
    }
    const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), pagina: String(page) });
    const r = await api<Lista>(`/api/admin/reservas?${qs}`);
    if (!cabins.length) {
      cabins = r.cabins;
      const sel = el.querySelector('#f-cabana') as HTMLSelectElement;
      sel.insertAdjacentHTML('beforeend', cabins.map((c) => `<option value="${esc(c.id)}" ${filters.cabana === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join(''));
    }
    shown.push(...r.items);
    addRows(r.items);
    const none = shown.length === 0;
    emptyBox.hidden = !none;
    wrap.classList.toggle('lg:hidden', none);
    if (none) {
      const filtered = Boolean(filters.q || filters.estado || filters.cabana || filters.cuando);
      emptyBox.innerHTML = empty(
        filtered ? 'No hay reservas con esos filtros' : 'Todavía no hay reservas',
        filtered ? 'Prueba quitando un filtro o buscando por otro dato: nombre, teléfono, correo o código.' : 'Cuando alguien reserve en amantia.com.co/reservas/, aparecerá aquí.',
      );
    }
    count.textContent = `${r.total} ${r.total === 1 ? 'reserva' : 'reservas'}`;
    more.hidden = (page + 1) * r.pageSize >= r.total;
  }

  let timer: number | undefined;
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    filters[t.name] = t.value.trim();
    clearTimeout(timer);
    timer = window.setTimeout(() => load(true), t.name === 'q' ? 300 : 0);
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  more.addEventListener('click', () => {
    page++;
    load(false);
  });

  await load(true);
}
