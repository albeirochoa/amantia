// Datos de hecho del sitio. Fuente: docs/strategy/datos-amantia.md (HARD RULE 1).
// Nada que no esté CONFIRMED allí entra aquí; lo pendiente va como TODO.

export const SITE = {
  name: 'Amantia',
  url: 'https://amantia.com.co',
  email: 'hola@amantia.com.co',
  instagram: null as string | null, // TODO: confirmar @amantiacundinamarca
  whatsapp: '573126311226', // CONFIRMED (dueño, 2026-10-15): +57 312 631 1226
  phoneDisplay: '+57 312 631 1226',
  address: {
    street: 'Vereda Casa Vieja',
    locality: 'Quebradanegra',
    region: 'Cundinamarca',
    country: 'CO',
  },
  geo: { lat: 5.137415, lon: -74.480506, elevation: 1080 },
  facts: {
    cabins: 3,
    guestsPerCabin: 2,
    minSizeM2: 72, // incluye terraza (interior ≈44 m²). Decir "desde 72 m² con terraza"; una cabaña es más grande
    kmFromBogota: 90,
    kmToVilletaStraight: 14, // 13,9 km en línea recta
    dayTempC: 28,
    nightTempC: 17,
  },
  // false = la lista de apertura usa WhatsApp; true = formulario (cuando exista el sistema de captura).
  captureEnabled: false,
  openingDate: null as string | null, // TODO: fecha de apertura
  driveTimeFromBogota: null as string | null, // TODO: tiempo por carretera
  // Google Tag Manager (dueño, 2026-10-16). null = desactivado.
  gtmId: 'GTM-5LCBVRGP' as string | null,
  tagline: 'Menos ruido. Más presencia.',
  // Frase-entidad (ADR-003): primer párrafo visible de la home.
  entity:
    'Amantia es un refugio de tres cabañas privadas para parejas en la vereda Casa Vieja, Quebradanegra (Cundinamarca), a 90 km de Bogotá. Cada una tiene desde 72 m² con terraza, jacuzzi calefactado y piscina propios.',
};

// Navegación. En copy visible no se usa "glamping" fuera de las landings (ADR-003).
export const NAV = [
  { href: '/cabanas/', label: 'Las cabañas' },
  { href: '/glamping-con-jacuzzi/', label: 'Jacuzzi y piscina' },
  { href: '/glamping-cerca-de-bogota/', label: 'Desde Bogotá' },
  { href: '/glamping-cerca-de-villeta/', label: 'Cerca de Villeta' },
  { href: '/origenes/', label: 'Orígenes' },
];

/** Enlace de WhatsApp con mensaje prellenado. */
export const waLink = (text: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export const QN = {
  queHacer: 'https://quebradanegra.com/quebrada-negra/que-hacer/',
  comoLlegar: 'https://quebradanegra.com/quebrada-negra/como-llegar/',
  villeta: 'https://quebradanegra.com/villeta/que-hacer/',
};
