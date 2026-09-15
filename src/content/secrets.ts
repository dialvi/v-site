export type Secret = {
  id: number;
  title: string;
  body: string;
};

export const secretsIntro = 'Cosas que no te he dicho. No porque no quiera: porque en voz alta cambian de forma.';

export const secrets: Secret[] = [
  {
    id: 1,
    title: 'Un plan que todavía no está en la lista',
    body: 'Hay uno que no he numerado. Si lo pongo ahora, deja de ser mío. Cuando toque, lo vas a reconocer.',
  },
  {
    id: 2,
    title: 'Algo que pensé el primer día y no solté',
    body: 'No fue una frase bonita. Fue una certeza pequeña, incómoda, de las que no se dicen en un segundo mensaje.',
  },
  {
    id: 3,
    title: 'Por qué me acuerdo de detalles tontos',
    body: 'No los colecciono. Se me quedan solos. Si algún día te parece demasiado, ya sabes de dónde viene.',
  },
  {
    id: 4,
    title: 'Lo que no es este regalo',
    body: 'No es una trampa ni un discurso. Es un sitio donde ir metiendo lo que vamos viviendo. El resto, si sale, sale.',
  },
];
