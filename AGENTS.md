# AGENTS.md — Reglas globales del proyecto Amantia

## 1. Propósito del proyecto

Amantia no debe desarrollarse como una simple página web de un glamping.

Debe construirse como un sistema digital de adquisición, descubrimiento y conversión alrededor de:

- escapadas,
- parejas,
- naturaleza,
- privacidad,
- jacuzzi cuando aplique,
- alojamiento,
- reserva directa.

La métrica principal del proyecto es:

> reservas rentables provenientes de activos propios.

El tráfico, SEO, contenido, UX y diseño son medios, no el objetivo final.

---

## 2. Relación con QuebradaNegra.com

QuebradaNegra.com representa principalmente **el destino**.

Amantia representa principalmente **la experiencia y el alojamiento**.

### QuebradaNegra.com

Territorios principales:

- turismo,
- qué hacer,
- naturaleza,
- senderos,
- restaurantes,
- negocios locales,
- directorio,
- rutas,
- historia,
- atractivos,
- Villeta,
- Útica,
- Gualivá,
- información práctica del destino.

### Amantia

Territorios principales:

- glamping,
- escapadas,
- parejas,
- jacuzzi,
- romanticismo,
- privacidad,
- descanso,
- naturaleza,
- alojamiento,
- reserva.

Los dos sitios son complementarios y no deben competir sistemáticamente por las mismas intenciones.

---

## 3. Reglas duras

### HARD RULE 1
No inventar datos.

Nunca inventar:

- precios,
- capacidades,
- amenidades,
- distancias,
- tiempos de viaje,
- testimonios,
- disponibilidad,
- políticas,
- reconocimientos,
- servicios,
- jacuzzi,
- alimentación,
- ubicaciones exactas.

Cuando falte información usar `TODO`.

### HARD RULE 2
No crear una nueva URL SEO sin validar:

1. intención,
2. SERP,
3. solapamiento con páginas existentes,
4. posible canibalización,
5. función dentro del clúster,
6. siguiente paso de conversión.

### HARD RULE 3
Una keyword no equivale automáticamente a una URL.

Variaciones semánticamente equivalentes deben consolidarse cuando compartan intención.

### HARD RULE 4
Cada landing SEO debe tener un protagonista claro.

Ejemplos:

- `/glamping-para-parejas/` → la pareja.
- `/glamping-con-jacuzzi/` → el jacuzzi.
- `/escapada-romantica-cerca-de-bogota/` → la escapada.
- `/glamping-en-quebrada-negra/` → alojamiento dentro del destino.
- `/glamping-cerca-de-bogota/` → proximidad + experiencia.

### HARD RULE 5
No cambiar slugs existentes sin:

- revisar tráfico,
- revisar indexación,
- revisar enlaces,
- definir redirección 301,
- documentar el cambio.

### HARD RULE 6
No eliminar contenido indexable sin evaluar impacto SEO.

### HARD RULE 7
No modificar la arquitectura SEO sin explicar impacto y dejar registro.

### HARD RULE 8
No sacrificar rendimiento por efectos visuales.

### HARD RULE 9
No almacenar secretos, tokens ni credenciales en el repositorio.

### HARD RULE 10
No ejecutar cambios irreversibles sin respaldo o estrategia de recuperación.

---

## 4. Preferencias técnicas

- Mobile first.
- HTML semántico.
- Accesibilidad básica obligatoria.
- Componentes reutilizables.
- Dependencias mínimas.
- Imágenes optimizadas.
- Renderizado rastreable.
- JavaScript de cliente solo cuando aporte valor real.
- Core Web Vitals como requisito.
- Código modular y documentado.
- Evitar duplicación.
- Mantener separación entre contenido, lógica y presentación.

---

## 5. Preferencias de diseño

Amantia debe sentirse:

- contemporáneo,
- natural,
- cálido,
- íntimo,
- tranquilo,
- sofisticado sin lujo artificial,
- editorial,
- fotográfico.

Evitar:

- estética SaaS,
- exceso de tarjetas,
- gradientes genéricos,
- glassmorphism,
- iconografía innecesaria,
- animaciones gratuitas,
- copy grandilocuente,
- apariencia evidente de “sitio generado por IA”.

La fotografía real debe ser protagonista.

---

## 6. Tono de comunicación

Debe ser:

- cálido,
- directo,
- sencillo,
- sensorial,
- creíble.

Evitar frases genéricas como:

- “experiencia mágica”,
- “paraíso de ensueño”,
- “momento inolvidable”,
- “oasis único”.

Preferir detalles concretos y verificables.

---

## 7. Funnel de Amantia

TOFU:
- descubrir,
- inspirarse,
- resolver “quiero escaparme”.

MOFU:
- comparar experiencias,
- evaluar pareja, jacuzzi, naturaleza, privacidad.

BOFU:
- elegir alojamiento,
- consultar disponibilidad,
- reservar.

Ruta conceptual:

Descubrimiento → deseo → experiencia → alojamiento → disponibilidad → reserva.

---

## 8. Prioridad de páginas

**Fuente oficial: `docs/seo/url-map.md`** (estructura aprobada y congelada el 2026-10-13, ver ADR-003).

Fase A (lanzamiento): `/`, `/cabanas/`, `/glamping-cerca-de-bogota/`, `/glamping-con-jacuzzi/`, `/glamping-cerca-de-villeta/`, `/origenes/` (noindex) y `/politica-de-privacidad/`.

Una URL nueva exige: ≥300 búsquedas/mes propias, un protagonista distinto y una SERP distinta. Si no los cumple, va como sección de una URL existente.

---

## 9. Estados de información

Usar:

- `CONFIRMED`
- `ASSUMPTION`
- `TODO`
- `PROPOSAL`

Ejemplo:

- Jacuzzi privado: CONFIRMED
- Tiempo exacto desde Bogotá: TODO
- Nueva URL “glamping romántico Bogotá”: PROPOSAL

---

## 10. Jerarquía entre agentes

1. SEO Strategist define intención, clúster y URL.
2. Content / UX / GEO trabajan dentro de esa definición.
3. Developer implementa.
4. QA valida.

Un agente de contenido NO puede crear una nueva URL por iniciativa propia.

Un desarrollador NO puede cambiar una decisión SEO estructural sin aprobación/documentación.

---

## 11. Proceso obligatorio para una nueva landing SEO

1. Nueva oportunidad detectada.
2. Revisar intención.
3. Revisar SERP.
4. Revisar URL existente que pueda absorberla.
5. Ejecutar chequeo de canibalización.
6. SEO Strategist aprueba o rechaza.
7. Crear brief.
8. Diseñar UX/CRO.
9. Implementar.
10. Validar SEO técnico.
11. QA final.
12. Publicar.

---

## 12. Medición mínima

Eventos recomendados:

- `page_view`
- `view_accommodation`
- `click_gallery`
- `check_availability`
- `select_dates`
- `begin_booking`
- `click_whatsapp`
- `submit_form`
- `begin_checkout`
- `purchase`

---

## 13. Qué no construir inicialmente

- marketplace,
- foro,
- red social,
- app móvil,
- OTA propia,
- cientos de artículos,
- páginas programáticas masivas,
- funcionalidades sin necesidad validada.
