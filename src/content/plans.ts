export type Plan = {
  title: string;
  emoji: string;
  body: string;
};

export type Slot = {
  id: number;
  done?: Plan;
  options?: [Plan, Plan];
};

/** 24 casillas: una cada dos semanas, durante un año. */
export const TOTAL_SLOTS = 24;

/** A partir de aquí se abre una casilla nueva cada 14 días. Las 5 primeras ya están disfrutadas. */
export const UNLOCK_START = new Date('2026-09-21T00:00:00+02:00');
const FORTNIGHT_MS = 14 * 24 * 60 * 60 * 1000;
const PAST_DONE = 5;

export const slots: Slot[] = [
  {
    id: 1,
    done: {
      title: 'La Bola del Mundo',
      emoji: '⛰️',
      body: 'El Hike. Jeep levantando polvo, machete, llamada a tu madre y cero cobertura.\n\nBarranca, casi al río, picnic de manguitos, quince minutos de piedras, cabras, el arbolito, el Cachibache, nieve y atardecer en las antenas.\n\nBajamos de noche, con destellos de tormenta y una mini explosión que era el cargador. Fue el primer plan de verdad.',
    },
  },
  {
    id: 2,
    done: {
      title: 'Pantano de San Juan',
      emoji: '⛵',
      body: 'Taller de fabricación de barcos, expedición por el pantano y esa playita VIP de Madrid. El barquito quedó increíble.\n\nSubimos el jeep a unas piedras, vimos el atardecer en el techo del coche y, por fin, torreznos decentes al atardecer.',
    },
  },
  {
    id: 3,
    done: {
      title: 'Tour Madrid norte v1',
      emoji: '🐐',
      body: 'Cabras. Jarritos. Un ataque de tos horrible. Y cenita de horicios en el asturiano.\n\nMadrid norte, primera versión. Ya hay material para la v2.',
    },
  },
  {
    id: 4,
    done: {
      title: 'Mexicana y rooftop',
      emoji: '🌮',
      body: 'Comida mexicana rica rica que no te convenció del todo, pero ganaste la apuesta: el camarero no era mexicano.\n\nLuego rooftop por Madrid, el ático de mi torre, y un vídeo espectacular. Sin tabla de quesos. Esa sigue pendiente.',
    },
  },
  {
    id: 5,
    done: {
      title: 'La fiesta mexicana (intento 1)',
      emoji: '🇲🇽',
      body: 'Intento fallido de fiesta mexicana.\n\nNo salió. Pasa. La volveré a intentar.',
    },
  },
  ...Array.from({ length: TOTAL_SLOTS - PAST_DONE }, (_, i) => ({ id: i + 1 + PAST_DONE })),
];

export function slotById(id: number) {
  return slots.find((s) => s.id === id);
}

export function currentUnlock(now = new Date()) {
  const delta = now.getTime() - UNLOCK_START.getTime();
  if (delta < 0) return PAST_DONE;
  return Math.min(TOTAL_SLOTS, PAST_DONE + Math.floor(delta / FORTNIGHT_MS) + 1);
}

export function isSlotOpen(id: number, now = new Date()) {
  return id <= currentUnlock(now);
}
