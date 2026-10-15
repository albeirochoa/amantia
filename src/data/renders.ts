// Renders del arquitecto (diseño "Refugio de Sombra"), convertidos a WebP en 800 y 1600 px.
// Siempre se muestran con la etiqueta "Render". Nunca usar estos archivos como foto real.
// Excluida por el dueño: exterior entre jardines al atardecer (2026-10-15).
// Las imágenes "conceptual" son generadas con IA: se etiquetan "Imagen conceptual", nunca "Render".

export interface Render {
  file: string; // nombre base en /public/images/renders/{file}-{800|1600}.webp
  alt: string;
  caption: string;
  /** render = del arquitecto; conceptual = imagen generada con IA, NO es el diseño real. */
  kind: 'render' | 'conceptual';
  /** Alto en px de la versión de 1600 de ancho (evita saltos de diseño). */
  h: number;
}

const r = (file: string, alt: string, caption: string): Render => ({ file, alt, caption, kind: 'render', h: 1198 });
const c = (file: string, alt: string, caption: string, h: number): Render => ({ file, alt, caption, kind: 'conceptual', h });

export const label = (img: Render) => (img.kind === 'render' ? 'Render' : 'Imagen conceptual');

export const RENDERS = {
  piscinaAtardecer: r('cabana-piscina-atardecer', 'Render de una cabaña de Amantia en Quebradanegra al atardecer, con su piscina privada en primer plano', 'Cabaña y piscina privada'),
  piscinaDia: r('cabana-piscina-dia', 'Render de una cabaña de Amantia en Quebradanegra de día, con piscina privada y tumbonas', 'La piscina, de día'),
  terrazaNoche: r('terraza-piscina-noche', 'Render de la terraza y la piscina privada de una cabaña de Amantia, iluminadas de noche', 'La terraza, de noche'),
  habitacionVentanal: r('habitacion-ventanal', 'Render de la habitación con ventanal hacia la vegetación', 'Habitación'),
  habitacionCalida: r('habitacion-calida', 'Render de la habitación con luz cálida y cama doble', 'Habitación, luz cálida'),
  habitacionDetalle: r('habitacion-detalle', 'Render de la cama y la pared de acento de la habitación', 'Detalle de la habitación'),
  banoDucha: r('bano-ducha', 'Render del baño con ducha abierta a la vegetación', 'Baño'),
  banoLavamanos: r('bano-lavamanos', 'Render del lavamanos en piedra del baño', 'Baño, piedra natural'),
  interiorPiedra: r('interior-piedra', 'Render de un interior con muro de piedra natural y madera', 'Piedra y madera'),
  interiorBarra: r('interior-barra', 'Render de un interior con barra de madera y repisas iluminadas', 'Interior'),
  // Imágenes conceptuales (IA), aprobadas por el dueño el 2026-10-15. Siempre con la etiqueta "Imagen conceptual".
  jacuzziMontanas: c('conceptual-jacuzzi-montanas', 'Imagen conceptual de un jacuzzi en piedra junto a una piscina, con vista a las montañas', 'Jacuzzi y piscina', 900),
  portonLlegada: c('conceptual-porton-llegada', 'Imagen conceptual del portón de entrada de Amantia al atardecer', 'La llegada', 1098),
} as const;

export const srcset = (file: string) =>
  `/images/renders/${file}-800.webp 800w, /images/renders/${file}-1600.webp 1600w`;
export const src = (file: string, w: 800 | 1600 = 1600) => `/images/renders/${file}-${w}.webp`;
