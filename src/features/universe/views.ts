import type { CameraState } from '@/hooks/useCamera';

export type ViewId = 'intro' | 'map' | 'historia' | 'lista' | 'archivo' | 'finale';

export const WORLD = { width: 1200, height: 1600 };

export const nodes = {
  historia: { x: 360, y: 600 },
  archivo: { x: 840, y: 640 },
  lista: { x: 600, y: 1120 },
  title: { x: 600, y: 830 },
};

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
      return { x: nodes.title.x, y: nodes.title.y - 10, scale: Math.max(2.15, vw / 180) };
    case 'map':
      return fit(240, 960, 480, 1260, vw, vh, 0.88);
    case 'historia':
      return { x: nodes.historia.x, y: nodes.historia.y, scale: Math.min(2.35, vw / 160) };
    case 'lista':
      return { x: nodes.lista.x, y: nodes.lista.y, scale: Math.min(2.15, vw / 170) };
    case 'archivo':
      return { x: nodes.archivo.x, y: nodes.archivo.y, scale: Math.min(2.35, vw / 160) };
    case 'finale':
      return { x: nodes.title.x, y: nodes.title.y, scale: Math.min(1.6, vw / 220) };
  }
}
