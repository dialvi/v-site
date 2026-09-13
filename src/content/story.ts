export type StoryBeat = {
  id: string;
  index: string;
  emoji: string;
  title: string;
  lead: string;
  body: string;
  note?: string;
  audio?: string;
  image?: string;
};

export const storyBeats: StoryBeat[] = [
  {
    id: 'instagram',
    index: '01',
    emoji: '👀',
    title: 'Instagram',
    lead: 'El primer mensaje que probablemente ninguno de los dos imaginaba que acabaría en todo esto.',
    body: 'Un hilo mínimo. Una respuesta que no tenía por qué existir. Y de pronto, sin aviso, algo que ya no se podía dejar en visto del todo.',
    note: 'Sustituye este texto por la frase exacta del primer mensaje cuando la tengas a mano.',
  },
  {
    id: 'montana',
    index: '02',
    emoji: '⛰️',
    title: 'El primer plan',
    lead: 'El día de montaña. Los torreznos. El tipo de plan que no se anuncia: se hace.',
    body: 'Subida, hambre, esa conversación que solo sale cuando se camina. Y los torreznos, que de alguna forma se quedaron como prueba de que el día había sido real.',
    image: '/media/photos/montana.jpg',
  },
  {
    id: 'audio',
    index: '03',
    emoji: '🎙️',
    title: 'Episodio 1:44',
    lead: 'El famoso audio.',
    body: 'Un minuto cuarenta y cuatro. Suficiente para que el tono de voz diga más que cualquier párrafo bien escrito.',
    audio: '/media/audio/1-44.m4a',
    note: 'Cuando pases el audio, este reproductor lo pondrá aquí.',
  },
  {
    id: 'queso',
    index: '04',
    emoji: '🧀',
    title: 'El queso que nunca llegó',
    lead: 'La historia de la tabla de quesos.',
    body: 'La idea era perfecta. La ejecución, menos. Y aun así se quedó: no por el queso, sino por lo fácil que fue reírse de que no estuviera.',
  },
  {
    id: 'cabras',
    index: '05',
    emoji: '🐐',
    title: 'Cabras por Madrid',
    lead: 'Vuestra coña.',
    body: 'Una frase que no debería funcionar fuera de los dos. Y que, por eso mismo, funciona demasiado bien.',
  },
  {
    id: 'mexicana',
    index: '06',
    emoji: '🇲🇽',
    title: 'La fiesta mexicana',
    lead: 'Lo que se suponía que iba a ser. Y lo que fue.',
    body: 'Había un plan. Luego llegó la noche y el plan se desvió — como casi siempre que merece la pena. El plot twist no fue el disfraz. Fue lo que pasó cuando nadie estaba siguiendo el guion.',
    note: 'Cuando quieras, cambia esto por lo que pasó de verdad. Ahí está el oro.',
  },
];
