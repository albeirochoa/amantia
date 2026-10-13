# Silos de Amantia, SEO programático y reparto con QuebradaNegra.com

**Fecha:** 2026-10-13
**Estado:** `PROPOSAL`, pendiente de aprobación.
**Base:**
- `docs/seo/investigacion-fase1.md`
- `docs/seo/keywords/consolidado.tsv`
- Auditoría del repo `C:\proyectos\quebradanegra\quebradanegra` (commit `6d89090`, 15 URLs publicadas)

---

## 1. ¿QuebradaNegra.com es SEO programático?

**No. Es editorial con plantillas.**
- Tiene 15 URLs indexables. Solo una ruta es dinámica (`/guias/[slug]/`, que genera 4 guías escritas a mano).
- `towns.ts` y `stays.ts` alimentan fichas y schema, pero no generan páginas.
- Su propia estrategia **prohíbe** escalar de forma programática. Aplica el filtro 500/60/1 (≥500 palabras, ≥60% de contenido único, ≥1 dato de primera mano) y descarta crear páginas por marca competidora porque serían doorway.

## 2. ¿Amantia necesita SEO programático?

**Hoy no. Se revisará cuando se cumplan los disparadores de la tabla de abajo.** Hay tres motivos:

1. **No hay una matriz que escalar.**
   - Ubicación: solo hay 2 valores honestos, Bogotá (origen) y Villeta (cercanía). "Glamping en Santa Elena", "en San Gil", etc. no aplican, porque Amantia no está allí.
   - Atributos: 2 firmes (jacuzzi, pareja) y 2 condicionados (piscina privada, clima).
   - Los cruces ubicación × atributo tienen 30–50 búsquedas al mes y se resuelven como secciones, no como URLs.
2. **El riesgo de penalización afecta a todo el sitio.** Las políticas de Google sobre *doorway abuse* y *scaled content abuse* describen justo esto: muchas páginas parecidas que llevan a la misma unidad. La penalización no se queda en esas páginas; también arrastra a las landings que sí valen.
3. **`AGENTS.md` §13 ya lo excluye** ("páginas programáticas masivas").

**Disparadores para reabrir la decisión:**

| Disparador | Habilita |
|---|---|
| ≥2 unidades | `/alojamientos/` |
| ≥3 unidades con diferencias reales (capacidad, privacidad del jacuzzi o la piscina, precio) y fotos propias | `/alojamientos/[slug]/` generado desde una colección |
| ≥4 paquetes o experiencias reales con precio, qué incluyen y fotos | `/experiencias/[slug]/` |
| Nueva sede en otro municipio | Una página por sede. **Nunca** páginas por municipios donde Amantia no opera |
| Search Console muestra un clúster con impresiones sostenidas y sin URL que lo absorba | Una página nueva individual, no un lote |

**Qué construir desde ya como plantillas, aunque generen pocas páginas:**

1. **Colección de alojamientos** (`src/content/alojamientos/`, con esquema Zod). Campos: m², capacidad, `jacuzzi {calefactado, privado}`, `piscina {privada}`, tarifa, fotos y reglas. De ahí salen el schema y los bloques de amenidades, y un atributo como "privado" solo aparece si el dato existe.
2. **Layout de landing BOFU** alimentado por datos (keyword, protagonista, secciones únicas, FAQ y enlaces), con el filtro de calidad 500/60/1 heredado de QuebradaNegra.
3. **Componente de enlazado** que lee el grafo de silos desde datos.

## 3. Silos propuestos

```
S0 · ALOJAMIENTO Y RESERVA (transversal)
    /  (dueña de "glamping para pareja(s)" + sección ocasiones)
    /alojamientos/[slug]/  → disponibilidad / reserva
│
├─ S1 · CERCA DE BOGOTÁ (BOFU, origen)
│     PILAR /glamping-cerca-de-bogota/  (6.600, hub de conversión)
│     sección precios (si hay tarifa publicada)
│
├─ S2 · VILLETA (BOFU, cercanía)
│     PILAR /glamping-cerca-de-villeta/  → SOLO "glamping villeta" (1.600) con el ángulo honesto
│           "en Quebradanegra, cerca de Villeta". NO absorbe hospedaje ni cabañas en Villeta (son de QN)
│
├─ S3 · JACUZZI (BOFU, la mejor apuesta)
│     PILAR /glamping-con-jacuzzi/  (480, +84%; absorbe cabaña con jacuzzi privado parejas 140,
│           cabañas para parejas con jacuzzi 90, jacuzzi privado 90, cerca a Bogotá con jacuzzi 50)
│     └─ P2 /glamping-con-piscina-privada-cerca-de-bogota/  (≈200; solo si la piscina es privada)
│
└─ S4 · PAREJAS Y OCASIONES (MOFU)
      PILAR /planes-en-pareja-cerca-de-bogota/  (≈1.000–1.500 con variantes)
      └─ P1 /plan-aniversario-cerca-de-bogota/  (solo con un paquete real)
         secciones: noche romántica; pedida de mano (en /)
```

**Salen de la propuesta anterior:**
- `/glamping-en-quebradanegra/`: "Glamping Quebradanegra" es un **competidor** (`CONFIRMED` en `stays.ts` de QN, Instagram `@glampingquebradanegra`), y esa intención de directorio ya la trabaja QN en `/quebrada-negra/glamping/`, su única página con tracción en Search Console.
- `/glamping-clima-calido-cerca-de-bogota/`: QN documenta Quebradanegra a **1.105 m, clima templado**. Ese término es de Villeta y por tanto de QN. Amantia no debe usar "clima cálido" salvo verificación.

**Reglas de enlazado:**
- **Hacia arriba:** cada hija enlaza a su pilar, y cada pilar a la home.
- **Lateral, solo con sentido:** S1↔S2, S1↔S3, S4↔S3. Nunca todos con todos.
- **Hacia abajo:** toda página enlaza a la ficha del alojamiento y al CTA de disponibilidad. La ficha enlaza solo a los pilares cuyo atributo cumple.
- **Ninguna landing** usa "glamping para parejas" en el title, porque esa keyword es de la home.

## 4. Reparto de intenciones entre dominios

| Intención | Dueño | Notas |
|---|---|---|
| Qué hacer en Quebradanegra, Villeta y Útica; cascadas; cómo llegar | **QN** | Amantia enlaza hacia allá (salida desde S2) |
| Hospedaje en Villeta (1.000), cabañas en Villeta (480) | **QN** | Directorio multi-hospedaje; prioridades P2 #1 y #2 de QN |
| Glamping Quebradanegra (directorio), clima cálido, guía de precios | **QN** | |
| Escapada fin de semana, lugares para descansar o desconectarse | **QN** | SERP de pueblos |
| Glamping para pareja(s), jacuzzi, planes en pareja, aniversario, noche romántica | **Amantia** | El dataset de QN no las asigna a ninguna página |
| **Glamping villeta (1.600)** | ⚠️ **DECIDIR** | Propuesta: Amantia (la SERP es transaccional: OTAs); QN reorienta `/villeta/glamping/` hacia `/villeta/donde-dormir/` |
| **Glamping cerca a Bogotá (6.600)** | ⚠️ **DECIDIR** | Propuesta: conviven con titles diferenciados. QN se queda la guía informativa ("qué zona y cuándo ir") y Amantia la landing de conversión. QN ya la deja "sin inversión" |
| **Escapada romántica / planes en pareja** | ⚠️ **DECIDIR** | QN tiene publicada `/guias/escapada-romantica-cerca-de-bogota/`. Propuesta: Amantia se queda "planes en pareja cerca a Bogotá" y QN reorienta su guía al destino ("fin de semana en pareja en el Gualivá") y enlaza a S4 |

**Entradas desde QN** (hoy los 14 CTA de QN apuntan a la raíz de Amantia; `CTAAmantia` acepta `href`):

| Página QN | → Amantia |
|---|---|
| `/glamping/cerca-de-bogota/` | S1 |
| `/villeta/glamping/` (o `/villeta/donde-dormir/`) y `/quebrada-negra/glamping/` | S2 y ficha |
| Ficha de Amantia en el directorio | S3 y ficha |
| Guía romántica y `/guias/escapada-fin-de-semana-gualiva/` | S4 |
| `/quebrada-negra/que-hacer/` | home |

**Coherencia NAP:** QN describe a Amantia como "en desarrollo" y sin dirección, geo ni teléfono. Cuando Amantia publique su NAP, hay que actualizar `stays.ts` de QN para que ambos coincidan. Amantia se presenta siempre "en Quebradanegra, cerca de Villeta", **nunca "en Villeta"** (por el RNT y Google Maps).

## 5. Datos pendientes

- Número de unidades.
- Si el jacuzzi y la piscina son privados.
- Tarifa.
- Altitud y clima de la unidad.
- Distancia y tiempo a Villeta.
- Paquetes.
- Si la unidad puede llamarse "cabaña".
- NAP (dirección, geo, teléfono).
- Search Console.
- Revisión de la SERP en móvil desde Colombia.
