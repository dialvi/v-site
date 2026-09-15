export type StoryDetail = {
  kicker?: string;
  title: string;
  body?: string;
  placeId?: string;
};

export type StoryBeat = {
  id: string;
  index: string;
  emoji: string;
  title: string;
  lead: string;
  quote?: string;
  note?: string;
  audio?: string;
  image?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  details: StoryDetail[];
};

export const storyBeats: StoryBeat[] = [
  {
    id: 'instagram',
    index: '01',
    emoji: '👀',
    title: 'Instagram',
    lead: 'Quién me iba a decir aquel 17 de marzo de 2026 que este mensaje iba a llevarme a diseñar esta web a los 6 meses…',
    quote: 'Unos días bailando, otros trabajando en Google y ahora estudiando, que haces exactamenteee?',
    details: [
      {
        kicker: '01',
        title: 'La intriga',
        body: 'Llevaba tiempo intrigado, la verdad… y el 17 de marzo decidí escribirte. No me respondiste qué hacías y seguía con la intriga.',
      },
      {
        kicker: '02',
        title: 'Tu mezcla',
        body: 'Respondiste que la vida en Madrid era una mezcla interesante. Pero mi mezcla no era tan interesante como la tuya.',
      },
      {
        kicker: '03',
        title: 'Qué hacía yo',
        body: 'Me preguntaste que qué hacía yo. La conversación fluyó un poquito y en menos de 24h ya teníamos plan de montaña.',
      },
      {
        kicker: '04',
        title: 'El sitio secreto',
        body: 'Te hablé sobre un lugar donde en primavera se pone precioso con las flores, uno de mis lugares secretos, pero me dijiste: «aaaay 😩 Bueno, si me llevas, quédate con el secreto». Y yo, obviamente, encantado.',
      },
      {
        kicker: '05',
        title: '21 de marzo',
        body: 'El día 21 de marzo me preguntaste dónde vivía yo y tardé unos días en responderte (sorry). Estaba pasando una mala racha… pero luego fue la primera vez que trataste de huir de mí sin éxito, y tardamos 17 días en volver a hablar.',
      },
      {
        kicker: '06',
        title: '24 de abril',
        body: 'El 24 de abril traté de reactivar plan Hike pero te olvidaste de mí. Yo ya lo daba por perdido hasta que un día se alinearon los astros y 10 días más tarde reapareciste preguntando por el plan, jajaja.',
      },
      {
        kicker: '07',
        title: 'El podcast',
        body: 'Te dije que obviamente seguía en pie y que cuando te viniera bien. A los 10 días sin contestarme se me ocurrió algo: te mandé el primer podcast. Y el día 14 de mayo ya tenía tu número de teléfono para organizar mejor.',
      },
      {
        kicker: '08',
        title: '67 días',
        body: 'El sábado 23 de mayo, tras 67 días de negociación dura, logramos quedar para el HIKE por la Bola del Mundo.',
      },
    ],
  },
  {
    id: 'montana',
    index: '02',
    emoji: '⛰️',
    title: 'El plan del Hike',
    lead: 'Muchas coincidencias en poco tiempo.',
    note: 'El 22 de mayo te envié el famoso podcast 1:44 organizando el hike… me respondiste con un mensaje de voz de la misma duración. Ayayay.',
    image: '/media/photos/montana.jpg',
    placeId: 'jeep',
    details: [
      {
        kicker: '01',
        title: 'Debajo de tu casa',
        body: 'Sin saber dónde vivías te envié el restaurante que estaba debajo de tu casa para comer antes de la montaña. Allí nos vimos y comimos riquísimo.',
      },
      {
        kicker: '03',
        title: 'El machete',
        body: 'No sé por qué, pero a la hora de haberte visto por primera vez ya te había confesado que llevaba un machete en el coche. Me hizo mucha gracia tu reacción y al poco de eso se lo dijiste a tu madre (la pobrecita se asustaría, jajaja).',
        placeId: 'madre-machete',
      },
      {
        kicker: '04',
        title: 'La Barranca',
        body: 'Comenzamos el ascenso a la Bola del Mundo desde la Barranca. La verdad es que ya me estabas cayendo super bien.',
      },
      {
        kicker: '05',
        title: 'Voz de locutor',
        body: 'Poco después de casi caerte al río (impresionante equilibrio de bailarina) y yo casi saltar detrás, me dijiste que tenía voz de locutor de radio. Y yo, orgullosísimo.',
        placeId: 'casi-al-rio',
      },
      {
        kicker: '06',
        title: 'Mini picnic',
        body: 'Mini picnic a la orilla del río. Deliciosa la comida de Mercadona con el manguito deshidratado, y yo luchando contra las hormigas. Se estaba super fresquito y super bien ahí a la sombrita, pero decidimos seguir subiendo.',
        placeId: 'picnic-manguitos',
      },
      {
        kicker: '07',
        title: 'La primera piedra',
        body: 'Pasamos como 15 minutos lanzando piedras al río porque tú desataste la obsesión masculina de lanzar piedras porque sí. Valeria, tú tiraste la primera piedra.',
        placeId: 'piedras-rio',
      },
      {
        kicker: '08',
        title: 'Las cabras',
        body: 'A medio camino empiezan a aparecer las cabras, pero no nos crees. A la tercera fue la vencida y lograste ver la primera cabra y comenzar la historia de las cabras.',
      },
      {
        kicker: '09',
        title: 'El arbolito',
        body: 'Nos sentamos en aquel arbolito a la sombra, con unas vistas increíbles. AQUÍ creo que empezaste a odiarme, porque te empecé a engañar diciéndote que no quedaba nada, que ya casi estábamos.',
      },
      {
        kicker: '10',
        title: 'El Cachibache',
        body: 'Primer hito: llegar al Cachibache. Nunca sabremos qué es esa estructura. Aquí me diste la idea de escribir un libro de La Conclusión. Mi hermano te robó una pegatina; la conseguiré de nuevo. Te recuerdo intentando jugar al baloncesto con piedras y el cachibache, porque casi me das en la cabeza.',
        placeId: 'cachibache',
      },
      {
        kicker: '11',
        title: 'Casi nada',
        body: 'Me impresionas con tu valentía y decides seguir subiendo el último tramo, que no quedaba caaaasi nada, hasta las antenas de la Bola del Mundo.',
        placeId: 'nieve',
      },
      {
        kicker: '12',
        title: 'La bolsa de chips',
        body: 'Allí sentados viendo el atardecer me enseñaste una de las habilidades más importantes de mi vida. Gracias a ti ahora sé doblar la bolsa de chips / patatas fritas para sacarlas más fácilmente.',
      },
      {
        kicker: '13',
        title: 'El descenso',
        body: 'Comenzamos el descenso y yo preocupado, buscando a ver si nos recogía un Uber para que no me odiases tantísimo. La bajada empieza a oscurecer y salen las estrellas. Recuerdo detalles que me llamaron mucho la atención de la conversación. Empezamos a plantearnos la existencia de alienígenas.',
      },
      {
        kicker: '14',
        title: 'Los destellos',
        body: 'Ya al lado del coche empezamos a lanzar teorías sobre qué eran esos destellos de luz que veíamos. ¿Extraterrestres? ¿Flashes? ¿Linternas? ¿Alguien vacilándonos? Pues sí: al final era una tormenta lejana.',
      },
      {
        kicker: '15',
        title: 'La mini explosión',
        body: 'Montamos en el coche y de repente suena una mini explosión y empieza a oler a quemado. Lo que faltaba: que se estropeara el coche para odiarme ya de por vida, jajaja. Pero no. Fue el artefacto para cargar móviles.',
      },
      {
        kicker: '16',
        title: 'Villaviciosa',
        body: 'Ya de vuelta a tu casita, recuerdo algo que dijiste que me maravilló (ya te lo diré). Te dejamos cenando con tus amigos. Me habría encantado cenar allí en Villaviciosa los torreznos, que tenían buena pinta.',
      },
      {
        kicker: '17',
        title: 'Gracias',
        body: 'Fue un día super divertido. Me quedé encantado con tu resistencia y conversación. Mil gracias por atreverte a venir. Por ahí tenemos los videitos para recordarlo.',
      },
    ],
  },
  {
    id: 'audio',
    index: '03',
    emoji: '🎙️',
    title: 'Episodio 1:44',
    lead: 'El famoso audio.',
    audio: '/media/audio/1-44.m4a',
    details: [
      {
        kicker: '01',
        title: 'Recordar historia',
        body: 'Un minuto cuarenta y cuatro. El tono dice más que cualquier párrafo bien escrito.',
      },
    ],
  },
  {
    id: 'queso',
    index: '04',
    emoji: '🧀',
    title: 'El queso que nunca llegó',
    lead: 'La historia de la tabla de quesos.',
    details: [
      {
        kicker: '01',
        title: 'Recordar historia',
        body: 'La idea era perfecta. La ejecución, menos.',
      },
      {
        kicker: '02',
        title: 'Lo que quedó',
        body: 'No fue el queso. Fue lo fácil que fue reírse de que no estuviera.',
      },
    ],
  },
  {
    id: 'cabras',
    index: '05',
    emoji: '🐐',
    title: 'Cabras por Madrid',
    lead: 'Vuestra coña.',
    lat: 40.5203,
    lng: -3.79505,
    details: [
      {
        kicker: '01',
        title: 'Recordar historia',
        body: 'Una frase que no debería funcionar fuera de los dos. Y que, por eso mismo, funciona demasiado bien.',
      },
    ],
  },
  {
    id: 'mexicana',
    index: '06',
    emoji: '🇲🇽',
    title: 'La fiesta mexicana',
    lead: 'Lo que se suponía que iba a ser. Y lo que fue.',
    details: [
      {
        kicker: '01',
        title: 'Recordar historia',
        body: 'Había un plan. Luego llegó la noche y el plan se desvió.',
      },
      {
        kicker: '02',
        title: 'El plot twist',
        body: 'No fue el disfraz. Fue lo que pasó cuando nadie estaba siguiendo el guion.',
      },
    ],
  },
];
