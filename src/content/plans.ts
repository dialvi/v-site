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

/** 24 casillas. Las 5 primeras ya están disfrutadas. */
export const TOTAL_SLOTS = 24;
export const PAST_DONE = 5;

/** 20 sep 2026 cae la siguiente; después, una cada 15 días. */
export const UNLOCK_START = new Date('2026-09-20T00:00:00+02:00');
export const UNLOCK_EVERY_DAYS = 15;

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
  {
    id: 6,
    options: [
      {
        title: 'Offroad por el río',
        emoji: '🚙🌊',
        body: 'Ruta offroad por Guadalajara, pegados al río. Picnic y sorpresas.',
      },
      {
        title: 'Canoa y supervivencia',
        emoji: '🛶🎣',
        body: 'Canoa por el pantano más bonito que vas a conocer. Y una experiencia de supervivencia.',
      },
    ],
  },
  ...Array.from({ length: TOTAL_SLOTS - PAST_DONE - 1 }, (_, i) => ({ id: i + 2 + PAST_DONE })),
];

export function slotById(id: number) {
  return slots.find((s) => s.id === id);
}

export function currentUnlock(now = new Date()) {
  let open = PAST_DONE;
  for (let id = PAST_DONE + 1; id <= TOTAL_SLOTS; id++) {
    const at = slotUnlockAt(id);
    if (!at || at.getTime() > now.getTime()) break;
    open = id;
  }
  return open;
}

export function isSlotOpen(id: number, now = new Date()) {
  return id <= currentUnlock(now);
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function prettyDate(d: Date) {
  const base = `${d.getDate()} ${MESES[d.getMonth()]}`;
  return d.getFullYear() === new Date().getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

export function slotUnlockAt(id: number) {
  if (id <= PAST_DONE) return null;
  const step = id - PAST_DONE - 1;
  return new Date(Date.UTC(2026, 8, 20 + step * UNLOCK_EVERY_DAYS, 10, 0, 0));
}

export function daysUntil(d: Date, now = new Date()) {
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((b - a) / 86400000);
}

export function daysLabel(d: Date, now = new Date()) {
  const n = daysUntil(d, now);
  if (n <= 0) return 'hoy';
  if (n === 1) return 'en 1 día';
  return `en ${n} días`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isUnlockDay(id: number, now = new Date()) {
  const at = slotUnlockAt(id);
  return Boolean(at && sameDay(at, now) && isSlotOpen(id, now));
}

const DRAFT_KEY = 'v-lista-options';

function loadDrafts(): Record<string, [Plan, Plan]> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, [Plan, Plan]>;
  } catch {
    return {};
  }
}

/** Si el plan ya está en el código, eso manda. Si no, se usa el borrador local. */
export function optionsFor(slot: Slot): [Plan, Plan] | undefined {
  if (slot.options) return slot.options;
  return loadDrafts()[String(slot.id)];
}

export function rememberDraft(id: number, gifts: [Plan, Plan]) {
  if (slotById(id)?.options) return;
  const drafts = loadDrafts();
  drafts[String(id)] = gifts;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  } catch {
    /* private mode */
  }
}
