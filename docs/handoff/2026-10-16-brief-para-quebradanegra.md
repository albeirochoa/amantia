# Brief para los agentes de QuebradaNegra.com — alineación con Amantia

**Fecha:** 2026-10-16
**De:** proyecto Amantia.com.co (repo `C:\proyectos\amantia-coming-soon\amantia-coming-soon`)
**Para:** suite de agentes de QuebradaNegra.com (`seo-lead`, `keyword-serp`, `seo-local`, `seo-contenido`, `geo-aeo`, `seo-tecnico`)
**Cómo usar este documento:** es un **insumo**, no una orden que pase por encima de las reglas de QuebradaNegra. Antes de actuar, leer `CLAUDE.md`, `DESIGN.md`, `SEO-ROADMAP.md` y `seo-data/ESTRATEGIA-keywords-2026-08-28.md`. Si algo de este brief choca con esas reglas, **mandan las reglas de QuebradaNegra** y el choque se reporta al dueño.

---

## 0. Qué cambió en Amantia desde el último roadmap de QN (2026-08-28)

- **Amantia.com.co está en vivo** desde el 2026-10-15, con 5 URLs indexables, Search Console verificado y GTM instalado.
- **Amantia ya enlaza a QuebradaNegra.com** desde "El lugar" (home) y desde las landings, hacia `/quebrada-negra/que-hacer/`, `/quebrada-negra/como-llegar/` y `/villeta/que-hacer/`. Esto cierra la tarea off-site *"Enlace desde Amantia.com.co hacia el portal"* del `SEO-ROADMAP`.
- **Ya hay datos verificados de Amantia** (dirección, coordenadas y atributos). Desbloquea la **Fase 2 #3** ("Completar `LodgingBusiness`… coordenadas/dirección de Amantia").
- **Principio de reparto acordado por el dueño:** *Amantia habla de la propiedad; QuebradaNegra habla del territorio.* La misma keyword puede vivir en los dos dominios si el formato es distinto (QN = guía, comparativa o directorio con varias opciones; Amantia = una sola propiedad). Nunca se comparten textos entre dominios.

---

## 1. Fuente de verdad sobre Amantia (datos `CONFIRMED`)

Usar **solo** estos datos. Todo lo demás es `TODO` y no se publica.

| Dato | Valor | Cómo decirlo |
|---|---|---|
| Nombre | **Amantia** | Nunca "Amantia Glamping" (el vecino se llama "Glamping Quebradanegra": riesgo de confusión de entidad) |
| Qué es | 3 cabañas privadas para parejas | "Tres cabañas privadas para parejas" |
| Dirección | Vereda Casa Vieja, Quebradanegra, Cundinamarca | **Nunca "en Villeta"** (coincide con la regla P3 de QN: no relocalizar hospedajes) |
| Coordenadas | 5.137415, -74.480506 | Google Maps: https://www.google.com/maps?q=5.137415,-74.480506 |
| Distancia | 90 km de Bogotá · 13,9 km en línea recta de Villeta | Tiempo por carretera: `TODO` (no publicar) |
| Altitud / clima | ≈1.080 m · media 22 °C · días ≈28 °C · noches ≈17 °C | Templado, en el límite con cálido. **No es "tierra caliente"** |
| Capacidad | 2 personas por cabaña | |
| Área | Desde 72 m² **con terraza** (interior ≈44 m²) | Nunca "72 m²" a secas |
| Atributos | Jacuzzi calefactado **privado** y piscina al aire libre **privada** por cabaña; cinema privado; sistema de recuperación corporal; cocina; baño con tina exenta | La piscina privada es el diferenciador frente al vecino (que la tiene compartida). No nombrar al competidor como "peor" |
| Estado | En construcción; la obra se estima terminar a finales de 2026 | No decir "abierto". No publicar tarifa (política de simetría del Bloque C de QN) |
| Contacto | WhatsApp +57 312 631 1226 · hola@amantia.com.co | |
| Imágenes | Renders del arquitecto (siempre con la etiqueta "Render") e imágenes conceptuales (siempre con "Imagen conceptual") | **Recomendación:** QN no usa imágenes de Amantia hasta tener fotos reales (DESIGN.md evita la estética luxury y las imágenes perfectas). Mantener el placeholder actual |

---

## 2. Tareas, en orden de prioridad

### P0 — Configuración (la hace el dueño; ya está en el SEO-ROADMAP de QN)

Sin cambios respecto al roadmap de QN; solo se recuerda porque **bloquea la línea GEO**:
- **P0-0.1** Desbloquear GPTBot, ClaudeBot y PerplexityBot en Cloudflare (hoy reciben 403).
- **P0-0.2** Redirección 301 `quebradanegra.pages.dev` → `quebradanegra.com`.

### P1-A — Corregir la ficha de Amantia (código; sin pipeline de contenido; cierra la Fase 2 #3)

Archivos: `src/data/stays.ts` (entrada `slug: 'amantia'`) y `src/data/site.ts` (`AMANTIA`).

| Campo | Hoy | Debe quedar |
|---|---|---|
| `name` (en los dos archivos) | `'Amantia Glamping'` | `'Amantia'` |
| `stays.ts` → `blurb` | "Proyecto de glamping en Quebrada Negra, actualmente en desarrollo…" | Texto propio de QN, editorial y sin venta, que use **solo** los datos de la §1. Sugerencia de hechos a incluir: tres cabañas privadas para parejas en la vereda Casa Vieja (Quebradanegra); cada una con jacuzzi calefactado y piscina propios; a 90 km de Bogotá; en construcción, apertura prevista a finales de 2026 |
| `stays.ts` → `bestFor` | "Parejas · escapada tranquila" | Se puede mantener |
| `stays.ts` → `type` | `'glamping'` | **Decisión de QN.** Amantia se describe como "cabañas" (ADR-003 de Amantia), pero el directorio es de glamping y la búsqueda es "glamping". Recomendación: mantener `'glamping'` para el filtro del directorio y decir "cabañas privadas" en el `blurb` |
| `stays.ts` → `url` | `https://amantia.com.co/` | `https://amantia.com.co/cabanas/` (la página de producto de Amantia) |
| `stays.ts` → dirección y geo | No tiene | Agregar con el mismo formato que Kuxtal: `address: 'Vereda Casa Vieja, Quebradanegra, Cundinamarca'`, `geo: { lat: 5.137415, lon: -74.480506 }`. El `telephone` es opcional: +57 312 631 1226 |
| `site.ts` → `AMANTIA.blurb` | "Una experiencia de descanso, privacidad y naturaleza…" (genérico) | Una frase con hechos de la §1 y con el tono de QN ("aliado recomendado") |
| Schema `LodgingBusiness` del directorio | Amantia sin NAP ni geo | Que tome los nuevos campos (es el mismo `ItemList` de `/quebrada-negra/glamping/`) |

**Criterio de terminado:** `npm run build` sin errores; en el HTML de `/quebrada-negra/glamping/` el JSON-LD de Amantia trae `address` y `geo`; ninguna página de QN dice "Amantia Glamping" ni "en desarrollo".

### P1-B — Enlaces hacia la URL equivalente de Amantia (código; el CLAUDE.md de QN ya lo anticipa)

El `CLAUDE.md` de QN dice: *"`CTAAmantia` enlaza a `https://amantia.com.co/` (luego se cambia a URLs específicas)"*. Ese "luego" ya llegó: las URLs de Amantia existen.

**Hallazgo técnico.** `CTAAmantia` ya acepta un prop `href`, pero se usa **dentro de los layouts** (`DirectoryLayout`, en 7 páginas, y `GuideLayout`, en 4 guías), así que hoy todas las páginas apuntan a la raíz. Además, el texto del enlace es fijo (`AMANTIA.cta` = "Conocer Amantia").

**Propuesta de implementación (respetando la arquitectura de QN):**
1. `CTAAmantia`: agregar un prop opcional `label` (texto del enlace), con default `AMANTIA.cta`.
2. `DirectoryLayout`: aceptar las props opcionales `amantiaHref` y `amantiaLabel` y pasarlas a `CTAAmantia`.
3. Guías (Content Collection): agregar al esquema de `src/content/config.ts` los campos opcionales `amantiaHref` y `amantiaLabel`, y que `GuideLayout` los pase al CTA.
4. Asignación:

| Página de QN | `href` de Amantia | `label` (texto del enlace) |
|---|---|---|
| `/glamping/cerca-de-bogota/` | `https://amantia.com.co/glamping-cerca-de-bogota/` | "Glamping cerca a Bogotá para parejas: Amantia" |
| `/villeta/glamping/` | `https://amantia.com.co/glamping-cerca-de-villeta/` | "Glamping cerca de Villeta, en Quebradanegra: Amantia" |
| `/quebrada-negra/glamping/` (directorio) | `https://amantia.com.co/glamping-en-quebradanegra/` | "Glamping en Quebradanegra: Amantia, vereda Casa Vieja" |
| `/guias/escapada-romantica-cerca-de-bogota/` | `https://amantia.com.co/cabanas/` | "Cabañas privadas para parejas en Quebradanegra" |
| `/quebrada-negra/que-hacer/`, home, `/guias/` y resto | `https://amantia.com.co/` | "Conocer Amantia" (se mantiene) |
| Ficha de Amantia en el directorio (`StayCard`) | `https://amantia.com.co/cabanas/` | — |

**Reglas que no cambian:**
- El bloque sigue diciendo *"Aliado recomendado · no es publicidad pagada"* (regla de oro 2).
- Mantener `rel` como hoy.
- No convertir el CTA en un banner de venta.
- Variar los textos de enlace: no repetir la keyword exacta en todas las páginas (riesgo de sobreoptimización).

**Por qué importa:** es la palanca off-site más fuerte que tiene Amantia. Amantia no puede usar "glamping" en su menú ni en la home (por regla de marca), así que los anchors descriptivos desde un portal de la misma zona le dicen a Google de qué trata cada página. A QN no le cuesta autoridad: son enlaces editoriales a una ficha aliada que ya existía.

### P1-C — Actualizar `SEO-ROADMAP.md` de QN

- Marcar como hecha la tarea off-site *"Enlace desde Amantia.com.co hacia el portal"*.
- Fase 2 #3: Amantia con NAP y geo (cuando se cierre el P1-A).
- La línea *"Google Business Profile de Amantia"* ya está en el roadmap de Amantia (la ficha se creará con el pin de la §1). Cuando exista, agregar su URL al directorio.
- Agregar las piezas P2 nuevas de este brief (§3) al calendario, **reprogramadas**: la fecha de corte para enero ("antes de octubre") ya pasó.

---

## 3. Contenido nuevo: oportunidades que Amantia cede a QN

Amantia **no va a crear** URLs para estas intenciones, por ser de territorio, comparativas o guías. Son de QN si sus agentes las validan. **Todas pasan por el pipeline obligatorio** (brief → draft → review adversarial), el filtro **500/60/1** y la regla *"¿un viajero querría leer esto?"* (lección de P1-1.9).

**Fuente de los volúmenes:** Google Ads Keyword Planner, Colombia, sep 2025–ago 2026, exportado por el dueño para Amantia (archivos en el repo de Amantia: `docs/seo/keywords/consolidado.tsv` y `2026-10-13_glamping-vs-cabanas.tsv`). **El dataset de QN no tiene estas keywords**: complementan su `keywords-2026-08-28.tsv`.

### 3.1 · NUEVA — Guía "dónde y cómo pedir matrimonio cerca de Bogotá" (prioridad alta, estacional)

| Keyword | Vol/mes | Nota |
|---|---:|---|
| pedida de mano / pedida de matrimonio (misma serie) | 720 | **diciembre 1.000 · enero 1.300** (base 590–720) |
| pedida de mano sorpresa | 30 | |
| pedidas de mano originales | 20 | |
| pedida de mano en el bosque / en jardín / restaurante para pedida (c/u) | 10 | |

- **SERP observada:** listicles de medios y de Airbnb (news.airbnb.com, semana.com, elespectador.com, portafolio.co, las2orillas.co). **Ninguna landing de alojamiento posiciona.** Es formato guía, que es el formato de QN.
- **Cluster:** D (Escapadas), puente hacia el A. Enlaza a la guía romántica y a la pilar.
- **Rol de Amantia:** una opción destacada más (`CTAAmantia`). Cuando Amantia publique su paquete (`https://amantia.com.co/pedida-de-mano-cerca-de-bogota/`, previsto antes del 1 de diciembre), el CTA de esta guía apunta ahí. Mientras tanto, a `/cabanas/`.
- **Dato propio requerido (filtro 500/60/1):** lugares reales del Gualivá para la propuesta (miradores, cascadas, trapiches), con la logística verificada. `TODO` del dueño o del Bloque D.
- **Fecha:** idealmente antes de diciembre. Si no llega, igual sirve para el pico de enero del año siguiente y para Amor y Amistad (septiembre).

### 3.2 · AMPLIAR — Guía romántica existente → "planes en pareja cerca a Bogotá"

`/guias/escapada-romantica-cerca-de-bogota/` ya existe y es dueña de la intención romántica (P1-1.6 de QN). El dato nuevo es **cómo busca la gente en Colombia**:

| Keyword | Vol/mes |
|---|---:|
| planes en pareja cerca a bogota | 260 |
| planes romanticos cerca a bogota | 140 |
| planes para pareja cerca a bogota | 110 |
| planes cerca a bogotá para parejas | 110 |
| escapada romántica (sin geo) | 110 |
| planes románticos cerca a bogotá económicos | 90 |
| **Cluster (con variantes)** | **≈1.000–1.500** |

- **Picos:** septiembre (Amor y Amistad, 320), enero y julio. Diciembre es el valle (170). **San Valentín no es pico en Colombia.**
- **Hallazgo de lenguaje:** "escapada" suena a España (el autocompletado `gl=co` devuelve Madrid y Cataluña). En Colombia se busca **"planes en pareja / planes románticos cerca a Bogotá"**, en plural y con "cerca **a**".
- **Propuesta para `seo-contenido`:** evaluar si el title y H1 deben pasar a "Planes en pareja cerca a Bogotá…", conservando "escapada romántica" como variante, y agregar secciones de "noche romántica" y "aniversario". **No cambiar el slug** (está publicado; un cambio exige 301). Dato a revisar: la guía dice "2½ h de Bogotá" (aproximación ya tratada en la deuda menor del P1).
- **Formato que gana:** guía con varios planes (ya es así). Amantia entra como la opción de alojamiento, sin disfrazar la página de neutral.

### 3.3 · Ya en el roadmap de QN — se aportan datos

| Pieza de QN | Dato nuevo de Amantia |
|---|---|
| P2 #1 `/villeta/cabanas/` | "cabañas en villeta con piscina privada" **140** (+21%) · "hospedaje en villeta con piscina" 110. **Amantia no compite** por "cabañas en Villeta" (está en Quebradanegra); el reparto es explícito |
| P2 #2 `/villeta/donde-dormir/` | Sin cambios: "hospedaje en villeta" 1.000. Sigue siendo de QN |
| P2 #4 clima cálido, **en duda** | Dato para decidir: **"glamping tierra caliente" 210/mes** (-35% anual), "glamping cerca a bogotá clima cálido" 90 (+21% anual, +89% en 3 meses). Amantia (1.080 m, 22 °C) **renunció** a este término por honestidad: no es tierra caliente. Villeta (795 m, 24 °C) sí. Refuerza la adjudicación de `ESTRATEGIA §5` a Villeta, o a `/glamping/cerca-de-bogota/` si la review mantiene su dictamen. **Decide el dueño** |
| Guía existente `/guias/escapada-fin-de-semana-gualiva/` | "fin de semana escapadas" 260, con **pico en enero de 590**. Es genérica (SERP de pueblos). Insumo para enriquecer la guía; **no** justifica una URL nueva |
| P2 #8 guía de precios | "glamping cerca a bogotá precios económicos" 480 (+23%), ya en QN. Sin cambios; sigue bloqueada por el Bloque C |

### 3.4 · Aniversario (solo como sección)

"ideas para celebrar aniversario" 140, "planes de aniversario" 110 y "planes aniversario" 90: mayormente informacional (≈550 con cola). **No justifica una URL en QN.** Recomendación: una sección o FAQ dentro de la guía romántica (§3.2). Amantia tendrá su propia página de oferta cuando exista el paquete (`/plan-aniversario-cerca-de-bogota/`).

---

## 4. Reparto de intenciones entre dominios (para no canibalizar)

| Intención | Dueño | Formato en QN | Formato en Amantia |
|---|---|---|---|
| glamping cerca a Bogotá (6.600) | **Conviven** | Guía de decisión por zonas (ya existe; no tocar el title en 8–12 semanas, según QN) | Landing de una propiedad: "el viaje desde Bogotá" |
| glamping Villeta (1.600) | **Conviven** | Directorio / decisión: "glamping en Villeta" (P1-1.1) | Propiedad "cerca de Villeta, en Quebradanegra" |
| glamping quebradanegra | **Conviven** (actualizado 2026-10-17) | Directorio de varios glampings: `/quebrada-negra/glamping/` (sigue siendo el dueño del ángulo directorio) | Página de **ubicación propia**: `https://amantia.com.co/glamping-en-quebradanegra/` (dónde está Amantia; aclara que no es el negocio vecino "Glamping Quebradanegra") |
| hospedaje en Villeta, cabañas en Villeta | **QN** | P2 #1 y #2 | — |
| planes en pareja / escapada romántica | **QN** | Guía romántica (§3.2) | Solo secciones en su home |
| pedida de mano (inspiración) | **QN** | Guía nueva (§3.1) | Página de oferta cuando exista el paquete |
| clima cálido / tierra caliente | **QN** | Ver P2 #4 | Solo el dato concreto ("días de 28 °C") |
| qué hacer, cascadas, cómo llegar, Útica | **QN** | Ya existen | Amantia enlaza hacia allá |
| glamping con jacuzzi / piscina privada, cabañas para parejas | **Amantia** | QN puede mencionarlo en fichas, sin página dedicada | Landings propias |

---

## 5. Lo que NO se hace (refuerza el P3 de QN)

- No escribir "Amantia Glamping" ni declarar a Amantia "en Villeta".
- No publicar tarifas de Amantia mientras no exista la tarifa simétrica de los demás (Bloque C).
- No usar renders de Amantia como si fueran fotos, ni imágenes generadas con IA, en QN.
- No crear en QN páginas sobre atributos de la propiedad de Amantia ("glamping con jacuzzi privado", "cabañas para parejas"): son de Amantia.
- No copiar textos de Amantia.com.co en QN, ni al revés.
- No poner `aggregateRating` ni reseñas de Amantia (no existen).

---

## 6. Decisiones del dueño que este brief deja abiertas

1. **P0 de QN:** desbloquear los crawlers de IA y redirigir `pages.dev`.
2. **P2 #4:** a quién se adjudica "clima cálido / tierra caliente" (Villeta o `/glamping/cerca-de-bogota/`), con el dato nuevo de 210/mes.
3. **Guía de pedida de mano (§3.1):** si se hace, y qué lugares reales del Gualivá se incluyen (dato de terreno).
4. **Guía romántica (§3.2):** si el title y H1 migran a "planes en pareja cerca a Bogotá".
5. **`type` de Amantia en `stays.ts`:** `'glamping'` (recomendado) o `'cabana'`.

---

## 7. Orden sugerido de ejecución

1. **P1-A y P1-B** (código, sin pipeline): un commit, build y deploy. Verificar en el HTML que el JSON-LD de Amantia trae NAP y geo, y que los `href` y `label` de los CTA son los de la tabla de la §2.
2. **P1-C:** actualizar `SEO-ROADMAP.md`.
3. **§3.1 y §3.2** por el pipeline completo (brief → draft → review adversarial), con los datos de terreno que aporte el dueño.
4. **§3.3:** integrar los datos nuevos cuando se ejecuten esas piezas de su roadmap.

**Contacto de coordinación:** cualquier cambio en datos de Amantia sale de `docs/strategy/datos-amantia.md` en el repo de Amantia. Si QN necesita un dato que no está ahí, es `TODO` y se pregunta al dueño; no se infiere.
