export type LessonId =
  | 'mealy-vs-moore'
  | 'state-splitting'
  | 'string-simulation'
  | 'table-to-diagram'
  | 'conversion-explanation';

export interface LessonMeta {
  id: LessonId;
  number: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  iconName: string;
}

export const LESSONS: LessonMeta[] = [
  {
    id: 'mealy-vs-moore',
    number: 1,
    title: 'Mealy vs Moore Output Timing',
    shortTitle: '1. Mealy vs Moore',
    subtitle: 'Each circle is a place the machine can be, called a state. An input tells you which arrow to follow. In Mealy, read the answer on that arrow. In Moore, read it inside the circle you reach.',
    iconName: 'Workflow',
  },
  {
    id: 'state-splitting',
    number: 2,
    title: 'Visual State Splitting',
    shortTitle: '2. State Splitting',
    subtitle: 'Two arrows lead to circle A. One gives the answer x and the other gives y. A Moore circle can show only one answer, so we draw two copies of A.',
    iconName: 'Split',
  },
  {
    id: 'string-simulation',
    number: 3,
    title: 'Input String Simulation',
    shortTitle: '3. String Simulation',
    subtitle: 'Pick a string such as 1100. Press Next to read one digit and see the answer for that step.',
    iconName: 'PlayCircle',
  },
  {
    id: 'table-to-diagram',
    number: 4,
    title: 'Transition Table ↔ Diagram Sync',
    shortTitle: '4. Table ↔ Diagram',
    subtitle: 'Click a box in the table to find the matching arrow. Click an arrow to find its rule in the table.',
    iconName: 'Grid',
  },
  {
    id: 'conversion-explanation',
    number: 5,
    title: 'Mealy → Moore Algorithmic Walkthrough',
    shortTitle: '5. Conversion Trace',
    subtitle: 'Follow the steps to turn a Mealy machine into a Moore machine that gives the same answers for each input.',
    iconName: 'GitCommit',
  },
];
