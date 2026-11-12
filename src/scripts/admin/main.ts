// Panel de reservas: ingreso, navegación entre vistas y actualización de datos.
import { api, ApiError } from '../reservas-comun';
import { renderAnalitica } from './analitica';
import { renderCalendario } from './calendario';
import { openDetail } from './detalle';
import { renderInicio } from './inicio';
import { renderReservas } from './reservas';
import { $, Ctx, esc, toast } from './ui';

type View = 'inicio' | 'calendario' | 'reservas' | 'analitica';
const VIEWS: View[] = ['inicio', 'calendario', 'reservas', 'analitica'];
const RENDER: Record<View, (el: HTMLElement, ctx: Ctx) => Promise<void>> = {
  inicio: renderInicio,
  calendario: renderCalendario,
  reservas: renderReservas,
  analitica: renderAnalitica,
};

/** Tema claro/oscuro: respeta el del sistema hasta que la persona elige uno (se recuerda en este navegador). */
function initTheme() {
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const paint = () => {
    const dark = root.dataset.theme === 'dark';
    meta?.setAttribute('content', dark ? '#0f1626' : '#1A2A44');
    const btn = document.getElementById('btn-tema');
    btn?.setAttribute('aria-pressed', String(dark));
    btn?.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  };
  paint();
  document.getElementById('btn-tema')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('amt_admin_theme', next);
    } catch {
      /* sin almacenamiento: el cambio vale solo para esta visita */
    }
    paint();
  });
}

export function initAdmin() {
  initTheme();
  // PWA: habilita la instalación como app (el service worker no guarda datos en caché).
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' }).catch(() => {});

  let current: View = 'inicio';
  let params: Record<string, string> = {};
  let token = 0; // descarta respuestas de vistas que ya no se están mostrando

  const stage = (v: 'login' | 'app' | 'cargando') => {
    document.querySelectorAll<HTMLElement>('[data-vista]').forEach((s) => (s.hidden = s.dataset.vista !== v));
    $('#sesion').hidden = v !== 'app';
  };

  const ctx: Ctx = {
    open: (ref) => openDetail(ref, () => show(current)),
    go: (view, p = {}) => navigate(view, p),
    refresh: () => show(current),
    get params() {
      return params;
    },
  };

  function paintNav() {
    document.querySelectorAll<HTMLElement>('[data-nav]').forEach((b) => {
      const on = b.dataset.nav === current;
      b.setAttribute('aria-current', on ? 'page' : 'false');
    });
  }

  async function show(view: View) {
    current = view;
    paintNav();
    const my = ++token;
    const el = $(`[data-view="${view}"]`);
    VIEWS.forEach((v) => (($(`[data-view="${v}"]`) as HTMLElement).hidden = v !== view));
    const scrollY = window.scrollY;
    try {
      await RENDER[view](el, ctx);
      if (my === token) window.scrollTo({ top: scrollY });
    } catch (err) {
      if (my !== token) return;
      if (err instanceof ApiError && err.status === 401) return stage('login');
      el.innerHTML = `<p class="text-[15px] text-bad" role="alert">${esc((err as Error).message)}</p>`;
    }
  }

  function navigate(view: View, p: Record<string, string> = {}) {
    params = p;
    history.pushState({ view }, '', `#${view}`);
    window.scrollTo({ top: 0 });
    show(view);
  }

  window.addEventListener('popstate', () => {
    const h = location.hash.replace('#', '') as View;
    params = {};
    show(VIEWS.includes(h) ? h : 'inicio');
  });
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach((b) =>
    b.addEventListener('click', () => navigate(b.dataset.nav as View)),
  );

  // ── Ingreso ──────────────────────────────────────────────────────────────
  $('#form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const btn = form.querySelector('button')!;
    btn.disabled = true;
    try {
      const r = await api<{ message: string; devLink?: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: new FormData(form).get('email') }),
      });
      $('#msg-login').innerHTML = esc(r.message) + (r.devLink ? `<br><a class="underline" href="${esc(r.devLink)}">Enlace de desarrollo</a>` : '');
    } catch (err) {
      $('#msg-login').textContent = (err as Error).message;
    } finally {
      setTimeout(() => (btn.disabled = false), 5000);
    }
  });

  $('#btn-salir').addEventListener('click', async () => {
    await api('/api/admin/salir', { method: 'POST', body: '{}' }).catch(() => {});
    stage('login');
  });

  // ── Arranque ─────────────────────────────────────────────────────────────
  (async () => {
    stage('cargando');
    const link = new URLSearchParams(location.search).get('entrar');
    if (link) {
      history.replaceState(null, '', location.pathname); // el enlace no queda en el historial
      try {
        await api('/api/admin/verificar', { method: 'POST', body: JSON.stringify({ token: link }) });
      } catch (err) {
        stage('login');
        $('#msg-login').textContent = (err as Error).message;
        return;
      }
    }
    try {
      const s = await api<{ admin: string; open: boolean }>('/api/admin/sesion');
      $('#admin-email').textContent = s.admin;
      $('#btn-salir').hidden = s.open;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return stage('login');
      stage('login');
      return toast((err as Error).message, true);
    }
    stage('app');
    const h = location.hash.replace('#', '') as View;
    await show(VIEWS.includes(h) ? h : 'inicio');
  })();
}
