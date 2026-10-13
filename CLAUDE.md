# Amantia · Contexto del Proyecto

Este es el sitio web de **Amantia**, un refugio para parejas en Quebradanegra, Cundinamarca, Colombia. Esta primera fase es el coming soon para capturar pre-registros del programa Orígenes.

## Reglas globales y estrategia (Agent Pack)

@AGENTS.md

Documentación de referencia (leer antes de cambios de estrategia, SEO o URLs):

- `docs/strategy/amantia-master-plan.md` — North Star, clústeres, fases 0–13
- `docs/seo/seo-governance.md` — reglas de creación de URLs y anti-canibalización
- `docs/seo/url-map.md` — mapa de URLs P0/P1/P2
- `docs/seo/redirects.md` — registro obligatorio de cambios de URL
- `docs/decisions/` — ADRs de decisiones estructurales
- `docs/audit/` — auditorías del proyecto (empezar por la más reciente)

Etiquetar todo dato no definitivo como `CONFIRMED`, `ASSUMPTION`, `TODO` o `PROPOSAL`.

**Precedencia:** en identidad visual, tono y vocabulario de marca manda este archivo (sección "Identidad de marca"). En SEO, URLs, datos comerciales y proceso manda `AGENTS.md`. Si chocan, no resolver por cuenta propia: marcar como `TODO` y consultar.

## Stack

- **Astro 4** (static site generator)
- **TailwindCSS** con paleta Amantia custom
- **Captura de pre-registros:** MailerLite DESCARTADO (2026-10-06). Reemplazo: `TODO` decisión pendiente
- **Hosting:** Cloudflare Workers con Static Assets (`wrangler.toml`, Worker `amantia`) — ver `docs/decisions/ADR-001-stack.md`
- **Dominio:** amantia.com.co + www.amantia.com.co

## Estructura

```
src/
├── pages/index.astro          # Coming soon (única página por ahora)
├── layouts/Base.astro         # SEO meta tags, fuentes Google
└── components/
    └── PreRegisterForm.astro  # Form de pre-registro (aún con código MailerLite, pendiente de reemplazo)

public/
├── favicon.svg
├── robots.txt
└── images/                    # Hero, OG image, fotos del lugar
```

## Comandos

```bash
npm install           # Primera vez
npm run dev           # Local en http://localhost:4321
npm run build         # Build a dist/
npm run preview       # Preview del build
```

## Variables de entorno (.env)

```
PUBLIC_MAILERLITE_ACCOUNT_ID=xxx
PUBLIC_MAILERLITE_FORM_ID=xxx
```

Nunca commitear `.env`. Usar `.env.example` como plantilla.

## Identidad de marca · NO INVENTAR

### Paleta (exacta, no modificar)

| Color | Hex | Uso |
|-------|-----|-----|
| Navy principal | `#1A2A44` | Fondos, contenedor principal |
| Navy soft | `#2C3E5A` | Caja del formulario |
| Dorado | `#B8944B` | CTAs, acentos, divider |
| Dorado suave | `#D4B872` | Tagline italic, hover |
| Crema | `#F5F1E8` | Backgrounds claros (landing completa) |
| Bone | `#E8E4DA` | Texto sobre fondo oscuro |

### Tipografía

- **Headers:** Playfair Display (Google Fonts)
- **Body:** Inter (Google Fonts)
- **Mayúsculas:** letter-spacing amplio (0.25em–0.35em)
- **Italic:** reservado para taglines y mensajes emotivos

### Tono editorial

- Vocabulario (ver `docs/decisions/ADR-003-vocabulario-y-home.md`): "cabaña" es lo que Amantia es (copy); "refugio" es la voz; "glamping" solo en URL/title/H1 de landings SEO, nunca en la home ni en el copy; "de lujo" solo en title/meta/schema, nunca como adjetivo visible.
- Todo dato de hecho sale de `docs/strategy/datos-amantia.md`. Los productores locales nunca se nombran.
- Sereno, contenido, sin grandilocuencia
- Habla a parejas adultas (30-55), no a millennials genéricos
- "Menos ruido. Más presencia." es la consigna
- NUNCA usar: emojis, exclamaciones múltiples, lenguaje de booking comercial
- SÍ usar: pausas, frases cortas, silencios narrativos

### Reglas no negociables

1. **No agregar accent lines bajo titulos** — son hallmark de sitios AI-generados
2. **No usar gradientes vistosos** — fondos sólidos o overlays muy sutiles
3. **No animaciones llamativas** — todo lo más, fade-in muy lento (>800ms)
4. **No bullet points en copy editorial** — prosa, no listas
5. **No CTAs gritones** — el botón dorado es suficiente, sin glow ni pulse
6. **Frase "Antes de abrir, cinco parejas..."** es central a la propuesta de Orígenes, no parafrasear

## Próximos hitos del proyecto

**Fuente oficial: `docs/strategy/roadmap.md`** (incluye los paquetes de pedida de mano y aniversario, con fechas).

## Pendientes postergados (2026-10-06) · NO OLVIDAR

Bloquean el lanzamiento. Recordarlos al usuario al retomar, sin ejecutarlos sin su confirmación:

1. **Reemplazo de MailerLite**: decidir entre Cloudflare D1 (recomendado), Google Sheets, solo WhatsApp o Brevo.
2. **Política de privacidad** (Ley 1581): faltan el nombre o razón social del responsable, el NIT o la cédula y el correo de contacto.
3. **Confirmar** el Instagram `@amantiacundinamarca`. (Productores: SIN permiso, nombres ya retirados del sitio el 2026-10-13.)
4. **Merge + deploy**: los cambios del 2026-10-06 (Agent Pack, ADRs, auditoría, 404, sitemap, imagen para redes) ya tienen commit en la rama `agent-pack-integration`, pero falta el merge a `main` y el deploy. Hacerlo después de los puntos 1–3, con `pre-deploy-seo-qa` y un registro real de prueba.

## Cosas importantes que evitar

- **No instalar dependencias innecesarias.** Cada `npm install` extra es código que mantener. Si una librería no aporta valor visible al usuario, no entra.
- **No agregar JavaScript del lado cliente.** Astro es estático por diseño. El único JS aceptable es el del formulario de pre-registro. Si algo se puede resolver con CSS, va con CSS.
- **No tocar imágenes reales sin permiso.** Los placeholders de Unsplash son temporales. Las fotos reales del lugar son finitas y costosas; no se cambian sin discutir.
- **No deployar sin probar el form.** Antes de cualquier push a producción, verificar que el formulario efectivamente guarda el registro.

## Agentes disponibles

Operación:

- `@amantia-deploy` — Deploy a Cloudflare, verificación de build, DNS
- `@amantia-content` — Editar copy, agregar secciones manteniendo identidad de marca
- `@amantia-developer` — Implementar en código decisiones ya aprobadas
- `@amantia-qa` — Validación antes de merge o deploy

SEO y conversión (jerarquía de `AGENTS.md` §10: el strategist decide, los demás trabajan dentro de esa decisión):

- `@amantia-seo-strategist` — Único que aprueba URLs nuevas, clústeres y prioridades
- `@amantia-seo-content` — Briefs y contenido SEO para URLs ya aprobadas
- `@amantia-technical-seo` — Indexabilidad, metadata, schema, sitemap
- `@amantia-geo-local` — Amantia como entidad local
- `@amantia-internal-linking` — Enlazado interno orientado al funnel
- `@amantia-ux` / `@amantia-cro` — Flujo, fricción y conversión

Skills (`.claude/skills/`): `seo-cluster-analysis`, `seo-cannibalization-check`, `seo-page-brief`, `technical-seo-audit`, `geo-entity-audit`, `internal-linking`, `cro-landing-review`, `pre-deploy-seo-qa`.

Ver `.claude/agents/` para configuración detallada.
