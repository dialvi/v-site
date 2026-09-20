export type Galaxy = {
  id: number;
  catalog: string;
  x: number;
  y: number;
  size: number;
  hue: 'gold' | 'ice' | 'dust' | 'rose' | 'steel';
  spin: number;
  /** Pista cuando en la Historia aparece un «secreto». */
  clue?: string;
  /** El secreto de verdad. Vacío hasta que esté en el código. */
  secret?: string;
};

export const secretsIntro =
  'Ocho galaxias. Están lejos. Casi no hay datos: de algunas, una pista en la Historia. De las otras, de momento, nada.';

export const galaxies: Galaxy[] = [
  {
    id: 1,
    catalog: 'GN-z11',
    x: 22,
    y: 26,
    size: 4.6,
    hue: 'gold',
    spin: 52,
    clue: 'Historia 01.03. Un sitio que en primavera se llena de flores. Aún no lo hemos encontrado. Sigue pendiente.',
  },
  {
    id: 2,
    catalog: 'HD1',
    x: 78,
    y: 20,
    size: 3.2,
    hue: 'ice',
    spin: 67,
    clue: 'Historia 03.09. Chiringuito. Granizados, terraza, atardecer. Por qué se sentó exactamente en esa silla? Aún es un misterio.',
  },
  {
    id: 3,
    catalog: 'JADES-GS-z13',
    x: 48,
    y: 44,
    size: 5.4,
    hue: 'dust',
    spin: 84,
    clue: 'Historia 04.01. Bajaste de tu pisito. Algo me desconcentró.',
  },
  {
    id: 4,
    catalog: 'MACS0647-JD',
    x: 16,
    y: 64,
    size: 3.6,
    hue: 'rose',
    spin: 41,
    clue: 'Historia 04.04. Jarritos en El Pardo. Recuerdas el sabor? Pero hay algo más...',
  },
  {
    id: 5,
    catalog: 'GLASS-z12',
    x: 84,
    y: 58,
    size: 4.0,
    hue: 'steel',
    spin: 73,
  },
  {
    id: 6,
    catalog: 'WHL0137-08',
    x: 40,
    y: 78,
    size: 2.8,
    hue: 'gold',
    spin: 96,
  },
  {
    id: 7,
    catalog: 'SPT0615-JD',
    x: 66,
    y: 72,
    size: 2.4,
    hue: 'ice',
    spin: 58,
  },
  {
    id: 8,
    catalog: 'CEERS-93316',
    x: 54,
    y: 14,
    size: 2.1,
    hue: 'steel',
    spin: 110,
  },
];
