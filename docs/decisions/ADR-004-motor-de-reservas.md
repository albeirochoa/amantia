# ADR-004 — Motor de reservas propio con Wompi

## Contexto

El North Star de Amantia son las reservas directas rentables (AGENTS.md §1). El roadmap dejó abierta la elección entre contratar un channel manager o construir un motor propio. El dueño entregó un prototipo CRO de baja fidelidad (`prototipo-booking-engine-cro-low-fi-v02.html`): búsqueda → resultados → detalle → extras → checkout con anticipo → pago con Wompi → confirmación, más los estados de pago fallido, retención vencida y sin disponibilidad.

## Decisión (dueño, 2026-11-10)

**Motor propio en la infraestructura actual de Cloudflare**, sin dependencias npm nuevas:

| Pieza | Implementación |
|---|---|
| Interfaz | `/reservas/`, `/reservas/confirmacion/` y `/reservas/pago-simulado/` (solo desarrollo) en Astro, con JS de cliente en `src/scripts/`. `noindex` y fuera del sitemap. |
| API | El Worker `amantia` (`worker/index.js` → `worker/booking/`) atiende `/api/reservas/*` y `/api/wompi/eventos`. |
| Datos | Cloudflare D1 `amantia-reservas` (`migrations/`). La tabla `booking_nights` tiene una fila por cabaña y noche, con PRIMARY KEY: la doble reserva es imposible a nivel de base de datos. |
| Pago | Wompi Web Checkout con firma de integridad, webhook firmado y conciliación al volver (`GET /transactions/{id}`). Por ahora **sandbox**. |
| Retención | 15 min por reserva (PROPOSAL); se extiende si Wompi informa un pago PENDING (PSE, Nequi). Máximo 2 retenciones activas por IP. |

Estados de la reserva: `hold` → `confirmed`, `hold` → `expired`. Si el pago llega tarde y la cabaña sigue libre, pasa a `confirmed`; si ya está ocupada, pasa a `conflict`, que exige reembolso manual.

## Diferencias deliberadas con el prototipo

- **Sin selector de huéspedes:** 2 personas fijas (capacidad CONFIRMED; roadmap).
- **Sin reseñas, estrellas ni "4,9/5":** no existen (HARD RULE 1). Se agregarán cuando haya reseñas reales.
- **Sin franja de confianza genérica**, sin emojis ni signos de exclamación (tono de CLAUDE.md). Trato de "ustedes".
- **Las tarjetas de cabaña usan el botón de contorno.** El dorado se reserva para la acción principal de cada pantalla.
- **Calendario en línea** en lugar de una hoja inferior. Marca las noches sin ninguna cabaña libre.
- **Sin disponibilidad:** el servidor propone hasta 3 fechas cercanas con las mismas noches, más un enlace a WhatsApp con las fechas ya escritas.
- **Extras** como paso propio entre la cabaña y los datos: decoración romántica, cena para dos y masaje para dos, a **$99.000 cada uno, por estadía** (dueño, 2026-11-10). Proveedor, anticipación mínima y qué incluye cada uno: `TODO`.
- **Tuteo** en todo el motor (dueño, 2026-11-10).

## Excepción a "sin JS de cliente" (CLAUDE.md)

El motor no funciona sin JavaScript. La excepción aplica **solo** a `/reservas/*`, y el resto del sitio sigue estático.

## Datos pendientes del dueño (bloquean abrir en producción)

- `TODO` **Tarifa definitiva por cabaña y noche.** Hoy rige una tarifa de **prueba de $100.000** (`scripts/seed-dev.sql`), aprobada por el dueño para la prueba también en producción.
- `TODO` **Anticipo:** 30 % es PROPOSAL del prototipo. Falta definir cuándo y cómo se paga el saldo.
- `TODO` **Política de cambios, cancelación y reembolso**, y horarios de check-in y check-out.
- ✅ **Estadía mínima:** 1 noche. **Primera noche reservable:** 15 de diciembre de 2026 (`BOOKING_OPENS_ON`). Dueño, 2026-11-10.
- `TODO` **Cuenta de Wompi productiva:** exige RUT/NIT y la misma razón social que la política de privacidad.
- `TODO` Nombres definitivos de las cabañas (hoy son provisionales).

## Panel de administración (MVP, 2026-11-10)

En **https://amantia.com.co/admin/**, con noindex, fuera del sitemap y sin enlaces. Código: `src/pages/admin/`, `src/scripts/admin.ts`, `worker/booking/admin.js`, `auth.js` y `mail.js`. Migración `0003_admin.sql`.

- **Ingreso:** enlace mágico al correo. Solo para `ADMIN_EMAILS` (hoy `h@albeiroochoa.com`); el enlace es de un solo uso y vence a los 15 minutos. La sesión dura 30 días en una cookie HttpOnly firmada con `ADMIN_SECRET` (secreto de wrangler). Las escrituras exigen JSON y el mismo origen (anti-CSRF). La pantalla de ingreso no revela qué correos están autorizados.
- **Pestañas:**
  - *Próximas:* reservas confirmadas, con enlace a WhatsApp y al correo del huésped, marcar el saldo como pagado y cancelar.
  - *En curso:* retenciones en pago y conflictos.
  - *Bloqueos:* bloquear o liberar noches por cabaña, con nota (WhatsApp, Airbnb…).
  - *Historial:* finalizadas y canceladas.
- **Aviso por correo a `NOTIFY_EMAIL`** cuando una reserva se confirma o queda en `conflict`.
- **Correo (2026-11-12):** el correo del dominio es **Zoho Mail de pago** (MX de Zoho), así que Cloudflare Email Routing no puede ir en el apex y Email Sending exige Workers Paid. Se envía por **SMTP de Zoho** (`worker/booking/smtp.js`, cliente mínimo sobre `cloudflare:sockets`, sin dependencias): `smtp.zoho.com:465`, remitente y usuario `hola@amantia.com.co`, con la **contraseña de aplicación** de Zoho en el secreto `SMTP_PASSWORD` (`wrangler secret put SMTP_PASSWORD`). Sin ese secreto, el envío cae al binding `EMAIL` (respaldo) y, si tampoco funciona, se registra el error sin romper el flujo. Los Workers no pueden usar el puerto 25.
- ✅ **Panel cerrado (2026-11-12):** `ADMIN_OPEN = "false"`; el ingreso es por enlace al correo `hola@amantia.com.co` (probado). `ADMIN_OPEN = "true"` lo abre sin contraseña y solo sirve como interruptor de emergencia en desarrollo.
- **Panel v2 (2026-11-12):** cuatro vistas con barra inferior en el celular y lateral en computador. Código en `src/scripts/admin/` (sin librerías de gráficos) y consultas en `worker/booking/admin-data.js`.
  - **Inicio:** llegadas, salidas y hospedados de hoy; saldos por cobrar; ocupación a 7 y 30 días (noches vendidas ÷ noches disponibles, sin contar bloqueos); ventas del mes; próximas llegadas; **por recuperar** (reservas que vencieron sin pago en los últimos 14 días, con botón de WhatsApp).
  - **Calendario:** una fila por cabaña y una columna por noche; toca una reserva para abrirla, una noche libre para bloquearla o una bloqueada para liberarla.
  - **Reservas:** búsqueda por nombre, teléfono, correo o código, con filtros de estado, fechas y cabaña. La **ficha** muestra la cuenta, los pagos de Wompi, el origen y una **nota interna**.
  - **Analítica:** ventas, tarifa promedio por noche (solo alojamiento), estancia y antelación promedio, % con extras, embudo, ocupación por cabaña, día de llegada, extras, origen del tráfico y demanda sin atender.
  - **Eventos anónimos** (`migrations/0004_analitica.sql`, tabla `events`): visita, búsqueda, cabaña elegida y paso al pago. No guardan IP, correo ni teléfono; el `sid` es un identificador aleatorio de la pestaña (`sessionStorage`). El origen sale de `utm_source` o del sitio de referencia. Cada reserva guarda su origen. El endpoint es público y no tiene límite de uso, así que alguien podría inflar las cifras; si pasa, agregar Turnstile o un tope por IP.
  - Se mide solo desde el 2026-11-12: lo anterior no tiene eventos.
  - **Estilo de herramienta (2026-11-12, decisión del dueño):** el panel conserva el logo y la paleta de Amantia, pero no imita el sitio público. Playfair solo en el logo y en las cifras grandes de las tarjetas; el resto en Inter, con botones y etiquetas en minúsculas. Estados con color semántico (verde confirmada, ámbar pagando, rojo requiere acción, gris cerrada) definidos como variables CSS con versión clara y oscura. Reservas es una tabla densa en computador y tarjetas en el celular. Las tarjetas de analítica comparan contra el período anterior y muestran una línea de tendencia. Los estados vacíos explican qué falta. El tema oscuro es opcional: sigue al sistema hasta que se elige uno con el botón de la barra, y se recuerda en el navegador (`amt_admin_theme`).
- **PWA solo del panel (2026-11-12):** `public/admin/manifest.webmanifest` (alcance `/admin/`), íconos generados desde `favicon.svg` y `public/admin/sw.js`. El service worker **no guarda nada en caché** (el panel muestra datos de huéspedes); solo permite instalar y muestra un aviso sin conexión. El resto del sitio **no** es PWA (decisión: sin beneficio para los visitantes y con riesgo de contenido desactualizado). En Android la sesión se comparte con Chrome, así que el enlace del correo funciona. En iPhone haría falta ingreso por código (la app instalada no comparte cookies con Safari). Notificaciones push: pendiente, etapa posterior.
- **Para agregar otro administrador:** sumar su correo a `ADMIN_EMAILS` y a `allowed_destination_addresses` en `wrangler.toml`, y verificarlo en Email Routing.
- **Cancelar no reembolsa:** el reembolso se hace en Wompi.

## Segunda entrega (pendiente)

1. Sincronización iCal con Airbnb y Booking. Importar como `booking_nights` con `source = 'ical:*'` y exportar un feed por cabaña.
2. Correo de confirmación al huésped. Requiere Cloudflare Email Sending con el dominio incorporado, porque Email Routing solo envía a direcciones verificadas.
3. Panel: tarifas por fecha y temporada, exportar a CSV y editar una reserva.
4. Turnstile en el formulario si aparecen retenciones abusivas.
5. Eventos de GTM. El dataLayer ya emite `booking_search`, `booking_select`, `booking_begin_payment` y `booking_confirmed`; faltan las etiquetas en GTM.

## Alternativas consideradas

- **Channel manager** (Cloudbeds, Lodgify, Hostaway…): menos código, pero con mensualidad o comisión, menos control del flujo y una marca ajena en el checkout.
- **Solo WhatsApp:** cero código, pero sin pago en línea ni disponibilidad visible.

## Consecuencias

- El Worker deja de ser "solo redirección". `run_worker_first = true` ya estaba activo.
- `wrangler.toml` lleva `BOOKING_ENABLED = "false"` y un `database_id` de relleno. **El deploy falla hasta crear la base real**, a propósito.
- Los secretos de Wompi van con `wrangler secret put` en producción y en `.dev.vars` en local (ignorado por git; plantilla en `.dev.vars.example`). HARD RULE 9.
- Sin channel manager, la doble reserva con las OTAs se evita con iCal (segunda entrega). **No publicar en OTAs y abrir el motor a la vez sin iCal activo.**

## Cómo correrlo en local

```bash
cp .dev.vars.example .dev.vars        # simulador de pagos, sin llaves
npm run db:migrate:local
npm run db:seed:local                 # tarifa de PRUEBA
npm run dev:reservas                  # build + wrangler dev → http://localhost:8787/reservas/
```

Para probar con Wompi sandbox: en `.dev.vars` poner `PAYMENT_PROVIDER=wompi` y las llaves `pub_test_…`, `test_integrity_…` y `test_events_…`. El webhook necesita una URL pública, así que en local la conciliación se hace al volver de Wompi.

## Producción (2026-11-10)

- Publicado en **https://amantia.com.co/reservas/**, versión del Worker `49210059` o posterior (la anterior, sin motor, era `2dfea178`: `npx wrangler rollback 2dfea178-75ce-4f1a-85ba-fa6cb05eb1cf`).
- **Sin enlaces desde el sitio** (decisión del dueño): no se agrega a NAV, CTAs ni sitemap. Tiene `noindex` y la API envía `X-Robots-Tag: noindex`.
- **Pasarela SIMULADA** (`PAYMENT_PROVIDER = "simulated"`) mientras no haya llaves de Wompi: cualquiera que llegue a la URL puede "confirmar" una reserva sin pagar, y el sitio lo avisa con "Modo de prueba".
- D1 `amantia-reservas` (id `9ae11049-…`, región ENAM), con las migraciones 0001 y 0002 aplicadas.

**Antes de abrir al público (checklist):**
1. Llaves de Wompi: `PAYMENT_PROVIDER = "wompi"`, `WOMPI_PUBLIC_KEY` y los secretos de integridad y eventos; configurar en Wompi la URL de eventos `https://amantia.com.co/api/wompi/eventos`.
2. **Borrar las reservas de prueba:** `DELETE FROM booking_nights WHERE source = 'booking'; DELETE FROM payment_events; DELETE FROM bookings;` (con `--remote`).
3. Tarifa definitiva, política de cancelación y anticipo.
4. Enlazar desde el sitio (CTA y NAV) y decidir si `/reservas/` pierde el `noindex` (HARD RULE 2 y 7).

## Estado

Aceptada (2026-11-10). Publicada en producción en modo de prueba, sin enlaces.
