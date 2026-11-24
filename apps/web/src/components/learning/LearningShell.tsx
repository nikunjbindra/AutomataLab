import { useState } from 'react';
import { LESSONS, type LessonId } from './types.js';
import { LessonMealyVsMoore } from './LessonMealyVsMoore.js';
import { LessonStateSplitting } from './LessonStateSplitting.js';
import { LessonSimulation } from './LessonSimulation.js';
import { LessonTableDiagramSync } from './LessonTableDiagramSync.js';
import { LessonConversionTrace } from './LessonConversionTrace.js';
const chapters = [LessonMealyVsMoore, LessonStateSplitting, LessonSimulation, LessonTableDiagramSync, LessonConversionTrace];
const questions = ['Where does the output live?', 'Why split a state?', 'What happens on each input?', 'How do you read a transition?', 'How does conversion work?'];

export function LearningShell() {
  const [active, select] = useState<LessonId>(LESSONS[0].id);
  const index = LESSONS.findIndex(lesson => lesson.id === active);
  const lesson = LESSONS[index];
  const Chapter = chapters[index];
  return <div className="notebook-layout">
    <aside className="book-contents"><h2>Automata notebook</h2>
      <p>Lesson contents</p><nav aria-label="Lesson contents">{LESSONS.map((entry, i) =>
        <button key={entry.id} aria-current={entry.id === active ? 'step' : undefined} onClick={() => select(entry.id)}>
          <span>{String(i + 1).padStart(2, '0')}</span>{entry.shortTitle.slice(3)}
        </button>)}</nav></aside>
    <article className="min-w-0"><div className="book-kicker">Lesson {index + 1} of {LESSONS.length}</div>
      <h1>{questions[index]}</h1><p className="book-lead">{lesson.subtitle}</p>
      <Chapter key={active} />
      <footer className="chapter-footer"><button disabled={!index} onClick={() => select(LESSONS[index - 1].id)}>← Previous lesson</button>
        <button disabled={index === LESSONS.length - 1} onClick={() => select(LESSONS[index + 1].id)}>Next lesson →</button></footer>
    </article></div>;
}
