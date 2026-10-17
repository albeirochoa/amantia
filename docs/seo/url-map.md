# URL Map — Amantia

> **Estructura aprobada y congelada el 2026-10-13** (ver ADR-003). Fuente oficial de URLs; `AGENTS.md` §8 remite aquí.
> **Evidencia:**
> - `docs/seo/investigacion-fase1.md` (keywords y SERP)
> - `docs/seo/silos-y-programatico.md` (silos, reparto con QuebradaNegra)
> - `docs/strategy/datos-amantia.md` (datos confirmados)

## Principio rector

**Amantia habla de Amantia. QuebradaNegra.com habla del territorio.**
- Lo que tiene la **propiedad** (cabañas, jacuzzi y piscina privados, para parejas, cercanía) → Amantia.
- Lo que tiene el **territorio** (qué hacer, clima, planes, comparativas de varios hospedajes) → QuebradaNegra.com, que enlaza a la URL específica de Amantia.
- La misma keyword puede vivir en los dos dominios si el formato es distinto: QN es comparativa o guía, Amantia es una sola propiedad. Nunca se comparten textos.
- **Neutralidad (dueño, 2026-10-17):** QuebradaNegra.com es un portal ecuánime que posiciona el municipio. **Amantia no enlaza a QN**; cuando menciona el municipio, enlaza a la fuente oficial (Alcaldía, `quebradanegra-cundinamarca.gov.co`). QN enlaza a Amantia solo donde hay intención de hospedaje (3–4 páginas), con la marca como anchor. Que Amantia posicione por encima de QN en una búsqueda compartida es aceptable.

## Fase A: lanzamiento (noviembre 2026) · ESTRUCTURA CONGELADA

**Regla para crear una URL.** Se crea solo si se cumplen las tres condiciones:
1. ≥300 búsquedas/mes propias (sin sumar variantes duplicadas).
2. Un protagonista distinto al de las demás URLs.
3. Google muestra resultados distintos para esa búsqueda.

Si no se cumplen, la búsqueda va como **sección** de una URL existente.

**Excepción: páginas de paquete u oferta real.** Un paquete con precio, qué incluye y fotos es un producto distinto, no una variación de keyword, así que puede tener URL propia aunque su volumen de búsqueda sea bajo. No aplica a paquetes hipotéticos: la URL se crea cuando el paquete existe. Esta estructura no se reabre hasta tener ≥3 meses de Search Console.

| URL | Title | Absorbe (vol/mes) | Protagonista |
|---|---|---|---|
| `/` | Amantia · Cabañas privadas de lujo para dos | Marca ("amantia") · cabañas de lujo 50 | La experiencia y la marca (ADR-003) |
| `/cabanas/` | Cabañas para parejas cerca a Bogotá · jacuzzi y piscina | **Todo "cabaña(s) + …":** cabañas para parejas 320 · cabaña con jacuzzi privado parejas 140 · cabañas para parejas con jacuzzi 90 · cabañas con piscina privada cerca a Bogotá 70 · cabañas románticas 50 · cabañas privadas 10 | Las 3 cabañas: qué tienen, qué incluyen, disponibilidad |
| `/glamping-cerca-de-bogota/` | Glamping cerca a Bogotá para parejas · lujo a 90 km | glamping cerca a Bogotá 6.600 · glamping Bogotá 2.900 · glamping para pareja(s) 210+110 · glamping de lujo 140 · glamping romántico 70 | El viaje desde Bogotá |
| `/glamping-con-jacuzzi/` | Glamping con jacuzzi y piscina privada cerca a Bogotá | glamping con jacuzzi 480 · glamping con piscina 110 · glamping con jacuzzi privado 90 · glamping con piscina privada 90 | El jacuzzi y la piscina privados |
| `/glamping-en-quebradanegra/` | Glamping en Quebradanegra, Cundinamarca · Amantia | glamping quebradanegra / glamping en quebradanegra (volumen bajo; QN tiene 20 impr., pos. 8,5) | **Dónde está Amantia**: vereda Casa Vieja, municipio, altitud, clima, entorno. **Excepción aprobada por el dueño (2026-10-17):** página de ubicación real de la propiedad (entidad local), no cumple ≥300/mes. Convive con el directorio de QN (`/quebrada-negra/glamping/`). Desambigua a Amantia del negocio vecino "Glamping Quebradanegra" |
| `/glamping-cerca-de-villeta/` | Glamping Villeta · privado y con jacuzzi, en Quebradanegra | glamping Villeta 1.600 · glamping en Villeta 390 | La cercanía a Villeta (sin "cabañas en Villeta", que es de QN) |
| `/origenes/` | — | — (campaña, `noindex`) | Pre-registro de las 5 parejas |
| `/politica-de-privacidad/` | — | — | Legal |
| `/404` | — | — | ✅ existe |

**Por qué "glamping" tiene 3 landings y "cabaña" solo una:**
- "Glamping" tiene volumen para dividir en tres temas con protagonista propio (6.600 / 1.600 / 480).
- Todo "cabaña(s) + …" suma ≈700/mes y describe el mismo producto (3 cabañas iguales). Una página fuerte rinde más que cuatro casi idénticas, que Google trataría como contenido duplicado.

**Silos:**

```
/  ──────────────┬── /cabanas/  (conversión)
                 ├── /glamping-cerca-de-bogota/   ↔ /glamping-cerca-de-villeta/
                 ├── /glamping-con-jacuzzi/       ↔ /glamping-cerca-de-bogota/
                 └── /glamping-en-quebradanegra/  ↔ /glamping-cerca-de-villeta/ · /glamping-cerca-de-bogota/ (añadida 2026-10-17)
```

- Cada landing enlaza a `/cabanas/` y a la home.
- Los enlaces laterales van solo donde están las flechas, más `/glamping-con-jacuzzi/` ↔ `/glamping-cerca-de-villeta/` (añadido 2026-10-15).
- Sin enlaces hacia QuebradaNegra.com (decisión del dueño, 2026-10-17).

## Fase B: después de abrir, solo si se cumple la condición

| URL | Condición |
|---|---|
| `/reservar/` (`noindex`) | Al tener motor de reservas con disponibilidad por cabaña (Fase 5) |
| `/glamping-con-piscina-privada/` | Que Keyword Planner muestre volumen propio para "glamping/cabañas con piscina privada" (hoy ≈200 medido) |
| `/plan-aniversario-cerca-de-bogota/` | Cuando el **paquete de aniversario** esté definido (precio, qué incluye, fotos). Página SEO: ≈480/mes, la SERP muestra paquetes |
| `/pedida-de-mano-cerca-de-bogota/` | Cuando el **paquete de pedida de mano** esté definido. Página de oferta (excepción de paquete): tráfico de Instagram, WhatsApp, anuncios y la guía de QN. Ideal antes del pico de dic–ene ("pedida de mano" 720 → 1.300 en enero) |
| `/experiencias/[slug]/` | ≥4 experiencias o paquetes reales con precio y fotos |
| `/cabanas/[slug]/` | **Condición cumplida en principio** (2026-10-15: las 3 cabañas tienen nombre y vista distintos, y una es más grande). Se crean al entregar la obra, cuando haya nombres, medidas, vistas y fotos reales. Mientras tanto, `/cabanas/` muestra las 3 en tarjetas |

## Cedidas a QuebradaNegra.com (Amantia no crea estas URLs)

- Planes en pareja / escapada romántica cerca de Bogotá: guía publicada en QN, `/guias/escapada-romantica-cerca-de-bogota/`.
- Hospedaje en Villeta, cabañas en Villeta, directorio de glamping de Quebradanegra.
- Clima cálido / tierra caliente (Villeta); Amantia solo usa el dato concreto ("días de 28 °C").
- Qué hacer, cascadas, cómo llegar al municipio, escapada de fin de semana, lugares para descansar, guía de precios.

## Descartadas

- `/glamping-para-parejas/` → `/`
- `/cabana-con-jacuzzi-cerca-de-bogota/` → `/glamping-con-jacuzzi/`
- `/escapada-romantica-cerca-de-bogota/`, `/plan-romantico-cerca-de-bogota/`, `/planes-en-pareja-cerca-de-bogota/` → QN
- `/escapada-fin-de-semana-cerca-de-bogota/`, `/lugares-para-descansar-…/`, `/lugares-para-desconectarse-…/` → QN
- `/glamping-clima-calido-cerca-de-bogota/` → QN
- `/escapada-en-pareja/`, `/escapada-de-una-noche/`, `/escapada-naturaleza-…/`, `/lugares-privados-para-parejas/`, `/alojamiento-romantico-…/` → sin demanda o fusionadas

Ninguna de estas URLs estuvo publicada, así que no se requieren redirects.

## Cambios necesarios en QuebradaNegra.com

Ver `docs/handoff/2026-10-16-brief-para-quebradanegra.md` (revisado el 2026-10-17 con el principio de neutralidad): ficha de Amantia corregida e igualada al resto; CTA de Amantia solo en 3–4 páginas con intención de hospedaje, con anchor de marca.
