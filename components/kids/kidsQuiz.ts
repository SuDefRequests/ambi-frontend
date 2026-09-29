export type KidsQuizQuestion = {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  source: string;
};

export const kidsQuizQuestions: KidsQuizQuestion[] = [
  {
    id: 1,
    question: 'In which year was Dr. B. R. Ambedkar born?',
    options: ['1881', '1891', '1901', '1911'],
    answer: 1,
    explanation:
      'Dr. Bhimrao Ramji Ambedkar was born on 14 April 1891 in Mhow, in present-day Madhya Pradesh.',
    source: 'Ambedkar Digital Archive · Biographical records',
  },
  {
    id: 2,
    question:
      'Which of these was an important part of Ambedkar’s work?',
    options: [
      'Promoting equality',
      'Building castles',
      'Writing detective stories',
      'Exploring outer space',
    ],
    answer: 0,
    explanation:
      'Equality and social justice were central themes in Ambedkar’s public work and writings.',
    source: 'Ambedkar Digital Archive · Writings & Speeches',
  },
  {
    id: 3,
    question:
      'Which subject did Ambedkar strongly encourage people to pursue?',
    options: [
      'Education',
      'Treasure hunting',
      'Magic',
      'Horse racing',
    ],
    answer: 0,
    explanation:
      'Ambedkar placed great importance on education as a way for people to gain knowledge and improve their lives.',
    source: 'Ambedkar Digital Archive · Writings & Speeches',
  },
  {
    id: 4,
    question:
      'Which major document is closely associated with Ambedkar’s work in independent India?',
    options: [
      'The Constitution of India',
      'A cricket rulebook',
      'A railway timetable',
      'A weather report',
    ],
    answer: 0,
    explanation:
      'Ambedkar served as Chairman of the Drafting Committee of the Constituent Assembly and played a major role in the drafting of the Constitution.',
    source: 'Ambedkar Digital Archive · Constituent Assembly Debates',
  },
  {
    id: 5,
    question:
      'What is one big idea you can explore in Ambedkar’s work?',
    options: [
      'Equality',
      'Time travel',
      'Space travel',
      'Treasure maps',
    ],
    answer: 0,
    explanation:
      'Equality is one of the important ideas that appears throughout Ambedkar’s public life and writings.',
    source: 'Ambedkar Digital Archive · Writings & Speeches',
  },
];