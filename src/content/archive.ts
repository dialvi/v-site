export type ArchivePiece = {
  id: number;
  title: string;
  body: string;
  image?: string;
  audio?: string;
};

export const archiveIntro = '3 cosas que probablemente no sabes que recuerdo';

export const archivePieces: ArchivePiece[] = [
  {
    id: 1,
    title: 'Una frase que dijo aquel día',
    body: 'No la voy a escribir aquí del todo todavía. Cuando llegue el momento, irá la frase exacta — la que dijiste como si no importara y a mí se me quedó.',
  },
  {
    id: 2,
    title: 'Un detalle absurdo',
    body: 'Algo pequeño, casi ridículo, que hiciste sin darte cuenta. De esas cosas que no se cuentan en una biografía y que, aun así, son las que hacen que alguien sea alguien.',
  },
  {
    id: 3,
    title: 'Algo que vi y nunca te dije',
    body: 'Un gesto. Un segundo. Lo guardé porque decirlo en voz alta lo habría vuelto otra cosa. Aquí está, por fin, en su sitio.',
  },
];
