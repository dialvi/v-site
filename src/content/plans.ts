export type PlanCategory =
  | 'aventura'
  | 'secreto'
  | 'comida'
  | 'naturaleza'
  | 'absurdo'
  | 'excursion'
  | 'romantico'
  | 'sorpresa';

export type Plan = {
  id: number;
  title: string;
  teaser: string;
  body: string;
  category: PlanCategory;
  prep?: string;
};

export type WeekOffer = {
  week: number;
  prompt: string;
  options: [
    { label: string; emoji: string; planId: number },
    { label: string; emoji: string; planId: number },
  ];
};

export const TOTAL_PLANS = 128;
export const TOTAL_WEEKS = 64;

/** El día que ella abre el regalo. A partir de aquí, una semana = un desbloqueo. */
export const UNLOCK_START = new Date('2026-09-21T00:00:00+02:00');

const authored: Plan[] = [
  {
    id: 1,
    title: 'BolArque',
    teaser: 'Canoa entre barrancos.',
    body: 'Canoa entre barrancos.\nUna cala escondida.\nPesca.\nCocinar lo que pesquemos.\nY alguna cosa que no te voy a contar todavía.',
    category: 'aventura',
    prep: 'Preparación: 100% Diego.',
  },
  {
    id: 2,
    title: 'El sitio que no está en el mapa',
    teaser: 'Una puerta que no parece una puerta.',
    body: 'Hay un sitio en Madrid que no se busca: se llega. Comida que no pide foto. Una mesa que parece habernos estado esperando. El resto, cuando estemos ahí.',
    category: 'secreto',
    prep: 'Yo reservo. Tú solo ven.',
  },
  {
    id: 3,
    title: 'Torreznos 2.0',
    teaser: 'Misma idea. Mejor ejecución.',
    body: 'Volver al espíritu del primer plan, no al mismo sitio. Caminar hasta merecerlo. Comer como si no hubiera que fingir nada.',
    category: 'comida',
  },
  {
    id: 4,
    title: 'Noche de cabras',
    teaser: 'La coña, pero en el mundo real.',
    body: 'Un recorrido absurdo por la ciudad con reglas que solo entendemos nosotros. Si alguien pregunta qué hacemos, peor.',
    category: 'absurdo',
  },
  {
    id: 5,
    title: 'El río que no es el de siempre',
    teaser: 'Agua, piedra, silencio a ratos.',
    body: 'Salir de la ciudad sin convertir el día en una expedición. Un tramo de agua. Piedras. El tipo de cansancio bueno.',
    category: 'naturaleza',
  },
  {
    id: 6,
    title: 'Mercado + lo que salga',
    teaser: 'Comprar sin lista. Cocinar sin plan B.',
    body: 'Entramos, miramos, elegimos lo que pida el día. Luego cocina. Si sale regular, también cuenta.',
    category: 'comida',
  },
  {
    id: 7,
    title: 'El tren de las 8:12',
    teaser: 'Un pueblo al azar. Un día entero.',
    body: 'Coger un tren concreto. Bajarnos donde toque. Comer donde coman ellos. Volver cuando se acabe la luz.',
    category: 'excursion',
  },
  {
    id: 8,
    title: 'La mesa pequeña',
    teaser: 'Una cena. Pocas luces. Sin discurso.',
    body: 'No es una declaración. Es una mesa, dos platos y el tiempo que haga falta. El resto, si sale, sale.',
    category: 'romantico',
  },
  {
    id: 9,
    title: 'Atardecer no turístico',
    teaser: 'Un sitio alto que no sale en Instagram.',
    body: 'Subir, esperar, bajar. Sin itinerario. Si hace frío, mejor.',
    category: 'naturaleza',
  },
  {
    id: 10,
    title: 'Misión queso (revancha)',
    teaser: 'Esta vez sí llega.',
    body: 'La tabla que no llegó, pero hecha de verdad. Con los quesos que merecen el nombre. Y sin avisar del postre.',
    category: 'sorpresa',
  },
  {
    id: 11,
    title: 'Cazar un concierto imposible',
    teaser: 'Entrar tarde. Salir cuando toque.',
    body: 'No es ir a ver a alguien famoso. Es tropezar con música que no habíamos buscado y quedarnos de más.',
    category: 'absurdo',
  },
  {
    id: 12,
    title: 'El plan que no te voy a decir',
    teaser: 'De verdad. Ni una pista.',
    body: 'Solo una hora, una prenda concreta y la instrucción de no preguntar. El resto es parte del plan.',
    category: 'sorpresa',
  },
  {
    id: 13,
    title: 'Barranco de andar',
    teaser: 'Sin canoa. Con más silencio.',
    body: 'Un sendero estrecho, sombra, y la conversación que solo aparece en el kilómetro que no se mide.',
    category: 'aventura',
  },
  {
    id: 14,
    title: 'Cocinar para nadie más',
    teaser: 'Una receta larga. Sin prisa.',
    body: 'Elegimos una cosa que tarde. Ponemos música. El resultado importa menos que el rato.',
    category: 'comida',
  },
  {
    id: 15,
    title: 'Pueblo con nombre raro',
    teaser: 'Elegido por cómo suena.',
    body: 'El criterio es el nombre. El resto se improvisa: bar, iglesia, banco al sol, lo que haya.',
    category: 'excursion',
  },
  {
    id: 16,
    title: 'Nada, a propósito',
    teaser: 'Cero itinerario. Cero fotos obligatorias.',
    body: 'Un día cuyo único plan es no tenerlo. Si nos aburrimos, también es información.',
    category: 'secreto',
  },
];

const leftoverCategories: PlanCategory[] = [
  'aventura',
  'comida',
  'naturaleza',
  'absurdo',
  'excursion',
  'sorpresa',
  'romantico',
  'secreto',
];

export const plans: Plan[] = Array.from({ length: TOTAL_PLANS }, (_, i) => {
  const authoredPlan = authored.find((p) => p.id === i + 1);
  if (authoredPlan) return authoredPlan;
  return {
    id: i + 1,
    title: 'Todavía no tiene nombre',
    teaser: 'Existe. Todavía no te lo cuento.',
    body: 'Hay planes que no se escriben hasta que les llega su semana. Este es uno de esos.',
    category: leftoverCategories[i % leftoverCategories.length],
  };
});

export const weeks: WeekOffer[] = Array.from({ length: TOTAL_WEEKS }, (_, i) => {
  const a = i * 2 + 1;
  const b = i * 2 + 2;
  const planA = plans[a - 1];
  const planB = plans[b - 1];
  const labels: Record<PlanCategory, { label: string; emoji: string }> = {
    aventura: { label: 'Aventura', emoji: '🏕️' },
    secreto: { label: 'Plan secreto', emoji: '🍷' },
    comida: { label: 'Comida', emoji: '🍽️' },
    naturaleza: { label: 'Naturaleza', emoji: '🌿' },
    absurdo: { label: 'Algo absurdo', emoji: '🐐' },
    excursion: { label: 'Excursión', emoji: '🚂' },
    romantico: { label: 'Sin prisa', emoji: '🕯️' },
    sorpresa: { label: 'Sorpresa', emoji: '🎁' },
  };

  if (i === 0) {
    return {
      week: 1,
      prompt: '¿Qué te apetece?',
      options: [
        { label: 'Aventura', emoji: '🏕️', planId: 1 },
        { label: 'Plan secreto', emoji: '🍷', planId: 2 },
      ],
    };
  }

  return {
    week: i + 1,
    prompt: '¿Qué te apetece?',
    options: [
      { ...labels[planA.category], planId: planA.id },
      { ...labels[planB.category], planId: planB.id },
    ],
  };
});

export function planById(id: number) {
  return plans[id - 1];
}

export function currentWeek(now = new Date()) {
  const delta = now.getTime() - UNLOCK_START.getTime();
  if (delta < 0) return 1;
  return Math.min(TOTAL_WEEKS, Math.floor(delta / (7 * 24 * 60 * 60 * 1000)) + 1);
}

export function isWeekOpen(week: number, now = new Date()) {
  return week <= currentWeek(now);
}
