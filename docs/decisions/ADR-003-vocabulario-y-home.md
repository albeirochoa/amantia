# ADR-003 — Vocabulario de categoría y rol de la home

Reemplaza parcialmente a ADR-002.

## Contexto

Datos confirmados el 2026-10-13: Amantia son **3 cabañas iguales** de 72 m² para 2 personas, con jacuzzi calefactado privado, piscina privada, cinema privado y sistema de recuperación corporal. Es un producto más grande y más caro que los glampings pequeños de la zona.

Keyword Planner mostró dos patrones:
- **"glamping"** domina cuando la gente busca dónde ir: "glamping cerca a bogota" 6.600 frente a "cabañas cerca a bogota" 720.
- **"cabaña"** domina cuando busca el producto para la pareja: "cabañas para parejas" 320 frente a "glamping para parejas" 210.

El dueño pidió que la home venda la experiencia y la marca, no "glamping". Los agentes SEO, CRO/UX y marca/GEO revisaron la propuesta y la aprobaron con cambios.

## Decisión

Aprobada por el dueño el 2026-10-13. `CONFIRMED`

**Vocabulario**
- **"Cabaña"** es lo que Amantia **es**: la palabra del copy en todo el sitio.
- **"Refugio"** es la voz emocional.
- **"Glamping"** es como **busca** la gente. Solo aparece en la URL, el title, la meta description y el H1 de las landings SEO cuya keyword lo lleve. Nunca va en la home ni en el copy editorial visible.
- **"De lujo"** se permite en el title, la meta description y el schema, nunca como adjetivo en el texto visible. El lujo se demuestra con hechos (72 m², jacuzzi y piscina privados, cinema privado), no se declara.
- Siguen prohibidos "hotel boutique", "exclusivo", "lujoso" y los clichés de `AGENTS.md` §6.

**Rol de la home**
- La home es la página de **marca y experiencia**. No persigue keywords genéricas.
- Su trabajo SEO tiene tres partes:
  - ganar las búsquedas de marca;
  - concentrar la autoridad externa (Instagram, QuebradaNegra.com, prensa) y repartirla hacia las landings;
  - definir la entidad para buscadores e IAs mediante una frase-entidad visible y el schema `LodgingBusiness`.
- Frase-entidad, en el primer párrafo visible: "Amantia es un refugio de tres cabañas privadas para parejas en la vereda Casa Vieja, Quebradanegra (Cundinamarca), a 90 km de Bogotá. Cada una tiene 72 m², jacuzzi calefactado y piscina propios."
- El hero muestra los datos concretos en los primeros 5 segundos en móvil: tres cabañas privadas, piscina y jacuzzi solo para ustedes, a 90 km de Bogotá.

**Reparto de keywords** (detalle en `docs/seo/url-map.md`)

| Página | Title | Keywords |
|---|---|---|
| `/` | Amantia · Cabañas privadas de lujo para dos | marca, cabañas de lujo |
| `/cabanas/` | Cabañas para parejas cerca a Bogotá · jacuzzi y piscina | cabañas para parejas, cabaña(s) + jacuzzi |
| `/glamping-cerca-de-bogota/` | Glamping cerca a Bogotá para parejas · lujo a 90 km | glamping cerca a Bogotá, glamping para pareja(s), glamping romántico, glamping de lujo (secundaria) |
| `/glamping-con-jacuzzi/` | Glamping con jacuzzi y piscina privada cerca a Bogotá | glamping + jacuzzi / piscina |
| `/glamping-cerca-de-villeta/` | Glamping Villeta · privado y con jacuzzi, en Quebradanegra | glamping Villeta (sin "cabañas en Villeta", que es de QN) |

## Alternativas consideradas

- Home con "glamping de lujo para parejas" en el title: descartada porque contradice el pedido del dueño y compite con el hub de Bogotá.
- Home con "cabañas para parejas" en el title: descartada porque canibaliza `/cabanas/` (MERGE de intención según el agente SEO).
- Sin "de lujo" en ningún title (lo sugirió CRO): descartada, porque el dueño quiere un posicionamiento premium y el agente de marca confirmó que "de lujo" en el title no choca con el "lujo silencioso" si el copy no lo declara.

## Consecuencias

- Hay que actualizar `CLAUDE.md` (tono editorial), `.claude/agents/amantia-content.md` (vocabulario) y `docs/seo/url-map.md`.
- Riesgo: si la tarifa no resulta de gama alta, "lujo" en los titles decepciona. Revisar cuando se fije el precio.
- Pendiente (NEEDS_RESEARCH): comparar la SERP de "cabaña con jacuzzi privado parejas" con la de "glamping con jacuzzi". Si comparten 5 o más resultados del top 10, todo el bloque jacuzzi pasa a `/glamping-con-jacuzzi/`.

## Estado

Aceptada.
