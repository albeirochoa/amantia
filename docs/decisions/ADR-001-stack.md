# ADR-001 — Stack y hosting

## Contexto

Amantia necesitaba publicar rápido un sitio de pre-registro (programa Orígenes) y luego una landing completa, con rendimiento alto, cero backend propio y mantenimiento mínimo.

## Decisión

- **Frontend:** Astro 4 en modo estático (`astro build` → `dist/`). `CONFIRMED`
- **Estilos:** TailwindCSS 3 con paleta Amantia en `tailwind.config.mjs`. `CONFIRMED`
- **Captura de leads:** formulario embebido de MailerLite vía `fetch` (único JS de cliente). `CONFIRMED`
- **Hosting:** Cloudflare Workers con Static Assets, Worker `amantia`, configurado en `wrangler.toml`. `CONFIRMED`
- **Dominios:** `amantia.com.co` y `www.amantia.com.co` como custom domains del Worker. `CONFIRMED` (en configuración; propagación/estado en producción: `TODO` verificar)

## Alternativas consideradas

- Netlify y Vercel (mencionadas en el README original).
- Cloudflare Pages (recomendado originalmente por `amantia-deploy`); se terminó usando Workers + Static Assets.

## Razones

- CDN de Cloudflare con buena cobertura en LATAM y costo cero para sitio estático.
- Astro estático cumple las preferencias de `AGENTS.md` §4: renderizado rastreable, JS mínimo, Core Web Vitals.

## Consecuencias

- Las variables `PUBLIC_MAILERLITE_*` se inyectan en **build time**: hay que tener `.env` local (o variables en el pipeline) antes de `npm run build`, o el formulario queda con placeholders.
- No hay motor de reservas, CMS ni pagos. Cuando el plan maestro llegue a Fase 5 (reservas, CMS) se requerirán ADRs nuevos (`ADR-002-cms`, `ADR-003-booking-engine`).
- `wrangler.toml` usa `not_found_handling = "404-page"`, pero no existe `src/pages/404.astro`. `TODO`

## Estado

Aceptada (documenta el estado existente al 2026-10-06).
