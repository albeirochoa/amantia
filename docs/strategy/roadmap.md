# Roadmap de Amantia

**Última actualización:** 2026-10-13
**Hito que manda:** las cabañas terminan entre mediados de noviembre y mediados de diciembre de 2026 (`docs/strategy/datos-amantia.md`). El pico de búsquedas de glamping es en enero.

Leyenda: ✅ hecho · 🔄 en curso · ⏳ pendiente · 🔒 bloqueado

---

## Hecho

- ✅ Landing v1.1 (coming soon con 5 secciones).
- ✅ Agent Pack integrado; ADR-001 (stack), ADR-002 y ADR-003 (vocabulario y rol de la home).
- ✅ SEO técnico base: 404, sitemap, og-image provisional.
- ✅ Investigación SEO Fase 1 + estudios de Keyword Planner.
- ✅ Reparto de intenciones con QuebradaNegra.com.
- ✅ **Estructura de URLs aprobada y congelada** (`docs/seo/url-map.md`).
- ✅ Datos confirmados: 3 cabañas, 2 personas, 72 m², jacuzzi y piscina privados, cinema, recuperación corporal, ubicación y clima.
- ✅ Nombres de productores retirados del sitio (sin permiso).

## 1. Esta semana: desbloquear el pre-registro 🔒

Orígenes ocurre al terminar la obra; sin captura no se pueden elegir las parejas.

- ⏳ Elegir el reemplazo de MailerLite (recomendado: Cloudflare D1).
- ⏳ Política de privacidad (Ley 1581). Faltan el nombre o razón social, el NIT o la cédula y el correo.
- ⏳ Confirmar el Instagram `@amantiacundinamarca`.
- ⏳ Merge de la rama `agent-pack-integration` y deploy con la skill `pre-deploy-seo-qa` y un registro real de prueba.

## 2. Octubre–noviembre: diseño y construcción

- ⏳ Wireframes de 4 plantillas, mobile first: home, `/cabanas/`, landing SEO y `/origenes/`.
- ⏳ Sistema visual: extender la marca a fondos claros para lectura, componentes, espacios de imagen con proporciones fijas.
- ⏳ Fotos **reales del entorno** (vista, montaña, atardecer, camino, obra) + **renders** de las cabañas, marcados.
- ⏳ Colección de datos de cabañas (`src/content`) + layout de landing + componente de enlazado.
- ⏳ Construir las páginas de la Fase A: `/`, `/cabanas/`, `/glamping-cerca-de-bogota/`, `/glamping-con-jacuzzi/`, `/glamping-cerca-de-villeta/`, `/origenes/`, `/politica-de-privacidad/`.
- ⏳ Schema `LodgingBusiness` + frase-entidad en la home.
- ⏳ Datos pendientes para redactar: tiempo por carretera desde Bogotá y a Villeta, qué incluye la estadía, mascotas y niños, fecha de apertura.
- ⏳ **Publicar en noviembre** + Search Console y sitemap enviados desde el día 1.
- ⏳ Google Business Profile con fecha de apertura futura (fotos reales del entorno, no renders).

## 3. Paquetes: pedida de mano y aniversario

Cada paquete, cuando esté definido, tiene su URL (excepción de paquete en `docs/seo/url-map.md`). Mientras tanto, viven en la sección "Para celebrar" de la home y en las FAQ de `/cabanas/`.

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

- ⏳ Fin de obra → **sesión de fotos reales**, que reemplazan los renders. La lista de tomas se prepara en la etapa 2.
- ⏳ **SEO de imágenes con las fotos reales:** nombres de archivo con lugar y atributo (`amantia-cabana-piscina-privada-quebradanegra.webp`), alt con contexto, fotos en el schema y como og:image, mismas fotos en Google Business Profile, borrar los renders reemplazados.
- ⏳ **ADR-004 motor de reservas:** channel manager (sincroniza Airbnb y Booking, evita la doble reserva; recomendado) o motor propio. El buscador ocupa el lugar de la barra de datos bajo el hero y sin selector de huéspedes (2 personas fijas); nueva `/reservar/` (noindex).
- ⏳ Las 5 parejas de Orígenes viven Amantia; luego se cierra `/origenes/`.
- ⏳ Motor de reservas con disponibilidad por cabaña (ADR-004, Fase 5) → `/reservar/`.
- ⏳ Tarifas publicadas. Revisar si "de lujo" en los titles es coherente con el precio (ADR-003).
- ⏳ Fichas en OTAs (Airbnb y Booking exigen fotos reales).
- ⏳ Analítica + eventos (`submit_form`, `click_whatsapp`, `view_accommodation`…).

## 5. 2027: crecimiento

- ⏳ Marzo de 2027: revisar 3 meses de Search Console y decidir si abrir URLs de la Fase B (`url-map.md`).
- ⏳ Antes de agosto: campaña de Amor y Amistad con el paquete de aniversario.
- ⏳ PR digital: lograr que Amantia salga en las listas de "glamping cerca de Bogotá" de los medios.

## Coordinación con QuebradaNegra.com

Estos cambios son del otro repo; requieren aprobación allí.

- ⏳ `CTAAmantia` apuntando a la URL equivalente de Amantia, no a la raíz.
- ⏳ `stays.ts` y `site.ts`: nombre "Amantia", quitar "en desarrollo", NAP y geo coherentes.
- ⏳ `PROPOSAL`: guía "lugares para pedir matrimonio cerca de Bogotá", que enlaza a `/pedida-de-mano-cerca-de-bogota/` cuando exista.
- ⏳ Su guía romántica enlaza a `/cabanas/` y, cuando exista, al paquete de aniversario.
