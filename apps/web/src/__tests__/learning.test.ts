import { describe, it, expect } from 'vitest';
import { LESSONS } from '../components/learning/types.js';
import { LearningShell } from '../components/learning/LearningShell.js';
import { LessonMealyVsMoore } from '../components/learning/LessonMealyVsMoore.js';
import { LessonStateSplitting } from '../components/learning/LessonStateSplitting.js';
import { LessonSimulation } from '../components/learning/LessonSimulation.js';
import { LessonTableDiagramSync } from '../components/learning/LessonTableDiagramSync.js';
import { LessonConversionTrace } from '../components/learning/LessonConversionTrace.js';
import { DiagramSvg } from '../components/learning/DiagramSvg.js';
import { PlaybackBar } from '../components/learning/PlaybackBar.js';
import { TapeDisplay } from '../components/learning/TapeDisplay.js';
import {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MEALY,
  SEQUENCE_101_MEALY,
  convertMealyToMoore,
  simulateMealy,
  simulateMoore,
} from '@automatalab/automata';

describe('Phase 4.5 — Visual Learning Lab Architecture & Mathematical Integrity', () => {
  it('1. Verifies all Visual Learning Lab modules export valid React components', () => {
    expect(typeof LearningShell).toBe('function');
    expect(typeof LessonMealyVsMoore).toBe('function');
    expect(typeof LessonStateSplitting).toBe('function');
    expect(typeof LessonSimulation).toBe('function');
    expect(typeof LessonTableDiagramSync).toBe('function');
    expect(typeof LessonConversionTrace).toBe('function');
    expect(typeof DiagramSvg).toBe('function');
    expect(typeof PlaybackBar).toBe('function');
    expect(typeof TapeDisplay).toBe('function');
  });

  it('2. Verifies LESSONS metadata contains all 5 required interactive lessons', () => {
    expect(LESSONS).toHaveLength(5);
    const ids = LESSONS.map((l) => l.id);
    expect(ids).toEqual([
      'mealy-vs-moore',
      'state-splitting',
      'string-simulation',
      'table-to-diagram',
      'conversion-explanation',
    ]);
    LESSONS.forEach((lesson, idx) => {
      expect(lesson.number).toBe(idx + 1);
      expect(lesson.title).toBeTruthy();
      expect(lesson.subtitle).toBeTruthy();
      expect(lesson.iconName).toBeTruthy();
    });
  });

  it('3. Verifies Lesson 1 & 5 mathematical data: Task 6 Mealy to Moore equivalence and tape alignment', () => {
    const mealy = MANDATORY_TASK_6_MEALY;
    const { machine: moore, steps, stateMapping } = convertMealyToMoore(mealy);

    // States: S, A_x, A_y, B_x, B_y
    expect(moore.states).toHaveLength(5);
    expect(moore.states).toContain('S');
    expect(moore.states).toContain('A_x');
    expect(moore.states).toContain('A_y');
    expect(moore.states).toContain('B_x');
    expect(moore.states).toContain('B_y');

    // Simulation on mandatory benchmark input 1100
    const input = '1100';
    const mealyTrace = simulateMealy(mealy, input);
    const mooreTrace = simulateMoore(moore, input);

    expect(mealyTrace.outputSequence).toEqual(['y', 'x', 'y', 'x']);
    expect(mooreTrace.outputSequence).toEqual(['ε', 'y', 'x', 'y', 'x']);

    // Output tape alignment invariant: Moore stripped of initial epsilon equals Mealy
    expect(mooreTrace.outputSequence.slice(1)).toEqual(mealyTrace.outputSequence);

    // State mapping (State A includes synthetic start state S as A was the initial state)
    expect(stateMapping['A'].sort()).toEqual(['A_x', 'A_y', 'S'].sort());
    expect(stateMapping['B'].sort()).toEqual(['B_x', 'B_y'].sort());
    expect(steps.length).toBeGreaterThanOrEqual(5);
  });

  it('4. Verifies Lesson 2 mathematical principle: State A incoming output conflict {x, y}', () => {
    const mealy = MANDATORY_TASK_6_MEALY;
    const incomingToA = mealy.transitions
      .filter((t) => t.toState === 'A')
      .map((t) => t.outputSymbol);

    // Must have at least 'x' and 'y'
    const uniqueOutputs = Array.from(new Set(incomingToA)).sort();
    expect(uniqueOutputs).toEqual(['x', 'y']);
  });

  it('5. Verifies Lesson 3 input string simulations on parity and sequence models', () => {
    // Parity simulation on 1011 (odd parity -> 1)
    const parityTrace = simulateMealy(EVEN_PARITY_MEALY, '1011');
    expect(parityTrace.steps).toHaveLength(5);
    expect(parityTrace.outputSequence).toEqual(['1', '1', '0', '1']);

    // 101 sequence detector simulation on 10101
    const seqTrace = simulateMealy(SEQUENCE_101_MEALY, '10101');
    expect(seqTrace.steps).toHaveLength(6);
    expect(seqTrace.outputSequence).toEqual(['0', '0', '1', '0', '1']);
  });
});
