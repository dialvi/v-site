export type Recipe = {
  id: string;
  n: string;
  title: string;
  body?: string;
};

export const recipes: Recipe[] = [
  {
    id: 'dormir',
    n: '01',
    title: 'Dormir 10 horitas',
    body: 'Melatonina 1,85 mg + 2 tilas\n15 min antes de ir a la cama\nMóvil y la luz de tu habitación, off',
  },
  { id: 'estres', n: '02', title: 'Para días estresantes' },
  { id: 'fiesta', n: '03', title: 'Demasiada fiestaaa' },
];
