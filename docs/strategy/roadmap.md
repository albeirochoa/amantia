# Roadmap de Amantia

**Última actualización:** 2026-10-15
**Hito que manda:** las cabañas terminan entre mediados de noviembre y mediados de diciembre de 2026 (`docs/strategy/datos-amantia.md`). El pico de búsquedas de glamping es en enero.
**Estado:** sitio v2 **publicado** en https://amantia.com.co el 2026-10-15 (`main`, versión de Worker `fa2e17a1`).

Leyenda: ✅ hecho · 🔄 en curso · ⏳ pendiente · 🔒 bloqueado · 👤 lo hace el dueño

---

## Hecho

**Estrategia y SEO**
- ✅ Agent Pack integrado: ADR-001 (stack), ADR-002 y ADR-003 con enmienda 1 (vocabulario: cabaña / refugio / glamping / de lujo; rol de la home).
- ✅ Investigación SEO Fase 1 con 5 estudios de Keyword Planner.
- ✅ Silos y reparto de intenciones con QuebradaNegra.com (Amantia = propiedad, QN = territorio).
- ✅ **Estructura de URLs aprobada y congelada** (`docs/seo/url-map.md`).
- ✅ Revisión de los agentes SEO, técnico y GEO aplicada (contraste, schema, FAQ sin duplicados, keywords en H2, landings ampliadas).

**Datos**
- ✅ Fuente única `datos-amantia.md`:
  - 3 cabañas (nombres provisionales: La calma, El encuentro, El instante), 2 personas, desde 72 m² con terraza;
  - jacuzzi y piscina privados, cinema, recuperación corporal, cocina, baño con tina exenta;
  - ubicación real 5.137415, -74.480506 y clima;
  - WhatsApp +57 312 631 1226.
- ✅ Datos del diseño tomados del PDF del arquitecto ("Refugio de Sombra", Japandi tropical).
- ✅ Nombres de productores retirados (sin permiso).

**Diseño y sitio**
- ✅ Wireframes y dirección visual clara: tonos claros dominantes, navy como texto, un botón dorado por pantalla.
- ✅ Sitio v2 en Astro: home, `/cabanas/`, 3 landings de glamping, `/origenes/` y `/politica-de-privacidad/` (estas dos con noindex), 404 y sitemap.
- ✅ Renders del arquitecto en WebP (800/1600) más 2 imágenes conceptuales etiquetadas; SEO básico de imágenes (alt con lugar, medidas, carga diferida).
- ✅ Schema LodgingBusiness, BreadcrumbList y FAQPage.
- ✅ Lista de apertura y Orígenes **por WhatsApp** (MailerLite retirado; formulario listo para activar).
- ✅ **Publicado en producción** (Cloudflare Workers) y verificado: todas las páginas responden 200, la 404 funciona, sitemap correcto.

## 1. Ahora: terminar el lanzamiento

- ✅ Redirección 301 `www.amantia.com.co` → `amantia.com.co`, hecha en `worker/index.js` (la Page Rule no actuaba sobre el custom domain del Worker).
- ✅ **Cloudflare Web Analytics** activo (configuración automática; el medidor se inserta en todas las páginas, verificado 2026-10-15).
- ✅ **Google Search Console:** propiedad de dominio `amantia.com.co` verificada por DNS (2026-10-15).
- ⏳ 👤 En Search Console: enviar `sitemap.xml` y solicitar la indexación de las 5 URLs.
- ⏳ **Política de privacidad definitiva** (Ley 1581). Hoy es provisional. Faltan el nombre o razón social del responsable, el NIT o la cédula y el correo de datos.
- ⏳ 👤 **Confirmar el Instagram** `@amantiacundinamarca` → mostrarlo en el footer y agregarlo a `sameAs`.
- ⏳ **Sistema de captura** (recomendado Cloudflare D1): endpoint `/api/lista` + `SITE.captureEnabled = true`. Mientras tanto funciona por WhatsApp.
- ⏳ Eventos de analítica: `click_whatsapp` (los enlaces ya llevan `data-event`), y `submit_form` cuando haya captura.

## 2. Octubre–noviembre: presencia local y contenido

- ⏳ **Ficha de Google Business Profile** (pedida por el dueño el 2026-10-15). Datos para crearla:
  - **Nombre:** `Amantia`, sin "Glamping" ni palabras extra (Google penaliza el relleno en el nombre y hay que diferenciarse de "Glamping Quebradanegra", el vecino).
  - **Ubicación (pin):** 5.137415, -74.480506 · vereda Casa Vieja, Quebradanegra, Cundinamarca · [Google Maps](https://www.google.com/maps?q=5.137415,-74.480506). Nunca "Villeta".
  - **Categoría principal:** Cabaña (o Alojamiento / Hospedaje). Secundarias según lo que ofrezca Google.
  - **Sitio web:** https://amantia.com.co/ · **Teléfono / WhatsApp:** +57 312 631 1226.
  - **Fecha de apertura:** futura (Google permite hasta 90 días antes). `TODO`: fecha estimada.
  - **Descripción** (≤750 caracteres, a partir de la frase-entidad): tres cabañas privadas para parejas, desde 72 m² con terraza, jacuzzi calefactado y piscina propios, cinema privado, a 90 km de Bogotá. Sin "lujo" declarado, sin clichés.
  - **Atributos:** solo los confirmados (piscina privada, jacuzzi, para parejas…).
  - **Fotos:** **solo reales** (Google no acepta renders): entorno, vista y obra ahora; las cabañas al terminar la obra.
  - **Verificación:** Google pedirá postal, video o llamada; hay que tener acceso físico al lugar.
  - **Después:** agregar la URL de la ficha a `sameAs` en el schema de la home y al directorio de QuebradaNegra.com (mismo nombre y dirección).
- ⏳ 👤 **Fotos reales del entorno y de la obra** (vista, montaña, atardecer, camino) para Google Business Profile y para la sección "La obra hoy".
- ⏳ **Datos para ampliar las landings** (hoy tienen 366–436 palabras; la meta es 550–750):
  - tiempo por carretera desde Bogotá y a Villeta;
  - qué incluye la estadía;
  - mascotas y niños;
  - fecha de apertura;
  - temperatura del jacuzzi;
  - vista de cada cabaña y cuál es la más grande.
- ⏳ **RNT** (Registro Nacional de Turismo) con el mismo nombre y dirección, antes de abrir.

## 3. Paquetes: pedida de mano y aniversario

Cada paquete, cuando esté definido, tiene su URL (excepción de paquete en `docs/seo/url-map.md`). Mientras tanto viven en la sección "Para celebrar" de la home y en las FAQ.

| Paquete | Definir antes de | URL | Por qué esa fecha |
|---|---|---|---|
| **Pedida de mano** | **1 de diciembre de 2026** | `/pedida-de-mano-cerca-de-bogota/` (página de oferta) | Pico de pedidas en dic–ene: "pedida de mano" 720 → **1.300** en enero |
| **Celebración de aniversario** | **Enero de 2027** (página indexada antes de agosto) | `/plan-aniversario-cerca-de-bogota/` (página SEO, ≈480/mes) | Demanda estable todo el año. Pico romántico: **Amor y Amistad (septiembre)** |

**Ficha para definir cada paquete (dueño):**
- [ ] Nombre del paquete.
- [ ] Qué incluye (decoración, cena, flores, bebida, fotógrafo, sorpresa…) y quién lo provee.
- [ ] Precio o rango, y si se suma a la tarifa de la cabaña.
- [ ] Anticipación mínima para reservarlo.
- [ ] Qué puede personalizar la pareja.
- [ ] Política de cancelación o cambios.
- [ ] Fotos o renders del montaje.

**Cuando la ficha esté completa:** brief SEO (skill `seo-page-brief`) → página → enlace desde la home, `/cabanas/` y la guía romántica de QuebradaNegra → campaña en Instagram.

## 4. Diciembre–enero: apertura

- ⏳ Fin de obra → **sesión de fotos reales**, que reemplazan los renders y las imágenes conceptuales.
- ⏳ **SEO de imágenes con las fotos reales:**
  - nombres de archivo con lugar y atributo (`amantia-cabana-piscina-privada-quebradanegra.webp`) y alt con contexto;
  - fotos en el schema y como og:image;
  - las mismas fotos en Google Business Profile;
  - borrar los renders reemplazados.
- ⏳ **Nombres definitivos, vistas y medidas de cada cabaña** → páginas `/cabanas/[slug]/` (la condición ya se cumple: son distintas).
- ⏳ **ADR-004 motor de reservas:**
  - opciones: channel manager (sincroniza Airbnb y Booking y evita la doble reserva; **recomendado**) o motor propio;
  - el buscador reemplaza la barra de datos bajo el hero, sin selector de huéspedes (2 personas fijas);
  - nueva página `/reservar/` (noindex).
- ⏳ Las 5 parejas de Orígenes viven Amantia; luego se cierra `/origenes/`.
- ⏳ Tarifas publicadas. Revisar si "de lujo" en los titles es coherente con el precio (ADR-003).
- ⏳ Fichas en OTAs (Airbnb y Booking exigen fotos reales), con el mismo nombre y dirección.

## 5. 2027: crecimiento

- ⏳ Marzo de 2027: revisar 3 meses de Search Console y decidir si abrir URLs de la Fase B (`url-map.md`).
- ⏳ Antes de agosto: campaña de Amor y Amistad con el paquete de aniversario.
- ⏳ PR digital: lograr que Amantia salga en las listas de "glamping cerca de Bogotá" de los medios.

## Coordinación con QuebradaNegra.com

Estos cambios son del otro repo (`C:\proyectos\quebradanegra\quebradanegra`) y requieren aprobación allí.

- ⏳ `stays.ts` y `site.ts`:
  - nombre **"Amantia"** (hoy dice "Amantia Glamping");
  - quitar "en desarrollo";
  - dirección `Vereda Casa Vieja, Quebradanegra, Cundinamarca` y geo `5.137415, -74.480506`;
  - descripción con los hechos (3 cabañas, jacuzzi y piscina propios, 90 km de Bogotá).
- ⏳ `CTAAmantia` hacia la URL equivalente de Amantia, con texto exacto (la palanca real de posicionamiento):
  - `/glamping/cerca-de-bogota/` → `/glamping-cerca-de-bogota/` ("glamping cerca a Bogotá");
  - `/villeta/glamping/` → `/glamping-cerca-de-villeta/` ("glamping Villeta");
  - directorio y guía romántica → `/cabanas/`.
- ⏳ `PROPOSAL`: guía "lugares para pedir matrimonio cerca de Bogotá", que enlace a `/pedida-de-mano-cerca-de-bogota/` cuando exista.
- ⏳ Enlace desde Amantia hacia QuebradaNegra.com (ya existe en "El lugar" y en las landings).
