export type Note = {
  id: string;
  title: string;
  emoji: string;
  lines?: string[];
  talk?: boolean;
};

export const notes: Note[] = [
  {
    id: 'delicados',
    emoji: '💟',
    title: 'Días delicados',
    lines: [
      'Omega 3: empezar unos días antes y seguir durante estos días 🫶',
      'Pd: te llevaré más, que creo que te van a faltar.',
      'Mucha agua 💧',
      'Dormir 10h y descansar como nuncaaa',
      'Comidita: algo rico y calentito',
      'Calorcitooo',
      'Obligatorio: déjate cuidar muuucho ☺️',
      '(y no caminar 20 min hasta el Bernabéu)',
    ],
  },
  {
    id: 'animo',
    emoji: '🌞',
    title: 'Un poquito de sol',
    talk: true,
    lines: [
      'Caramelito de azafrán: por la mañana ☀️',
      'Mejor con el desayuno o después, no hace falta tomarlo en ayunas.',
      'Va bien para los días de antes de los días delicados ☺️',
      'Para esos días en los que hace falta un pequeño subidón ✨',
      'Y si no funciona... habrá que recurrir al chocolate 🍫',
    ],
  },
  {
    id: 'dormir',
    emoji: '🌙',
    title: 'Dormir 10 horitas',
    lines: [
      'Melatonina 1,85 mg + 2 tilas',
      '15 min antes de ir a la cama',
      'Móvil y la luz de tu habitación, off',
    ],
  },
  {
    id: 'estres',
    emoji: '🌿',
    title: 'Modo zen',
    lines: [
      'Valeriana 🌿 2 pastillas al día, una por la mañana y otra a la hora de comer',
      'Duchita caliente por la mañana y por la noche 🚿',
      'Bajar revoluciones. Hoy no hay que arreglar el mundo.',
      'Si algo te está estresando, cuéntamelo y le sacamos el macheteee 😈',
      'Y si quieres... pregúntame por la teoría de la separación cuerpo-mente 🧠',
    ],
  },
  {
    id: 'fiesta',
    emoji: '🪩',
    title: 'Demasiada fiestaaa',
    lines: [
      'Agüita. Mucha agüita. 💧',
      'El alcohol deshidrata. El agua y los electrolitos compensan en parte, y ayudan a reducir el malestar al día siguiente.',
      'Un sobre de electrolitos disuelto en agua antes de dormir.',
      'Y ahora sí: a dormir 10 horitas.',
      '(no tomar valeriana ni melatonina si tomas alcohol)',
    ],
  },
];
