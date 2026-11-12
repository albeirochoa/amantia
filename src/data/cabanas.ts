import { RENDERS, type Render } from './renders';

// Las 3 cabañas tienen nombre y vista distintos, y una es un poco más grande (dueño, 2026-10-15).
// Nombres PROVISIONALES aprobados por el dueño el 2026-10-15.
// Pendiente (TODO): vista de cada una, cuál es la más grande y sus medidas. Al tenerlos, cada una tendrá /cabanas/[slug]/.
export interface Cabana {
  /** Igual al id de la tabla cabins del motor de reservas (migrations/0001). */
  slug: string;
  name: string;
  tagline: string;
  size: string;
  image: Render;
}

export const CABANAS: Cabana[] = [
  { slug: 'la-calma', name: 'La calma', tagline: 'Un espacio íntimo para desconectarse de la rutina y disfrutar del entorno.', size: 'Desde 72 m² con terraza', image: RENDERS.piscinaAtardecer },
  { slug: 'el-encuentro', name: 'El encuentro', tagline: 'Diseñado para detener el tiempo, conversar y celebrar lo cotidiano.', size: 'Desde 72 m² con terraza', image: RENDERS.terrazaNoche },
  { slug: 'el-instante', name: 'El instante', tagline: 'Una escapada para cambiar de escenario sin renunciar a la comodidad.', size: 'Desde 72 m² con terraza', image: RENDERS.piscinaDia },
];
