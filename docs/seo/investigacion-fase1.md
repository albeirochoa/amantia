# Fase 1 — Investigación SEO y validación de URLs

**Fecha:** 2026-10-06
**Estado:** `PROPOSAL`, pendiente de aprobación del dueño. No modifica `AGENTS.md` §8 hasta aprobarse.

**Fuentes:**
- Google Ads Keyword Planner (sep 2025–ago 2026): `docs/seo/keywords/consolidado.tsv`.
- Revisión de SERP con búsqueda web y autocompletado de Google (`hl=es`, `gl=co`).

**Límites:** la SERP revisada es una aproximación, no Google Colombia móvil, y no incluye local pack, Maps ni anuncios. Los volúmenes de Keyword Planner son rangos. Las variantes duplicadas (tildes, "a"/"de") no se suman.

---

## 1. Conclusión

Las 9 URLs hipotéticas del Agent Pack se reducen a **4 landings P0 + la home**.

| # | URL | Tipo | Keyword principal (vol/mes) | Absorbe |
|---|---|---|---|---|
| 1 | `/` | Home / BOFU | glamping para pareja (210) | `/glamping-para-parejas/`, ocasiones (aniversario, pedida, cumpleaños) como sección |
| 2 | `/glamping-cerca-de-bogota/` | BOFU hub | glamping cerca a bogota (**6.600**) | glamping bogota (2.900), "precios económicos" (480), clima cálido (90) como sección |
| 3 | `/glamping-cerca-de-villeta/` | BOFU | glamping villeta (**1.600**) | glamping en villeta (390), cabañas en villeta (480), hospedaje en villeta (1.000), Quebradanegra como sección |
| 4 | `/glamping-con-jacuzzi/` | BOFU | glamping con jacuzzi (480, **+84% anual**) | cabaña con jacuzzi (privado) parejas (140), cabañas para parejas con jacuzzi (90) |
| 5 | `/planes-en-pareja-cerca-de-bogota/` | MOFU | planes en pareja cerca a bogota (260; grupo ≈900–1.000) | escapada romántica, plan romántico, escapada en pareja, noche romántica como sección |

**Mejor apuesta inmediata:** `/glamping-con-jacuzzi/`. Es la única búsqueda donde Google muestra **fichas de alojamientos individuales** (Airbnb, glampinghub) en lugar de listas de medios. Una sola unidad puede competir ahí, el jacuzzi calefactado está `CONFIRMED` y la demanda crece.

**Lo que no se puede ganar por SEO orgánico a corto plazo:** "glamping cerca a bogota" (6.600). La primera página la dominan listas de medios con mucha autoridad (noticiasrcn, noticiascaracol, semana, bogota.gov.co, pulzo). Esa demanda se captura con **PR digital (salir en esas listas), Google Business Profile y OTAs**. La landing sirve como hub de conversión.

---

## 2. Decisiones por URL del URL map original

| URL original | Decisión | Prioridad | Canibalización | Motivo |
|---|---|---|---|---|
| `/glamping-cerca-de-bogota/` | **CREAR** | P0 | NO_CONFLICT | Mayor demanda del set; comparte ~5/9 resultados con "glamping bogota" → MERGE de esa variante |
| `/glamping-cerca-de-villeta/` | **CREAR** | P0 | NO_CONFLICT | SERP dominada por OTAs que ya muestran alojamientos de San Francisco/Útica: Google acepta cercanía. Nadie busca "cerca de Villeta"; el title debe empezar por "Glamping Villeta" |
| `/glamping-con-jacuzzi/` | **CREAR** | P0 | DIFFERENT_INTENT | SERP de fichas individuales; tendencia +84% |
| `/glamping-para-parejas/` | **FUSIONAR con `/`** | P1 (revisar) | MERGE | SERP comparte ~6/10 con "cerca a bogota"; es la identidad misma de Amantia y competiría con la home |
| `/glamping-en-quebrada-negra/` | **POSTERGAR** | P1 | NEEDS_RESEARCH | Sin datos en Keyword Planner. El autocompletado sugiere búsqueda de marca de un listing de Airbnb llamado "Glamping Quebradanegra" (ver §5). Slug correcto si se crea: `/glamping-en-quebradanegra/` |
| `/cabana-con-jacuzzi-cerca-de-bogota/` | **FUSIONAR en `/glamping-con-jacuzzi/`** | P2 | MERGE | 40/mes; SERP de categorías de Airbnb. Las variantes de pareja (140 + 90) son más fuertes → H2 dentro de jacuzzi |
| `/escapada-romantica-cerca-de-bogota/` | **FUSIONAR en `/planes-en-pareja-cerca-de-bogota/`** | — | MERGE | "escapada romántica" 110, sin geo; misma SERP que "planes en pareja". "Escapada" se usa más en España |
| `/plan-romantico-cerca-de-bogota/` | **RENOMBRAR → `/planes-en-pareja-cerca-de-bogota/`** | P0 | — | En Colombia se busca en plural y "en pareja"; el singular casi no existe |
| `/escapada-fin-de-semana-cerca-de-bogota/` | **POSTERGAR** | P2 | DIFFERENT_INTENT | "fin de semana escapadas" 260, genérica; la SERP es de **pueblos** (intención de destino → QuebradaNegra.com) |

**P1/P2 del URL map:**
- `/escapada-en-pareja/` → FUSIONAR (40/mes, SERP de España).
- `/alojamiento-romantico-cerca-de-bogota/` → FUSIONAR en `/` (≤30).
- `/escapada-de-una-noche/`, `/escapada-naturaleza-cerca-de-bogota/`, `/lugares-privados-para-parejas/` → DESCARTAR (≤10; la privacidad se busca ligada a un atributo: jacuzzi o piscina privada).
- `/lugares-para-descansar-cerca-de-bogota/`, `/lugares-para-desconectarse-cerca-de-bogota/` → POSTERGAR; la SERP es de pueblos y termales, territorio de QuebradaNegra.com.
- `/glamping-en-cundinamarca/` → no evaluada (sin datos). `TODO`

---

## 3. Oportunidades nuevas (no estaban en el URL map)

| Oportunidad | Datos | Propuesta |
|---|---|---|
| Glamping clima cálido cerca de Bogotá | 90/mes, +21% anual, **+89% en 3 meses**; el autocompletado sugiere "tierra caliente", "con piscina" | Sección en el hub de Bogotá ahora; P1 `/glamping-clima-calido-cerca-de-bogota/` (NEEDS_RESEARCH). Que Quebradanegra sea clima cálido: `TODO` confirmar |
| Plan aniversario cerca de Bogotá | Núcleo ≈370 (ambiguo), ≈110 con "Bogotá" explícito | P1 **solo si existe un paquete real** (decoración/cena/precio). Ganan las páginas con oferta concreta. Hoy: sección en `/` |
| Cabañas para parejas | 320/mes, +22%; demanda nacional (Santa Elena, San Gil) | P2, NEEDS_RESEARCH. Requiere confirmar si la unidad puede llamarse "cabaña" |
| Noche romántica | 320 + 210 + 170 | No crear URL: la SERP es de hoteles urbanos de Bogotá (Hilton, W, JW Marriott) e ideas para casa. Sección dentro de planes en pareja |

**Descartadas:** "alquiler fincas villeta" (590, fincas familiares e inmobiliarias), "cabañas cerca a bogota" (720, -45%, categorías de Airbnb/Expedia), marcas ajenas ("hotel verano azul"), todo el bloque informacional de aniversarios (≈17.000/mes de "significado bodas de plata/oro", sin puente a alojamiento) y "cómo pedir noviazgo".

---

## 4. Estacionalidad (para contenido y campañas)

- **Enero es el pico del glamping.** "glamping cerca a bogota" llega a 9.900 en enero (base 5.400–8.100); "glamping villeta" a 2.400. **Publicar las landings antes de diciembre** para indexar a tiempo.
- **Septiembre (Amor y Amistad) es el pico romántico**, no febrero. "planes en pareja cerca a bogota" sube a 320 en sep (170 en feb); "noche romántica" a 480.
- **Diciembre–enero:** pico de pedidas de mano (720 → 1.300 en enero).
- **Diciembre:** caen los planes de pareja (170) y la noche romántica en pareja (70).
- **Julio:** segundo pico (vacaciones).
- **Tendencia:** todas las keywords principales de glamping caen entre 19% y 33% al año, **excepto jacuzzi** (+84%) y clima cálido (+21%).

**Calendario sugerido:**
- Agosto–septiembre: campaña de Amor y Amistad.
- Noviembre–enero: temporada alta de glamping, más pedidas y año nuevo.
- Julio: vacaciones.

---

## 5. Hallazgo crítico: listing "Glamping Quebradanegra" en Airbnb

En la SERP de "glamping con jacuzzi cerca a bogota", el **primer resultado** es una ficha de Airbnb llamada **"Glamping Quebradanegra"** (`airbnb.com/rooms/54130306`; ~4,52★, 27 reseñas, piscina compartida, jacuzzi). El autocompletado de "glamping quebradanegra" también apunta a ese negocio.

`TODO` (bloqueante para `/glamping-en-quebradanegra/` y para el schema/GEO): **¿esa ficha es de Amantia o de un competidor?**
- **Si es de Amantia:** es un activo enorme. Hay que conectar marca y reseñas, y aclarar que la piscina es compartida (el sitio dice "piscina al aire libre").
- **Si es de un competidor:** "glamping quebradanegra" es la búsqueda de marca de otro negocio y no conviene perseguirla. Además, compite directamente en jacuzzi.

---

## 6. Datos que faltan antes de redactar (HARD RULE 1)

| Dato | Afecta a | Estado |
|---|---|---|
| Precio por noche / rango | Hub Bogotá ("precios económicos"), todas las BOFU | `TODO` |
| ¿Jacuzzi privado? | `/glamping-con-jacuzzi/` ("jacuzzi privado" 90 + 140) | `TODO` |
| ¿Piscina privada o compartida? | Villeta ("piscina privada" 140), home | `TODO` |
| ¿Se puede llamar "cabaña"? | H2 de cabañas con jacuzzi, P2 cabañas para parejas | `TODO` |
| Distancia y tiempo a Villeta; tiempo desde Bogotá | Villeta, hub Bogotá, planes en pareja | `TODO` (90 km a Bogotá: `CONFIRMED`) |
| Clima de la zona | Sección clima cálido | `TODO` |
| Paquetes (decoración, cena, pedida de mano) | Sección de ocasiones, P1 aniversario | `TODO` |
| Número de unidades | `/alojamientos/` y riesgo de contenido delgado | `TODO` |
| Dueño del listing "Glamping Quebradanegra" | §5 | `TODO` |

---

## 7. Siguiente ronda de datos (opcional, mejora la decisión)

Volver a correr Keyword Planner con estas semillas, que no estaban en los estudios:
- glamping para parejas (plural)
- glamping quebradanegra / quebradanegra cundinamarca / útica
- escapada romántica cerca de bogotá / escapada fin de semana cerca a bogotá
- planes cerca a bogotá / fin de semana cerca a bogotá
- lugares para descansar cerca a bogotá
- luna de miel cerca a bogotá
- glamping en cundinamarca

Además, revisar a mano en un móvil en Colombia (incógnito) las SERP de las 5 URLs propuestas: local pack, anuncios y peso real de Booking y Airbnb.

---

## 8. Riesgos

1. **Contenido delgado:** varias landings sobre **una sola unidad** pueden quedar casi duplicadas. Cada una necesita un protagonista y contenido realmente distintos (cercanía / Villeta / jacuzzi / planes).
2. **Expectativas:** el SEO orgánico no ganará la keyword principal "glamping cerca a bogota" frente a medios. Sí son realistas el long tail, jacuzzi, Villeta y la visibilidad en respuestas de IA (GEO).
3. **Slugs "cerca-de" vs "cerca a":** la gente busca 10× más "cerca **a**". Se mantienen los slugs `cerca-de` por coherencia (el slug pesa poco); title y H1 usan "cerca a Bogotá". `PROPOSAL`
4. **Tendencia a la baja** del glamping genérico: diversificar hacia jacuzzi y clima cálido, que crecen.
