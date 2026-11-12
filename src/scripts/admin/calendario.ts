// Vista Calendario: una fila por cabaña, una columna por noche. Toca una reserva para abrirla,
// una noche libre para bloquearla o una bloqueada para liberarla.
import { addDays, api, diffDays, fmtDate, toUTC } from '../reservas-comun';
import { actionButton, Booking, Ctx, esc, sheet, toast } from './ui';

interface Cal {
  today: string;
  from: string;
  to: string;
  days: number;
  cabins: { id: string; name: string }[];
  bookings: Booking[];
  blocks: { cabin_id: string; night: string; note: string | null }[];
}

const DAYS = 14;
const CELL = 46; // px por noche
const LABEL = 92; // px de la columna de cabañas
let from = '';

const weekday = new Intl.DateTimeFormat('es-CO', { weekday: 'narrow', timeZone: 'UTC' });
const monthFmt = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const monthShort = new Intl.DateTimeFormat('es-CO', { month: 'short', timeZone: 'UTC' });

export async function renderCalendario(el: HTMLElement, ctx: Ctx) {
  const q = from ? `?desde=${from}&dias=${DAYS}` : `?dias=${DAYS}`;
  const d = await api<Cal>(`/api/admin/calendario${q}`);
  from = d.from;
  const nights = Array.from({ length: d.days }, (_, i) => addDays(d.from, i));
  const cols = `grid-template-columns:${LABEL}px repeat(${d.days},minmax(${CELL}px,1fr))`;
  const mid = nights[Math.floor(nights.length / 2)];
  const isWeekend = (n: string) => [0, 6].includes(toUTC(n).getUTCDay());
  const monthRaw = monthFmt.format(toUTC(mid));
  const monthTitle = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

  el.innerHTML = `
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="font-serif font-normal text-[30px] leading-tight">Calendario</h1>
        <p class="mt-1 text-[14px] text-ink-muted" id="cal-titulo">${esc(monthTitle)}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="text-[12px] tracking-[0.12em] uppercase text-ink-muted flex items-center gap-2">Ir a
          <input type="date" id="cal-ir" value="${d.from}" class="border border-linen bg-paper h-10 px-2 text-[14px] normal-case tracking-normal text-navy" />
        </label>
        <button type="button" class="accion" data-shift="-${DAYS}" aria-label="${DAYS} días antes">‹</button>
        <button type="button" class="accion" data-shift="today">Hoy</button>
        <button type="button" class="accion" data-shift="${DAYS}" aria-label="${DAYS} días después">›</button>
      </div>
    </div>

    <div class="mt-5 overflow-x-auto border border-linen bg-paper" id="cal-scroll">
      <div style="min-width:${LABEL + d.days * CELL}px" id="cal-grid">
        <div class="grid text-center text-[11px] text-ink-muted" style="${cols}">
          <div class="sticky left-0 z-20 bg-paper"></div>
          ${nights
            .map((n) => {
              const first = n.endsWith('-01') || n === d.from;
              return `<div class="py-2 border-l border-linen/70 ${isWeekend(n) ? 'bg-sand' : ''} ${n === d.today ? 'text-gold-dark font-normal' : ''}">
                <span class="block uppercase">${esc(weekday.format(toUTC(n)))}</span>
                <span class="block text-[15px] ${n === d.today ? 'text-gold-dark' : 'text-navy'}">${Number(n.slice(8))}</span>
                <span class="block h-3 text-[9px] uppercase">${first ? esc(monthShort.format(toUTC(n)).replace('.', '')) : ''}</span>
              </div>`;
            })
            .join('')}
        </div>
        <div id="cal-rows"></div>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-muted" aria-hidden="true">
      <span><i class="inline-block w-3 h-3 bg-navy align-[-1px] mr-1.5"></i>Confirmada</span>
      <span><i class="inline-block w-3 h-3 bg-gold-soft align-[-1px] mr-1.5"></i>Pagando</span>
      <span><i class="inline-block w-3 h-3 bloqueo align-[-1px] mr-1.5"></i>Bloqueada</span>
    </div>
    <div class="mt-6"><button type="button" class="btn-outline" id="btn-bloquear">Bloquear noches</button></div>`;

  const rows = el.querySelector('#cal-rows')!;
  for (const cabin of d.cabins) {
    const row = document.createElement('div');
    row.className = 'grid border-t border-linen';
    row.setAttribute('style', `${cols};grid-template-rows:56px`);
    const label = document.createElement('div');
    label.className = 'sticky left-0 z-20 bg-paper px-3 flex items-center text-[13px] border-r border-linen leading-tight';
    label.style.gridColumn = '1';
    label.style.gridRow = '1';
    label.textContent = cabin.name;
    row.appendChild(label);

    nights.forEach((n, i) => {
      const block = d.blocks.find((b) => b.cabin_id === cabin.id && b.night === n);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.style.gridColumn = String(i + 2);
      cell.style.gridRow = '1';
      const past = n < d.today;
      cell.className = `border-l border-linen/70 text-[10px] text-ink-muted ${isWeekend(n) ? 'bg-sand/60' : ''} ${block ? 'bloqueo' : ''} ${past ? 'opacity-50' : 'hover:bg-linen/60'}`;
      if (block) {
        cell.title = block.note ? `Bloqueada: ${block.note}` : 'Bloqueada';
        cell.setAttribute('aria-label', `${cabin.name}, ${fmtDate(n)}: bloqueada${block.note ? ', ' + block.note : ''}`);
        cell.addEventListener('click', () => unblockSheet(cabin.name, cabin.id, n, block.note, ctx));
      } else {
        cell.setAttribute('aria-label', `${cabin.name}, ${fmtDate(n)}: libre`);
        if (past) cell.disabled = true;
        else cell.addEventListener('click', () => blockSheet(d, ctx, { cabin: cabin.id, desde: n }));
      }
      row.appendChild(cell);
    });

    for (const b of d.bookings.filter((x) => x.cabin.id === cabin.id)) {
      const start = Math.max(0, diffDays(d.from, b.checkIn));
      const end = Math.min(d.days, diffDays(d.from, b.checkOut)); // la noche de salida no se duerme
      if (end <= start) continue;
      const bar = document.createElement('button');
      bar.type = 'button';
      bar.style.gridColumn = `${start + 2} / ${end + 2}`;
      bar.style.gridRow = '1';
      const confirmed = b.status === 'confirmed';
      bar.className = `z-10 my-2.5 mx-0.5 px-2 text-left text-[12px] leading-tight overflow-hidden flex items-center ${confirmed ? 'bg-navy text-paper' : 'bg-gold-soft text-navy'}`;
      const pending = confirmed && !b.balancePaidAt && b.balance > 0;
      bar.innerHTML = `<span class="truncate">${esc(b.name.split(' ')[0])}${pending ? ' · saldo' : ''}</span>`;
      bar.setAttribute('aria-label', `${b.name}, ${fmtDate(b.checkIn)} a ${fmtDate(b.checkOut)}, ${confirmed ? 'confirmada' : 'pagando'}`);
      bar.addEventListener('click', () => ctx.open(b.ref));
      row.appendChild(bar);
    }
    rows.appendChild(row);
  }

  el.querySelectorAll<HTMLElement>('[data-shift]').forEach((b) =>
    b.addEventListener('click', () => {
      const v = b.dataset.shift!;
      from = v === 'today' ? '' : addDays(from, Number(v));
      ctx.refresh();
    }),
  );
  (el.querySelector('#cal-ir') as HTMLInputElement).addEventListener('change', (e) => {
    const v = (e.target as HTMLInputElement).value;
    if (v) {
      from = v;
      ctx.refresh();
    }
  });
  el.querySelector('#btn-bloquear')!.addEventListener('click', () => blockSheet(d, ctx, {}));
}

function blockSheet(d: Cal, ctx: Ctx, preset: { cabin?: string; desde?: string }) {
  sheet('Bloquear noches', (body, close) => {
    body.innerHTML = `
      <p class="text-[15px] leading-[1.6] text-ink-muted">Cierra noches vendidas por fuera (WhatsApp, Airbnb, Booking) o que no quieres ofrecer. Desaparecen de la reserva en línea.</p>
      <form class="mt-5 grid gap-5" novalidate>
        <label class="block"><span class="text-[12px] tracking-[0.2em] uppercase text-ink-muted">Cabaña</span>
          <select name="cabana" class="campo">${d.cabins.map((c) => `<option value="${esc(c.id)}" ${c.id === preset.cabin ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
        <div class="grid grid-cols-2 gap-5">
          <label class="block"><span class="text-[12px] tracking-[0.2em] uppercase text-ink-muted">Primera noche</span>
            <input name="desde" type="date" required min="${d.today}" value="${esc(preset.desde ?? '')}" class="campo" /></label>
          <label class="block"><span class="text-[12px] tracking-[0.2em] uppercase text-ink-muted">Última noche</span>
            <input name="hasta" type="date" required min="${d.today}" value="${esc(preset.desde ?? '')}" class="campo" /></label>
        </div>
        <label class="block"><span class="text-[12px] tracking-[0.2em] uppercase text-ink-muted">Nota (opcional)</span>
          <input name="nota" maxlength="120" placeholder="Ej.: Airbnb, Juan" class="campo" /></label>
        <p class="text-[14px] text-[#9b2c2c] min-h-[1.4em]" data-error role="alert"></p>
        <button type="submit" class="btn-primary w-full">Bloquear</button>
      </form>`;
    const form = body.querySelector('form')!;
    const desde = form.elements.namedItem('desde') as HTMLInputElement;
    const hasta = form.elements.namedItem('hasta') as HTMLInputElement;
    desde.addEventListener('change', () => {
      if (!hasta.value || hasta.value < desde.value) hasta.value = desde.value;
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        const r = await api<{ nights: number }>('/api/admin/bloqueos', { method: 'POST', body: JSON.stringify(Object.fromEntries(fd)) });
        toast(`${r.nights} ${r.nights === 1 ? 'noche bloqueada' : 'noches bloqueadas'}`);
        close();
        ctx.refresh();
      } catch (err) {
        (body.querySelector('[data-error]') as HTMLElement).textContent = (err as Error).message;
      }
    });
  });
}

function unblockSheet(cabinName: string, cabinId: string, night: string, note: string | null, ctx: Ctx) {
  sheet('Noche bloqueada', (body, close) => {
    body.innerHTML = `
      <p class="font-serif text-[22px]">${esc(cabinName)}</p>
      <p class="mt-1 text-[15px] text-ink-muted">${esc(fmtDate(night))}${note ? ' · ' + esc(note) : ''}</p>
      <p class="mt-4 text-[15px] leading-[1.6]">Si la liberas, vuelve a aparecer disponible en la reserva en línea.</p>
      <div class="mt-6" data-actions></div>`;
    body.querySelector('[data-actions]')!.appendChild(
      actionButton('Liberar esta noche', async () => {
        try {
          await api('/api/admin/bloqueos/liberar', { method: 'POST', body: JSON.stringify({ cabana: cabinId, noche: night }) });
          toast('Noche liberada');
          close();
          ctx.refresh();
        } catch (err) {
          toast((err as Error).message, true);
        }
      }),
    );
  });
}
