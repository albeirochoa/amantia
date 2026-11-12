// Reglas comerciales del motor de reservas (ADR-004).
// Estados según AGENTS.md §9. Nada aquí es definitivo mientras diga TODO o PROPOSAL.

export const BOOKING = {
  guests: 2, // CONFIRMED: capacidad por cabaña (datos-amantia.md). Sin selector de huéspedes (roadmap).
  holdMinutes: 15, // PROPOSAL: tiempo que la cabaña queda retenida mientras se paga.
  depositPercent: 30, // PROPOSAL (prototipo CRO): anticipo que se paga en línea. TODO dueño.
  minNights: 1, // CONFIRMED (dueño, 2026-11-10).
  maxNights: 14, // PROPOSAL
  maxAdvanceDays: 365, // PROPOSAL: hasta cuándo se puede reservar.
  maxActiveHoldsPerIp: 2, // Evita que alguien retenga todas las cabañas a la vez.
  alternativesWindowDays: 7, // Búsqueda de fechas cercanas cuando no hay disponibilidad.
  currency: 'COP',
  tzOffsetHours: -5, // Colombia, sin horario de verano.
};

// Extras por estadía (dueño, 2026-11-10: $99.000 cada uno). Textos del prototipo CRO.
// TODO dueño: proveedor, anticipación mínima y qué incluye exactamente cada uno.
export const EXTRAS = [
  { id: 'decoracion', name: 'Decoración romántica', description: 'Preparada en la cabaña antes de tu llegada.', priceCop: 99000 },
  { id: 'cena', name: 'Cena para dos', description: 'Servida en la cabaña.', priceCop: 99000 },
  { id: 'masaje', name: 'Masaje para dos', description: 'Con reserva previa.', priceCop: 99000 },
];

/** Lee el entorno del Worker con valores seguros por defecto. */
export function runtime(env) {
  const environment = env.ENVIRONMENT || 'production';
  const provider = env.PAYMENT_PROVIDER || 'wompi';
  return {
    environment,
    enabled: env.BOOKING_ENABLED === 'true',
    // simulated = pasarela falsa (sin llaves de Wompi). Mientras esté activo, el sitio muestra "Modo de prueba".
    provider: provider === 'simulated' ? 'simulated' : 'wompi',
    wompiEnv: env.WOMPI_ENV === 'production' ? 'production' : 'sandbox',
    opensOn: env.BOOKING_OPENS_ON || null, // YYYY-MM-DD, primera noche reservable (apertura)
  };
}
