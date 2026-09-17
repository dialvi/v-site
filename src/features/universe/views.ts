import type { CameraState } from '@/hooks/useCamera';

export type SectionId =
  | 'historia'
  | 'lista'
  | 'archivo'
  | 'conclusion'
  | 'investigacion'
  | 'secretos'
  | 'mapa';

export type ViewId = 'intro' | 'map' | SectionId;

export const WORLD = { width: 2360, height: 2460 };

/** Osa Mayor: el cazo rodea el nombre; el mango sale por la esquina inferior derecha. */
export const nodes = {
  title: { x: 830, y: 995 },
  historia: { x: 560, y: 720 },
  archivo: { x: 1040, y: 760 },
  lista: { x: 600, y: 1220 },
  investigacion: { x: 600, y: 1220 },
  mapa: { x: 1120, y: 1280 },
  secretos: { x: 1580, y: 1500 },
  conclusion: { x: 1920, y: 1960 },
};

export const sectionNodes: {
  id: SectionId;
  x: number;
  y: number;
  kicker: string;
  label: string;
  glyph: string;
  delay: number;
}[] = [
  { id: 'historia', ...nodes.historia, kicker: '01', label: 'Historia', glyph: '✦', delay: 80 },
  { id: 'lista', ...nodes.lista, kicker: 'vale', label: 'La lista', glyph: '▴', delay: 160 },
  { id: 'mapa', ...nodes.mapa, kicker: 'sitios', label: 'Mapa', glyph: '⌖', delay: 240 },
  { id: 'archivo', ...nodes.archivo, kicker: '03', label: 'Archivo', glyph: '◎', delay: 320 },
  { id: 'secretos', ...nodes.secretos, kicker: 'privado', label: 'Confidencial', glyph: '◇', delay: 480 },
  { id: 'conclusion', ...nodes.conclusion, kicker: 'fin', label: 'La conclusión', glyph: '—', delay: 560 },
];

export const constellationLines: [keyof typeof nodes, keyof typeof nodes][] = [
  ['historia', 'lista'],
  ['lista', 'mapa'],
  ['mapa', 'archivo'],
  ['archivo', 'historia'],
  ['mapa', 'secretos'],
  ['secretos', 'conclusion'],
];

function fit(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  vw: number,
  vh: number,
  pad = 0.9,
): CameraState {
  const scale = Math.min(vw / (maxX - minX), vh / (maxY - minY)) * pad;
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    scale,
  };
}

export function viewFor(id: ViewId, vw = 390, vh = 844): CameraState {
  switch (id) {
    case 'intro':
      return {
        x: nodes.title.x,
        y: nodes.title.y + 24,
        scale: Math.min(1.22, (vw * 0.78) / 268),
      };
    case 'map':
      return fit(420, 1980, 540, 2020, vw, vh, 0.92);
    case 'historia':
      return { x: nodes.historia.x, y: nodes.historia.y, scale: Math.min(2.35, vw / 160) };
    case 'lista':
      return { x: nodes.lista.x, y: nodes.lista.y, scale: Math.min(2.15, vw / 170) };
    case 'archivo':
      return { x: nodes.archivo.x, y: nodes.archivo.y, scale: Math.min(2.35, vw / 160) };
    case 'conclusion':
      return { x: nodes.conclusion.x, y: nodes.conclusion.y, scale: Math.min(2.1, vw / 170) };
    case 'investigacion':
      return { x: nodes.investigacion.x, y: nodes.investigacion.y, scale: Math.min(2.2, vw / 165) };
    case 'secretos':
      return { x: nodes.secretos.x, y: nodes.secretos.y, scale: Math.min(2.2, vw / 165) };
    case 'mapa':
      return { x: nodes.mapa.x, y: nodes.mapa.y, scale: Math.min(2.2, vw / 165) };
  }
}
