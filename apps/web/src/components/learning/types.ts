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
    subtitle: 'Observe how Mealy emits on transitions while Moore emits upon entering states.',
    iconName: 'Workflow',
  },
  {
    id: 'state-splitting',
    number: 2,
    title: 'Visual State Splitting',
    shortTitle: '2. State Splitting',
    subtitle: 'See how a Mealy state reached with multiple outputs splits into distinct Moore states.',
    iconName: 'Split',
  },
  {
    id: 'string-simulation',
    number: 3,
    title: 'Input String Simulation',
    shortTitle: '3. String Simulation',
    subtitle: 'Watch execution traces, active state pulses, and output tape generation in real time.',
    iconName: 'PlayCircle',
  },
  {
    id: 'table-to-diagram',
    number: 4,
    title: 'Transition Table ↔ Diagram Sync',
    shortTitle: '4. Table ↔ Diagram',
    subtitle: 'Interactive dual-view: click any matrix cell to highlight its graph edge, and vice versa.',
    iconName: 'Grid',
  },
  {
    id: 'conversion-explanation',
    number: 5,
    title: 'Mealy → Moore Algorithmic Walkthrough',
    shortTitle: '5. Conversion Trace',
    subtitle: 'Step through the exact 5-stage transformation using live mathematical trace data.',
    iconName: 'GitCommit',
  },
];
