# Auditoría inicial — 2026-10-06

Primera tarea del Agent Pack (`START-HERE.md`). Sin cambios estructurales: solo inventario, conflictos y plan.

## 1. Stack y estructura

- Astro 4 estático + Tailwind 3 + MailerLite. `CONFIRMED`
- Hosting: Cloudflare Worker `amantia` (Static Assets), dominios apex + www. `CONFIRMED` (ver `docs/decisions/ADR-001-stack.md`)
- Repo: `github.com/albeirochoa/amantia`, rama `main`. `CONFIRMED`
- Sin analytics, sin GTM, sin Search Console documentado. `TODO`

## 2. Inventario de rutas

| URL | Archivo | Estado |
|---|---|---|
| `/` | `src/pages/index.astro` | Landing v1.1 con 5 secciones + formulario de pre-registro Orígenes |

No existen todavía `/alojamientos/` ni ninguna landing BOFU/MOFU de `docs/seo/url-map.md`. No hay slugs publicados que proteger, salvo `/`.

## 3. SEO técnico (hallazgos)

- `robots.txt` apunta a `https://amantia.com.co/sitemap-index.xml`, pero el proyecto no genera sitemap (no está `@astrojs/sitemap`). `TODO`
- `og:image` y `twitter:image` son rutas relativas y el archivo `public/images/og-image.jpg` no existe. `TODO`
- No hay `src/pages/404.astro`, aunque `wrangler.toml` lo espera. `TODO`
- Sin schema.org (LocalBusiness / LodgingBusiness). `TODO`, pero solo con datos `CONFIRMED`.
- Canonical, title, description, `lang="es"`, H1 único: presentes. `CONFIRMED`

## 4. Funcional

- El build en `dist/` contiene `YOUR_ACCOUNT_ID` / `YOUR_FORM_ID`: no existe `.env`. El formulario no captura registros si se publica así. `TODO` (bloqueante)
- Estado real de producción en amantia.com.co: `TODO` verificar.
- Política de privacidad / habeas data (Ley 1581 de 2012) ausente; el sitio recoge emails. `TODO` (bloqueante antes de lanzar)

## 5. Datos del sitio que deben validarse (HARD RULE 1)

El copy actual afirma lo siguiente. Si vienen del documento/PPT del cliente, marcarlos `CONFIRMED`; si no, corregirlos:

| Afirmación | Ubicación | Estado |
|---|---|---|
| 90 km de Bogotá | `index.astro`, `Base.astro` | `CONFIRMED` (PPT) |
| Vereda Casa Vieja, Quebradanegra | `index.astro` | `CONFIRMED` (PPT) |
| 72 m² | `index.astro` | `CONFIRMED` (PPT) |
| Piscina al aire libre, jacuzzi calefactado | `index.astro` | `CONFIRMED` (PPT) |
| Productores con nombre (Don Hernán, Doña Lucía, familia García) | `index.astro` | `CONFIRMED` (PPT); `TODO` confirmar su permiso para nombrarlos |
| Cinco parejas sin costo (Orígenes) | `index.astro` | `CONFIRMED` (PPT) |
| Instagram `@amantiacundinamarca` | `index.astro` | `TODO` (el README ya pedía confirmarlo) |
| Fotos | `index.astro` | Placeholders de Unsplash, no son del lugar. `CONFIRMED` |

## 6. Conflictos entre el Agent Pack y el proyecto

1. **Vocabulario "glamping" vs "refugio".** `AGENTS.md` y el URL map giran en torno a "glamping" (`/glamping-para-parejas/`, etc.). El agente `amantia-content` y la identidad de marca dicen explícitamente **no** usar "glamping de lujo" ni "hotel", y sí "refugio". `TODO` decisión de negocio: ¿Amantia se posiciona en SEO como glamping (donde está la demanda de búsqueda) manteniendo "refugio" como voz de marca? Hasta decidirlo, no crear landings con "glamping".
2. **Objetivo actual vs North Star.** El plan maestro mide reservas directas; el sitio hoy capta pre-registros para Orígenes y no tiene reservas, precios ni alojamientos. No es contradicción, es fase: el embudo actual termina en `submit_form`.
3. **Tono.** Compatibles: ambos rechazan clichés ("experiencia mágica", "momento inolvidable"). El pack pide "detalles concretos y verificables", lo que refuerza la tabla del punto 5.
4. **Solapamiento de agentes.** `amantia-content` (voz de marca) vs `amantia-seo-content` (contenido para URLs SEO aprobadas); `amantia-deploy` (publicar) vs `amantia-developer` (implementar). Las descripciones en `.claude/agents/` ya delimitan cada uno.
5. **Precedencia.** Se fijó en `CLAUDE.md`: marca/tono/visual → `CLAUDE.md`; SEO/URLs/datos/proceso → `AGENTS.md`; choque → `TODO` y consulta.

## 7. Plan por fases (PROPOSAL)

**Fase A: lanzar el coming soon correctamente (bloqueantes)**
1. `.env` con las credenciales de MailerLite → build → probar un registro real.
2. Política de privacidad + checkbox/aviso de tratamiento de datos.
3. Validar los datos de la tabla 5.
4. OG image real con URL absoluta; `404.astro`; sitemap (o quitar la línea de `robots.txt`).
5. Deploy (`/deploy`), con la skill `pre-deploy-seo-qa` antes.

**Fase B: medición**
6. Analytics + evento `submit_form`; Search Console para amantia.com.co.

**Fase C: material real**
7. Fotos y video del lugar; reemplazar Unsplash.

**Fase D: investigación SEO (plan maestro, Fases 0–1)**
8. Resolver el conflicto 6.1 ("glamping" vs "refugio").
9. `amantia-seo-strategist` valida intención/SERP de las URLs P0; solo entonces briefs (`seo-page-brief`) y desarrollo.
10. Definir el modelo de alojamientos y el motor de reservas (ADR-002/003) antes de construir `/alojamientos/`.

## 8. Decisiones y cambios del 2026-10-06 (posteriores a la auditoría)

**Decisiones del dueño:**
- "Glamping" sí va como categoría → `docs/decisions/ADR-002-posicionamiento-glamping.md`. Conflicto 6.1 resuelto.
- Los datos del PPT son la fuente oficial → tabla 5 actualizada a `CONFIRMED (PPT)`.
- MailerLite queda descartado. Reemplazo: `TODO` (pendiente de decisión).

**Arreglos de SEO técnico aplicados:**
- `og:image` / `twitter:image` con URL absoluta (`Base.astro`).
- `public/images/og-image.jpg` provisional (1200x630, tipográfica con paleta de marca). Reemplazar por una con foto real cuando exista.
- `src/pages/404.astro` con `noindex` (lo que esperaba `wrangler.toml`). Se añadió `<slot name="head" />` en `Base.astro`.
- `src/pages/sitemap.xml.ts`: sitemap generado en build sin dependencias; `robots.txt` apunta a `/sitemap.xml`.
- `npm run build` verificado: genera `/`, `/404.html` y `/sitemap.xml`.
