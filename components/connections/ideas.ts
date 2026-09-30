export type Idea = {
  id: string;
  title: string;
  description: string;
  connections: string[];
};

export const ideas: Idea[] = [
  {
    id: 'equality',
    title: 'Equality',
    description:
      'The idea that every person should have equal dignity, rights and opportunity.',
    connections: ['education', 'rights', 'democracy'],
  },
  {
    id: 'education',
    title: 'Education',
    description:
      'Education as a path toward knowledge, opportunity and social change.',
    connections: ['equality', 'rights', 'representation'],
  },
  {
    id: 'rights',
    title: 'Rights',
    description:
      'The importance of protecting people through rights and constitutional safeguards.',
    connections: ['equality', 'democracy', 'law'],
  },
  {
    id: 'democracy',
    title: 'Democracy',
    description:
      'A system built around participation, representation and equal citizenship.',
    connections: ['equality', 'rights', 'law'],
  },
  {
    id: 'law',
    title: 'Law',
    description:
      'The role of law and constitutional principles in shaping a just society.',
    connections: ['rights', 'democracy', 'representation'],
  },
  {
    id: 'representation',
    title: 'Representation',
    description:
      'The importance of people having a meaningful voice in public and political life.',
    connections: ['education', 'democracy', 'law'],
  },
];
