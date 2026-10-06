# Gobierno SEO de Amantia

## Principio central

No optimizar por palabras sueltas. Optimizar por intención.

## Regla de creación de URLs

Una URL nueva solo se crea si responde claramente a una intención distinta.

Preguntas obligatorias:

1. ¿Qué quiere lograr el usuario?
2. ¿En qué etapa del funnel está?
3. ¿Existe una URL actual que ya pueda absorber la búsqueda?
4. ¿La SERP muestra un tipo de resultado distinto?
5. ¿El contenido tendría un protagonista diferente?
6. ¿El CTA y recorrido serían diferentes?
7. ¿Existe riesgo de canibalización?

Si las respuestas no justifican una página independiente, consolidar.

## Mapa inicial

| URL | Intención | Funnel | Protagonista |
|---|---|---:|---|
| `/glamping-cerca-de-bogota/` | encontrar glamping accesible desde Bogotá | BOFU | cercanía + experiencia |
| `/glamping-en-quebrada-negra/` | encontrar glamping en el destino | BOFU | ubicación + alojamiento |
| `/glamping-cerca-de-villeta/` | encontrar alojamiento/glamping próximo a Villeta | BOFU | proximidad a Villeta |
| `/glamping-para-parejas/` | encontrar glamping pensado para dos | BOFU | pareja |
| `/glamping-con-jacuzzi/` | encontrar glamping con jacuzzi | BOFU | jacuzzi |
| `/cabana-con-jacuzzi-cerca-de-bogota/` | encontrar cabaña con jacuzzi | BOFU | atributo + cercanía |
| `/escapada-romantica-cerca-de-bogota/` | organizar una escapada de pareja | MOFU | escapada |
| `/plan-romantico-cerca-de-bogota/` | encontrar un plan romántico | MOFU | plan |
| `/escapada-fin-de-semana-cerca-de-bogota/` | salir de Bogotá un fin de semana | MOFU | fin de semana |

## Regla anti-canibalización

Evitar crear simultáneamente URLs como:

- `/glamping-romantico-bogota/`
- `/glamping-para-parejas-bogota/`
- `/glamping-para-novios-bogota/`

si la intención y SERP son esencialmente iguales.

## Distinción entre dominios

### Amantia
- alojamiento,
- experiencia,
- pareja,
- jacuzzi,
- escapada,
- reserva.

### QuebradaNegra.com
- destino,
- qué hacer,
- turismo,
- restaurantes,
- naturaleza,
- negocios,
- rutas,
- directorio.

## Enlazado interno

Cada landing debe enlazar hacia:

1. página comercial siguiente,
2. alojamiento relevante,
3. contenido relacionado,
4. páginas del mismo clúster cuando exista sentido.

No crear mallas artificiales de enlaces.

## Indexabilidad

No indexar automáticamente:

- filtros,
- resultados internos,
- parámetros,
- variantes sin contenido único,
- páginas duplicadas.

## Canonicals

Cada página indexable debe tener canonical coherente.

## Redirects

Nunca cambiar un slug publicado sin 301 y registro en `docs/seo/redirects.md`.
