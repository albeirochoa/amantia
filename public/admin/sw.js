// Service worker del panel (alcance: /admin/). Solo habilita la instalación como app.
// NO guarda nada en caché: el panel muestra datos de huéspedes y siempre debe venir del servidor.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  // Solo navegaciones: sin red, se muestra un aviso en lugar de datos viejos.
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(
          '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión</title><body style="font-family:Georgia,serif;background:#FAF8F3;color:#1A2A44;padding:48px 24px"><h1 style="font-weight:400">Sin conexión</h1><p style="font-family:Arial,sans-serif;line-height:1.6">El panel necesita internet para mostrar las reservas. Vuelve a intentarlo cuando tengas conexión.</p>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 },
        ),
    ),
  );
});
