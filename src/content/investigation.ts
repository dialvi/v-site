export type Dossier = {
  id: string;
  code: string;
  stamp: string;
  title: string;
  lead: string;
  body: string;
};

export const investigationIntro =
  'Notas, pruebas y cabos sueltos. Nada de esto estaba pensado para un informe. Se quedó porque no supe tirarlo.';

export const dossiers: Dossier[] = [
  {
    id: 'contacto',
    code: 'EXP-01',
    stamp: 'abierto',
    title: 'Primer contacto',
    lead: 'Un mensaje que no tenía por qué existir.',
    body: 'Hilo mínimo. Respuesta innecesaria. A partir de ahí, el resto de este archivo empieza a tener sentido.',
  },
  {
    id: 'terreno',
    code: 'EXP-02',
    stamp: 'abierto',
    title: 'Salida de campo',
    lead: 'Montaña. Torreznos. Conversación a pie.',
    body: 'El terreno confirma lo que el chat no podía: que esto funcionaba mejor en movimiento que en teoría.',
  },
  {
    id: 'audio',
    code: 'EXP-03',
    stamp: 'pieza clave',
    title: 'Registro 1:44',
    lead: 'El audio. La prueba que no es una prueba.',
    body: 'Un minuto cuarenta y cuatro. Clasificado no porque sea secreto: porque el tono no se resume.',
  },
  {
    id: 'queso',
    code: 'EXP-04',
    stamp: 'sin resolver',
    title: 'El queso ausente',
    lead: 'Tabla anunciada. Tabla que no llegó.',
    body: 'La evidencia es la risa que quedó. El queso, de momento, sigue en paradero desconocido.',
  },
  {
    id: 'cabras',
    code: 'EXP-05',
    stamp: 'interno',
    title: 'Operación cabras',
    lead: 'Una coña con jurisdicción propia.',
    body: 'No admite traducción. Cualquier intento de explicarla a un tercero debilita el expediente.',
  },
  {
    id: 'mx',
    code: 'EXP-06',
    stamp: 'plot twist',
    title: 'Noche mexicana',
    lead: 'Había un plan. Luego llegó la noche.',
    body: 'El desvío es la parte importante. Lo que pasó cuando el guion se acabó sigue, en parte, en este cajón.',
  },
];
