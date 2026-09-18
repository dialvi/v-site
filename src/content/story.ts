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
  date?: string;
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
    date: '17/03/2026',
    emoji: '👀',
    title: 'Instagram',
    lead: 'Quién me iba a decir en marzo que este mensaje iba a llevarme a hacer esta web a los 6 meses…',
    quote: 'Unos días bailando, otros trabajando en Google y ahora estudiando, que haces exactamenteee?',
    details: [
      {
        kicker: '01',
        title: 'La intriga',
        body: 'Llevaba tiempo intrigado, la verdad… y el 17 de marzo decidí escribirte.',
      },
      {
        kicker: '02',
        title: 'Planazo',
        body: 'La conversación fluyó un poquito y en menos de 24h ya teníamos plan de montañaaaa'
      },
      {
        kicker: '03',
        title: 'El sitio secreto',
        body: 'Te hablé sobre un lugar donde en primavera se pone precioso con las flores, uno de mis lugares secretos, y me dijiste: «aaaay 😩 Bueno, si me llevas, quédate con el secreto». Sigo guardando el secreto jajaja! Aún tenemos pendiente ese lugar',
      },
      {
        kicker: '04',
        title: 'Pequeña desconexión',
        body: 'Se nos complicó un poco la vida pero un día reactivaste el plan preguntando que si seguía en pie!',
      },
      {
        kicker: '05',
        title: 'El podcast',
        body: 'Te dije que obviamente seguía en pie y que cuando te viniera bien. A los 10 días sin contestarme 😂​ se me ocurrió algo: te mandé el primer podcast pidiendote el número de teléfono para organizar mejooor.',
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
    date: '23/05/2026',
    lead: 'Muchas coincidencias en poco tiempo.',
    note: 'El 22 de mayo te envié el famoso podcast 1:44 organizando el hike… me respondiste con un mensaje de voz de la misma duración. Ayayay.',
    details: [
      {
        kicker: '01',
        title: 'Debajo de tu casa',
        body: 'Sin saber dónde vivías te envié el restaurante que estaba debajo de tu casa para comer antes de la montaña. Allí nos vimos y comimos riquísimo.',
      },
      {
        kicker: '02',
        title: 'El machete',
        body: 'No sé por qué, pero a la hora de haberte visto por primera vez ya te había confesado que llevaba un machete en el coche. Me hizo mucha gracia tu reacción y al poco de eso se lo dijiste a tu madre (la pobrecita se asustaría, jajaja).',
        placeId: 'madre-machete',
      },
      {
        kicker: '03',
        title: 'La Barranca',
        body: 'Comenzamos el ascenso a la Bola del Mundo desde la Barranca. La verdad es que ya me estabas cayendo super bien 🤫​',
        placeId: 'jeep'
      },
      {
        kicker: '04',
        title: 'Voz de locutor',
        body: 'Poco después de casi caerte al río y yo casi saltar detrás (impresionante tú equilibrio pero casi me da un infarto), me dijiste que tenía voz de locutor de radio. Y yo, contentísimo 😎​​.',
        placeId: 'casi-al-rio',
      },
      {
        kicker: '05',
        title: 'Mini picnic',
        body: 'Mini picnic a la orilla del río. Deliciosa la comida de Mercadona con el manguito deshidratado, y yo luchando contra las hormigas. Se estaba super fresquito y super bien ahí a la sombrita, pero decidimos seguir subiendo.',
        placeId: 'picnic-manguitos',
      },
      {
        kicker: '06',
        title: 'La primera piedra',
        body: 'Pasamos como 15 minutos lanzando piedras al río porque tú desataste la obsesión masculina de lanzar piedras porque sí. Valeria, tú tiraste la primera piedra.',
        placeId: 'piedras-rio',
      },
      {
        kicker: '07',
        title: 'Las cabras',
        body: 'A medio camino empiezan a aparecer las cabras, pero no nos crees. A la tercera fue la vencida y lograste ver una 🐐​ simpatiquísima',
      },
      {
        kicker: '08',
        title: 'El arbolito',
        body: 'Nos sentamos en aquel arbolito a la sombra, con unas vistas increíbles. AQUÍ creo que empezaste a odiarme, porque te empecé a engañar diciéndote que no quedaba nada, que ya casi estábamos (no llevabamos ni un cuarto de la ruta, perdooon 🙏​​)',
      },
      {
        kicker: '09',
        title: 'El Cachibache',
        body: 'Primer hito: llegar al Cachibache. Nunca sabremos qué es aquella estructura. Aquí me diste la idea de escribir un libro de La Conclusión. Mi hermano te robó una pegatina; la conseguiré de nuevo, prometido 🫡​. Te recuerdo intentando jugar al baloncesto con piedras, el cachibache era la canasta, casi me das en la cabeza 😂​ ',
        placeId: 'cachibache',
      },
      {
        kicker: '10',
        title: 'Casi nada',
        body: 'Decides seguir subiendo el último tramo, que no quedaba caaaasi nada (ahora era más o menos real 🙂‍↔️​), hasta las antenas de la Bola del Mundo.',
        placeId: 'nieve',
      },
      {
        kicker: '11',
        title: 'La bolsa de chips',
        body: 'Allí arriba, sentados viendo el atardecer me enseñaste una de las habilidades más importantes de mi vida. Gracias a ti ahora sé doblar la bolsa de chips / patatas fritas para sacarlas más fácilmente.',
      },
      {
        kicker: '12',
        title: 'El descenso',
        body: 'Comenzamos el descenso y yo preocupado, buscando a ver si nos recogía un Uber para que no me odiases tantísimo. La bajada empieza a oscurecer y salen las estrellas. Recuerdo detalles que me llamaron mucho la atención de la conversación ​​😊​​. Empezamos a plantearnos la existencia de alienígenas.',
      },
      {
        kicker: '13',
        title: 'Los destellos',
        body: 'Ya al lado del coche empezamos a pensar teorías sobre qué eran aquellos destellos de luz que veíamos. ¿Extraterrestres? ¿Flashes? ¿Linternas? ¿Alguien vacilándonos? ​👽​ ',
      },
      {
        kicker: '14',
        title: 'ya de regreso...',
        body: 'Montamos en el coche y de repente suena una mini explosión y empieza a oler a quemado. Lo que faltaba: que se estropeara el coche para odiarme ya de por vida, jajaja. Pero no. Fue el artefacto para cargar móviles.',
      },
      {
        kicker: '15',
        title: 'Villaviciosa',
        body: 'De vuelta a tu casita, recuerdo algo que dijiste super curioso (ya te lo diré ​🤐​). Te dejamos cenando con tus amigos. Me habría encantado cenar allí esos torreznos que tenían taaan buena pinta.',
      },
      {
        kicker: '16',
        title: 'Gracias',
        body: 'Fue un día super divertido. Me quedé impresionado con tu resistencia y conversación. Mil gracias por atreverte a venir. Por ahí tenemos los videitos para recordarlo ​☺️​',
      },
    ],
  },
  {
    id: 'pantano',
    index: '03',
    emoji: '🏖️​',
    title: 'Pantano VIP',
    date: '31/05/2026',
    lead: 'Playita priv sin salir de Madrid, picnic a orillas de San Juan, larga y peligrosísima travesia en yate, y chiringuito con vistazas',
    details: [
      {
        kicker: '01',
        title: 'Preparación...​',
        body: 'El día del Hike comentaste que querías ir al pantano y yo empecé a maquinar el plan desde ese mismo momento 🤫 Tragicómicamente dos días antes de quedar tuve un fatidico accidente en bici e iba manco pero no nos impidió disfrutarlooo',
      },
      {
        kicker: '02',
        title: 'La Playa VIP de Madrid',
        body: 'Conseguimos acceso a una urbanización privada gracias a una amiga y estuvimos suuuper tranquilos... playita para nosotros 🌴 ',
      },
      {
        kicker: '03',
        title: 'Comidita rústica',
        body: 'Una vez más mercadona nos salvó con manguito deshidratado, chocolate (un poco derretido pero rico igual 😂​) y de todo un poco. Pd: gracias por ayudarme a abrir la bolsa de pistachos y la de mango, sin ti no habríamos podido comer 😋​ ',
      },
      {
        kicker: '04',
        title: 'La otra orilla',
        body: 'Mientras comiamos, yo se que todos hacíais lo mismo que yo: mirar a la otra orilla. Había que conquistarla 🗺️​🏴‍☠️​ primero tratamos de llegar flotando en un tronco (20 o 25 metros no llegamos a más pero la intención es lo ue cuenta) y luego tratamos de evolucionar la embarcaci´n',
      },
      {
        kicker: '05',
        title: 'Barquito',
        body: 'Conseguimos más troncos y el ingeniero trato de diseñar algo que flotase. Todos a una colaborando y recuerdo que me ayudaste a atar las sogas/cuerdas que yo no podía. Y lo más importante la banderá te quedó fantásticamente preciosa',
      },
      {
        kicker: '06',
        title: 'Detalles graciosos',
        body: 'Necesitabamos mas material y enviamos a mi hermano al jeep a por sogas, en aquella orilla Maca me hizo esa pregunta incomoda que casi me atraganto 😂​🥲​',
      },
      {
        kicker: '07',
        title: 'La Travesia',
        body: 'El barco tendía a virar a estribor y apenas flotaba ​⛵ peeero navegamos valientemente nada mas y nada menos que unos 50 metros, la navegacion mas corta de mi vida pero la más divertida sin duda algunaaa ​🌊',
      },
      {
        kicker: '08',
        title: 'Camino del chiringuito',
        body: 'Decidimos quedarnos al atardecer a comer algo en el chiringuito, por el camino nos entretuvimos con las serpientes de agua y una vez más lanzando piedras al agua.',
      },
      {
        kicker: '09',
        title: 'Chiringuito 01',
        body: 'Nada mas entrar vi algo que se te había antojado el día del Hike y no lo dudé, un par de Granizados. Salimos a la terraza, había un atardecer precioso y yo estudié el angulo optimo y me senté en esa silla de manera totalmente premeditada pero el porque es un secreto... ',
      },
      {
        kicker: '10',
        title: 'Chiringuito 02',
        body: 'Leimos la carta y DECIDIDO! Era obvio, los torreznos! Pedimos además unos tomatitos con atun, calamares... todo riquísimo...  Lamentablemente mi accidentada mano me impedía cortar los amsiados torreznos yyyyy eeeeh la persona que estaba más lejos de la mesa me ayudó y me los cortó y esto aunque pueda parecer algo sencillo sin importancia para mi fue un detalle que me encantó 🫠​',
      },
      {
        kicker: '11',
        title: 'En busca del atardecer',
        body: 'Fuimos rápidamente a Jeep para buscar un alto donde ver el atardecer y el amanecer lunar (aquel día hubo Luna llena 🌕​). Entramos por una pista de tierra y nos subimos a unas rocas con el coche y nosotros encima del techo buscando la Luna',
      },
    ],
  },
  {
    id: 'tour-madrid-norte-v1',
    lat: 40.5203,
    lng: -3.79505,
    index: '04',
    emoji: '🐐​​',
    title: 'Madrid Norte V1',
    lead: 'Plan improvisado con Jarritos, Cabras y mucho más',
    date: '06/06/2026',
    details: [
      {
        kicker: '01',
        title: 'Empezamoos fuerte',
        body: 'Te recogí en Villa, cuando bajaste del piso me ocurrió algo que me desconcentró un poco 😂 El qué es un secreto. La verdad es que no tenia nada planeado al 100% y te propusé ir a Aranjuez si no lo conocias peeero ya habías estado asi queeee mi plan estrella se iba a hacer realidad. ',
      },
      {
        kicker: '02',
        title: 'Primer tramo',
        body: 'En el coche, empiezo a notar algo que me pone nervioso 🥵​, yo queria mantener una conversación extemadamente agradable pero en el momento de la verdad ninguno de los protocolos anti-tos que llevaba días planeando funcionó y me quedé sin voz 🤐 Fue un placer escucharte, gracias por la paciencia este día jaja  ​🙂‍↕️​',
      },
      {
        kicker: '03',
        title: 'Centro comercial',
        body: 'Si un centro comercial, poco interesante ​😶‍🌫️ pero teniamos que hacer tiempo para que cayerá el sol un poco, hacia calor y en un interior ibamos a estar cómodos. Decidimos tomar Ice Tea y aprendí que el Macha sabe a pasto, tenias razón! La verdad fue bastante bien!',
      },
      {
        kicker: '04',
        title: 'Paseito por El Pardo',
        body: 'Llegamos al Spot, uno de mis favoritos cerca de casa. Al salir del coche te preguté si tenías sed y saqué unos Jarritos sorpresa. Fuimos caminando hasta donde estaban las cabras sin abrir los Jarritos. Se nos calentaron un poco pero estaban deliciosos igual, recuerdas de que sabor eran? Yo si jaja Secreto!',
      },
      {
        kicker: '05',
        title: 'Cabras',
        body: 'Las cabras simpatiquisimas pero preferían a los niños que a nosotros, ya les llevaremos el kilito de zanahorias 🥕​ Como no nos querían fuimos a buscar un sitio para tomar los jarritooos',
      },
      {
        kicker: '06',
        title: 'El Tronco',
        body: 'El mejor lugar para tomar los jarritooos, un arbol caído, las torres a un lado, al otro el atardecer. Tengo un recuerdo bonito de ese momento, fue el primer dia del verano que ví tantisimas golondrinas surcando el cielo y eso todos los años me hace mucha ilusión 🌞​',
      },
      {
        kicker: '07',
        title: 'Rita Rita Rita Rita',
        body: 'El universo tiene algo contra mi, no podía permitir que todo fuese tan bien y decidió poner un señor borracho en nuestro camino preguntandome que si yo era Rita la Cantaora o al menos eso entendí yo 😂​ No pasa nada, pequeño bug, quedó olvidado hasta que al fin de semana siguiente una señora me preguntó lo mismo 🤗​',
      },
      {
        kicker: '08',
        title: 'Madrid desde el cielo',
        body: 'Decidimos ir a mi urbanización y subir al ático a ver las vistas de madrid al atardecer y saliió uno de los videitos más espectaculares de la historia 😎​ Empezo a entrarnos hambre asi que reservamos en un restaurante cerquita!',
      },
      {
        kicker: '09',
        title: 'Cenita',
        body: 'Fuimos al restaurante asturiano y probaste los oricios deliciosos de aperitivo y luego unos platos ricos... Gracias por esperarme que entre comer con la mano izquierda y la tos me era un tanto dificil cenar peeero disfrute mucho la conversación 🙃​',
      },
    ],
  },
  {
    id: 'mexicano',
    index: '05',
    emoji: '🇲🇽',
    title: '',
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
