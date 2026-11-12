// Vista Reservas: búsqueda y filtros sobre todas las reservas.
import { api } from '../reservas-comun';
import { Booking, bookingRow, Ctx, emptyNote, esc } from './ui';

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

  el.innerHTML = `
    <h1 class="font-serif font-normal text-[30px] leading-tight">Reservas</h1>
    <form class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="search" novalidate>
      <label class="sm:col-span-2 lg:col-span-4 block">
        <span class="sr-only">Buscar</span>
        <input type="search" name="q" placeholder="Buscar por nombre, teléfono, correo o código" class="campo !mt-0" value="${esc(filters.q)}" autocomplete="off" />
      </label>
      <label class="block"><span class="text-[11px] tracking-[0.2em] uppercase text-ink-muted">Estado</span>
        <select name="estado" class="campo">
          ${[['', 'Todos'], ['confirmed', 'Confirmadas'], ['hold', 'Pagando'], ['expired', 'Sin pago'], ['cancelled', 'Canceladas'], ['conflict', 'Pago sin cabaña']]
            .map(([v, l]) => `<option value="${v}" ${filters.estado === v ? 'selected' : ''}>${l}</option>`)
            .join('')}
        </select></label>
      <label class="block"><span class="text-[11px] tracking-[0.2em] uppercase text-ink-muted">Fechas</span>
        <select name="cuando" class="campo">
          ${[['', 'Todas'], ['proximas', 'Próximas y en curso'], ['pasadas', 'Pasadas']]
            .map(([v, l]) => `<option value="${v}" ${filters.cuando === v ? 'selected' : ''}>${l}</option>`)
            .join('')}
        </select></label>
      <label class="block"><span class="text-[11px] tracking-[0.2em] uppercase text-ink-muted">Cabaña</span>
        <select name="cabana" class="campo" id="f-cabana"><option value="">Todas</option></select></label>
    </form>
    <p class="mt-5 text-[14px] text-ink-muted" id="r-count" aria-live="polite"></p>
    <ul class="mt-3 grid gap-2" id="r-list"></ul>
    <div class="mt-4"><button type="button" class="btn-outline" id="r-more" hidden>Cargar más</button></div>`;

  const form = el.querySelector('form')!;
  const list = el.querySelector('#r-list')!;
  const count = el.querySelector('#r-count')!;
  const more = el.querySelector('#r-more') as HTMLButtonElement;

  async function load(reset: boolean) {
    if (reset) {
      page = 0;
      list.innerHTML = '';
    }
    const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), pagina: String(page) });
    const r = await api<Lista>(`/api/admin/reservas?${qs}`);
    if (!cabins.length) {
      cabins = r.cabins;
      const sel = el.querySelector('#f-cabana') as HTMLSelectElement;
      sel.insertAdjacentHTML('beforeend', cabins.map((c) => `<option value="${esc(c.id)}" ${filters.cabana === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join(''));
    }
    r.items.forEach((b) => list.appendChild(bookingRow(b, ctx.open)));
    if (!list.children.length) list.innerHTML = emptyNote('No hay reservas con esos filtros.');
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
