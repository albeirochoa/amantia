// Lógica de /reservas/: calendario, cabañas libres, extras, datos y salto al pago.
import { addDays, api, ApiError, diffDays, fmtDate, logEvent, money, nightsLabel, origen, toUTC, track, waUrl } from './reservas-comun';

type Step = 'fechas' | 'cabanas' | 'extras' | 'datos' | 'cerrado';
interface Extra { id: string; name: string; description: string; priceCop: number }
interface Calendar {
  mode: 'simulated' | 'sandbox' | 'production';
  earliest: string;
  latest: string;
  minNights: number;
  maxNights: number;
  depositPercent: number;
  holdMinutes: number;
  extras: Extra[];
  bookableCabins: number;
  fullNights: string[];
}
interface Quote { id: string; name: string; nightlyRate: number; total: number; deposit: number }
interface Availability { checkIn: string; checkOut: string; nights: number; cabins: Quote[]; alternatives: { llegada: string; salida: string; fromTotal: number }[] }
interface Media { src: string; srcset: string; alt: string; label: string; tagline: string; size: string }

const PROGRESS: Record<Step, number> = { fechas: 0, cabanas: 1, extras: 2, datos: 3, cerrado: -1 };
const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;

export function initReservar() {
  const data = JSON.parse($('#datos-motor').textContent || '{}') as { media: Record<string, Media>; whatsapp: string };
  let cal: Calendar;
  const full = new Set<string>();
  let loadedUntil = '';
  let checkIn: string | null = null;
  let checkOut: string | null = null;
  let picking: 'in' | 'out' = 'in';
  let month = ''; // YYYY-MM-01 visible
  let avail: Availability | null = null;
  let chosen: Quote | null = null;
  const selectedExtras = new Set<string>();

  // ── Navegación entre pasos (el botón atrás del navegador funciona) ──────────
  function show(step: Step, push = true) {
    if ((step === 'cabanas' && !avail) || ((step === 'extras' || step === 'datos') && !chosen)) step = 'fechas';
    document.querySelectorAll<HTMLElement>('[data-step]').forEach((s) => (s.hidden = s.dataset.step !== step));
    document.querySelectorAll<HTMLElement>('[data-progress]').forEach((li) =>
      li.classList.toggle('activo', Number(li.dataset.progress) <= PROGRESS[step]),
    );
    if (push) history.pushState({ step }, '', `#${step}`);
    window.scrollTo({ top: 0 });
    $<HTMLElement>(`[data-step="${step}"] h1`)?.focus?.();
  }
  window.addEventListener('popstate', (e) => show((e.state?.step as Step) || 'fechas', false));
  document.querySelectorAll<HTMLElement>('[data-goto]').forEach((b) =>
    b.addEventListener('click', () => show(b.dataset.goto as Step)),
  );
  document.querySelectorAll('[data-step] h1').forEach((h) => h.setAttribute('tabindex', '-1'));

  function closed(message?: string) {
    if (message) $('#msg-cerrado').textContent = message;
    show('cerrado', false);
    history.replaceState({ step: 'cerrado' }, '', location.pathname);
  }

  // ── Calendario ──────────────────────────────────────────────────────────
  /** Carga 120 días de noches llenas desde `from` (sin `from`: desde la primera fecha reservable). */
  async function loadFull(from?: string) {
    const qs = from ? `?desde=${from}&hasta=${addDays(from, 120)}` : '';
    const r = await api<Calendar>(`/api/reservas/calendario${qs}`);
    r.fullNights.forEach((n) => full.add(n));
    const to = addDays(from || r.earliest, 120);
    loadedUntil = to > loadedUntil ? to : loadedUntil;
    return r;
  }

  const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  function rangeHasFullNight(a: string, b: string) {
    for (let d = a; d < b; d = addDays(d, 1)) if (full.has(d)) return true;
    return false;
  }

  function dayState(d: string) {
    if (d < cal.earliest || d > cal.latest) return { enabled: false };
    if (picking === 'out' && checkIn && d > checkIn) {
      const n = diffDays(checkIn, d);
      return { enabled: n <= cal.maxNights && !rangeHasFullNight(checkIn, d) };
    }
    return { enabled: !full.has(d) && d < cal.latest };
  }

  async function renderCalendar() {
    const last = addDays(addDays(month.slice(0, 8) + '28', 4).slice(0, 8) + '01', -1); // último día del mes
    if (last > loadedUntil && loadedUntil < cal.latest) {
      try { await loadFull(loadedUntil); } catch { /* si falla, se muestra sin marcar */ }
    }
    const ml = monthLabel.format(toUTC(month));
    $('#cal-month').textContent = ml.charAt(0).toUpperCase() + ml.slice(1);
    $<HTMLButtonElement>('#cal-prev').disabled = month <= cal.earliest.slice(0, 8) + '01';
    $<HTMLButtonElement>('#cal-next').disabled = addDays(last, 1) > cal.latest;

    const grid = $('#cal-grid');
    grid.innerHTML = '';
    const offset = (toUTC(month).getUTCDay() + 6) % 7; // semana empieza el lunes
    for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('span'));
    for (let d = month; d <= last; d = addDays(d, 1)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dia';
      b.textContent = String(Number(d.slice(8)));
      b.dataset.date = d;
      const { enabled } = dayState(d);
      b.disabled = !enabled;
      if (full.has(d) && d >= cal.earliest) b.classList.add('lleno');
      if (d === checkIn || d === checkOut) b.classList.add('extremo');
      else if (checkIn && checkOut && d > checkIn && d < checkOut) b.classList.add('rango');
      b.setAttribute('aria-label', `${fmtDate(d)}${full.has(d) ? ', sin cabañas libres' : ''}`);
      b.setAttribute('aria-pressed', String(d === checkIn || d === checkOut));
      b.addEventListener('click', () => pickDay(d));
      grid.appendChild(b);
    }
    updateDateSummary();
  }

  function pickDay(d: string) {
    $('#error-fechas').textContent = '';
    if (picking === 'in' || !checkIn || d <= checkIn) {
      checkIn = d;
      checkOut = null;
      picking = 'out';
    } else {
      const n = diffDays(checkIn, d);
      if (n < cal.minNights) {
        $('#error-fechas').textContent = `La estadía mínima es de ${nightsLabel(cal.minNights)}.`;
        return;
      }
      checkOut = d;
      picking = 'in';
    }
    renderCalendar();
  }

  function updateDateSummary() {
    $('#lbl-in').textContent = checkIn ? fmtDate(checkIn) : 'Elegir';
    $('#lbl-out').textContent = checkOut ? fmtDate(checkOut) : 'Elegir';
    $('#resumen-fechas').textContent =
      checkIn && checkOut ? `${nightsLabel(diffDays(checkIn, checkOut))} · 2 personas` : checkIn ? 'Ahora elige la salida.' : '';
    $<HTMLButtonElement>('#btn-buscar').disabled = !(checkIn && checkOut);
  }

  $('#cal-prev').addEventListener('click', () => {
    month = addDays(month, -1).slice(0, 8) + '01';
    renderCalendar();
  });
  $('#cal-next').addEventListener('click', () => {
    month = addDays(month, 32).slice(0, 8) + '01';
    renderCalendar();
  });
  document.querySelectorAll<HTMLElement>('[data-pick]').forEach((b) =>
    b.addEventListener('click', () => {
      picking = b.dataset.pick === 'out' && checkIn ? 'out' : 'in';
      renderCalendar();
      $('#cal-grid').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }),
  );

  // ── Paso 2: cabañas libres ───────────────────────────────────────────────
  async function search(ci: string, co: string) {
    const btn = $<HTMLButtonElement>('#btn-buscar');
    btn.disabled = true;
    btn.textContent = 'Buscando…';
    try {
      avail = await api<Availability>(`/api/reservas/disponibilidad?llegada=${ci}&salida=${co}`);
      checkIn = ci;
      checkOut = co;
      track('booking_search', { check_in: ci, nights: avail.nights, results: avail.cabins.length });
      renderCabins();
      show('cabanas');
    } catch (e) {
      $('#error-fechas').textContent = (e as Error).message;
    } finally {
      btn.textContent = 'Ver cabañas libres';
      updateDateSummary();
    }
  }
  $('#btn-buscar').addEventListener('click', () => checkIn && checkOut && search(checkIn, checkOut));

  function renderCabins() {
    if (!avail) return;
    const { cabins, nights, alternatives } = avail;
    $('#chip-fechas').textContent = `${fmtDate(avail.checkIn)} – ${fmtDate(avail.checkOut)} · ${nightsLabel(nights)} · 2 personas`;
    const list = $('#lista-cabanas');
    list.innerHTML = '';
    $('#sin-disponibilidad').hidden = cabins.length > 0;

    if (!cabins.length) {
      $('#t-cabanas').textContent = 'Esas noches ya están tomadas.';
      $('#sub-cabanas').textContent = alternatives.length
        ? 'Estas fechas cercanas tienen cabañas libres, con la misma cantidad de noches.'
        : 'No encontramos fechas libres cerca. Prueba otras fechas o escríbenos.';
      const alt = $('#lista-alternativas');
      alt.innerHTML = '';
      for (const a of alternatives) {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between gap-4 border border-linen bg-paper px-5 py-4';
        li.innerHTML = `<div><p class="text-[17px]">${fmtDate(a.llegada)} – ${fmtDate(a.salida)}</p>
          <p class="text-[14px] text-ink-muted">Desde ${money(a.fromTotal)} en total</p></div>`;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn-outline min-h-[44px] px-5';
        b.textContent = 'Ver';
        b.addEventListener('click', () => search(a.llegada, a.salida));
        li.appendChild(b);
        alt.appendChild(li);
      }
      const wa = $<HTMLAnchorElement>('#wa-sin-disp');
      wa.href = waUrl(data.whatsapp, `Hola, queremos venir a Amantia del ${fmtDate(avail.checkIn)} al ${fmtDate(avail.checkOut)} (2 personas). ¿Tienen alguna opción?`);
      return;
    }

    $('#t-cabanas').textContent = cabins.length === 1 ? 'Queda una cabaña libre.' : `${cabins.length === 3 ? 'Las tres cabañas están' : 'Dos cabañas están'} libres.`;
    $('#sub-cabanas').textContent = 'Todas tienen piscina y jacuzzi privados. Cada una tiene su propia vista, y una es un poco más amplia.';
    for (const c of cabins) {
      const m = data.media[c.id];
      const li = document.createElement('li');
      li.className = 'grid md:grid-cols-2 gap-0 bg-sand';
      li.innerHTML = `
        <div class="relative bg-linen aspect-[4/3] overflow-hidden">
          ${m ? `<img src="${m.src}" srcset="${m.srcset}" sizes="(min-width: 768px) 384px, 100vw" alt="${m.alt}" loading="lazy" decoding="async" class="h-full w-full object-cover" />
          <span class="absolute bottom-3 right-3 bg-paper/90 px-2.5 py-1 text-[11px] tracking-[0.12em] uppercase">${m.label}</span>` : ''}
        </div>
        <div class="p-6 flex flex-col">
          <h2 class="font-serif font-normal text-[28px] leading-tight">${c.name}</h2>
          ${m ? `<p class="mt-3 text-[15px] leading-[1.7] text-ink-muted">${m.tagline}</p>
          <p class="mt-3 text-[12px] tracking-[0.1em] uppercase">${m.size} · jacuzzi y piscina privados</p>` : ''}
          <div class="mt-auto pt-6">
            <p class="text-[14px] text-ink-muted">${money(c.nightlyRate)} por noche</p>
            <p class="text-[22px] font-serif">${money(c.total)} <span class="text-[14px] font-sans text-ink-muted">en total</span></p>
          </div>
        </div>`;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-outline mt-5';
      b.textContent = `Elegir ${c.name}`;
      b.addEventListener('click', () => choose(c));
      li.lastElementChild!.appendChild(b);
      list.appendChild(li);
    }
  }

  // ── Paso 3: extras ───────────────────────────────────────────────────────
  const extrasTotal = () => cal.extras.filter((e) => selectedExtras.has(e.id)).reduce((t, e) => t + e.priceCop, 0);
  const deposit = (total: number) => Math.round((total * cal.depositPercent) / 100); // misma fórmula que el servidor

  function choose(c: Quote) {
    chosen = c;
    selectedExtras.clear();
    track('booking_select', { cabin: c.id, value: c.total, currency: 'COP' });
    if (!cal.extras.length) return toDatos();
    renderExtras();
    show('extras');
  }

  function renderExtras() {
    const list = $('#lista-extras');
    list.innerHTML = '';
    for (const e of cal.extras) {
      const on = selectedExtras.has(e.id);
      const li = document.createElement('li');
      li.className = 'flex items-start justify-between gap-5 border-b border-linen py-5';
      li.innerHTML = `<div><h2 class="font-serif font-normal text-[22px] leading-tight">${e.name}</h2>
        <p class="mt-1 text-[15px] leading-[1.6] text-ink-muted">${e.description}</p>
        <p class="mt-2 text-[15px]">+ ${money(e.priceCop)}</p></div>`;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = on ? 'btn-outline min-h-[44px] px-5 shrink-0 bg-navy text-paper border-navy' : 'btn-outline min-h-[44px] px-5 shrink-0';
      b.textContent = on ? 'Agregado' : 'Agregar';
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', `${on ? 'Quitar' : 'Agregar'} ${e.name}`);
      b.addEventListener('click', () => {
        if (selectedExtras.has(e.id)) selectedExtras.delete(e.id);
        else selectedExtras.add(e.id);
        renderExtras();
      });
      li.appendChild(b);
      list.appendChild(li);
    }
    $('#total-extras').innerHTML = `<span>Total</span><span>${money(chosen!.total + extrasTotal())}</span>`;
  }
  $('#btn-extras').addEventListener('click', () => toDatos());
  $('#btn-sin-extras').addEventListener('click', () => {
    selectedExtras.clear();
    toDatos();
  });

  // ── Paso 4: datos y pago ─────────────────────────────────────────────────
  function toDatos() {
    const c = chosen!;
    const extras = cal.extras.filter((e) => selectedExtras.has(e.id));
    const total = c.total + extrasTotal();
    const dep = deposit(total);
    $('#resumen-reserva').innerHTML = `
      <div class="flex justify-between gap-4"><p class="font-serif text-[22px]">${c.name}</p>
        <button type="button" class="underline underline-offset-4 text-[14px]" data-back="cabanas">Cambiar</button></div>
      <p class="mt-1 text-[15px] text-ink-muted">${fmtDate(avail!.checkIn)} – ${fmtDate(avail!.checkOut)} · ${nightsLabel(avail!.nights)} · 2 personas</p>
      <dl class="mt-5 grid grid-cols-[1fr_auto] gap-y-2 text-[15px]">
        <dt>Alojamiento</dt><dd class="text-right">${money(c.total)}</dd>
        ${extras.map((e) => `<dt>${e.name}</dt><dd class="text-right">${money(e.priceCop)}</dd>`).join('')}
        ${cal.extras.length ? `<dt class="col-span-2"><button type="button" class="underline underline-offset-4 text-[14px]" data-back="extras">${extras.length ? 'Editar extras' : 'Agregar extras'}</button></dt>` : ''}
        <dt class="pt-3 border-t border-linen font-normal">Total</dt><dd class="pt-3 border-t border-linen text-right font-normal">${money(total)}</dd>
        <dt>Pagas hoy (${cal.depositPercent} %)</dt><dd class="text-right font-normal">${money(dep)}</dd>
        <dt class="text-ink-muted">Saldo</dt><dd class="text-right text-ink-muted">${money(total - dep)}</dd>
      </dl>`;
    $('#resumen-reserva').querySelectorAll<HTMLElement>('[data-back]').forEach((b) =>
      b.addEventListener('click', () => {
        if (b.dataset.back === 'extras') renderExtras();
        show(b.dataset.back as Step);
      }),
    );
    $('#btn-pagar').textContent = `Pagar ${money(dep)}`;
    show('datos');
  }

  const form = $<HTMLFormElement>('#form-datos');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!chosen || !avail) return show('fechas');
    form.querySelectorAll<HTMLElement>('[data-error]').forEach((el) => (el.textContent = ''));
    form.querySelectorAll('input').forEach((i) => i.removeAttribute('aria-invalid'));
    $('#error-datos').textContent = '';

    const fd = new FormData(form);
    const payload = {
      cabana: chosen.id,
      llegada: avail.checkIn,
      salida: avail.checkOut,
      nombre: fd.get('nombre'),
      apellido: fd.get('apellido'),
      email: fd.get('email'),
      telefono: fd.get('telefono'),
      aceptaCondiciones: fd.get('aceptaCondiciones') === 'on',
      extras: [...selectedExtras],
      fuente: origen().fuente,
      medio: origen().medio,
    };
    const btn = $<HTMLButtonElement>('#btn-pagar');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Separando la cabaña…';
    try {
      const r = await api<{ ref: string; token: string; payment: { url: string } }>('/api/reservas', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      track('booking_begin_payment', { cabin: chosen.id, value: deposit(chosen.total + extrasTotal()), extras: [...selectedExtras], currency: 'COP', booking_ref: r.ref });
      location.href = r.payment.url;
    } catch (err) {
      btn.disabled = false;
      btn.textContent = label;
      if (err instanceof ApiError && err.fields) {
        for (const [k, msg] of Object.entries(err.fields)) {
          const el = form.querySelector<HTMLElement>(`[data-error="${k}"]`);
          if (el) el.textContent = msg;
          form.querySelector(`[name="${k}"]`)?.setAttribute('aria-invalid', 'true');
        }
        form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
        return;
      }
      if (err instanceof ApiError && err.code === 'taken') {
        await search(avail.checkIn, avail.checkOut);
        $('#sub-cabanas').textContent = err.message;
        return;
      }
      $('#error-datos').textContent = (err as Error).message;
    }
  });

  // ── Arranque ─────────────────────────────────────────────────────────────
  (async () => {
    history.replaceState({ step: 'fechas' }, '', location.pathname + location.search);
    document.querySelector('[data-progress="0"]')?.classList.add('activo');
    try {
      cal = await loadFull();
    } catch (e) {
      return closed(e instanceof ApiError && e.code === 'disabled' ? undefined : 'No pudimos cargar la disponibilidad. Escríbenos por WhatsApp y te ayudamos.');
    }
    if (!cal.bookableCabins) return closed();
    if (cal.mode !== 'production') {
      $('#banner-prueba').hidden = false;
      $('#banner-detalle').textContent = cal.mode === 'simulated' ? 'Pasarela de pago simulada: las reservas no son reales.' : 'Wompi en modo sandbox.';
    }
    logEvent('visit');
    month = cal.earliest.slice(0, 8) + '01';
    // Fechas precargadas desde un enlace: /reservas/?llegada=2027-01-15&salida=2027-01-17
    const qs = new URLSearchParams(location.search);
    const ci = qs.get('llegada');
    const co = qs.get('salida');
    if (ci && co && ci >= cal.earliest && co > ci) {
      checkIn = ci;
      checkOut = co;
      month = ci.slice(0, 8) + '01';
    }
    await renderCalendar();
  })();
}
