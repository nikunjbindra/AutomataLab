import { describe, it, expect } from 'vitest';
import { ConversionPage } from '../pages/ConversionPage.js';
import { ConversionToolbar } from '../components/conversion/ConversionToolbar.js';
import { ConversionStepper } from '../components/conversion/ConversionStepper.js';
import { DualSimulationPanel } from '../components/conversion/DualSimulationPanel.js';
import {
  ExampleGalleryModal,
  BENCHMARK_EXAMPLES,
} from '../components/conversion/ExampleGalleryModal.js';
import {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MOORE,
  convertMealyToMoore,
  convertMooreToMealy,
  simulateMealy,
  simulateMoore,
  verifyEquivalenceProductMachine,
} from '@automatalab/automata';

describe('Phase 5 — Conversion Workspace & Benchmark Verification Suite', () => {
  it('1. Verifies all Phase 5 conversion components export valid React components', () => {
    expect(typeof ConversionPage).toBe('function');
    expect(typeof ConversionToolbar).toBe('function');
    expect(typeof ConversionStepper).toBe('function');
    expect(typeof DualSimulationPanel).toBe('function');
    expect(typeof ExampleGalleryModal).toBe('function');
  });

  it('2. Verifies predefined benchmark examples registry completeness', () => {
    expect(BENCHMARK_EXAMPLES.length).toBeGreaterThanOrEqual(5);
    const ids = BENCHMARK_EXAMPLES.map((e) => e.id);
    expect(ids).toContain('task6-mealy');
    expect(ids).toContain('parity-mealy');
    expect(ids).toContain('parity-moore');
    expect(ids).toContain('seq101-mealy');

    BENCHMARK_EXAMPLES.forEach((ex) => {
      expect(ex.name).toBeTruthy();
      expect(ex.machine.states.length).toBeGreaterThanOrEqual(1);
      expect(ex.machine.alphabet.length).toBeGreaterThanOrEqual(1);
      expect(['mealy', 'moore']).toContain(ex.type);
    });
  });

  it('3. Verifies mandatory benchmark Mealy to Moore transformation (5 states & 1100 -> yxyx)', () => {
    const mealy = MANDATORY_TASK_6_MEALY;
    const { machine: moore, stateMapping } = convertMealyToMoore(mealy);

    // States: S, A_x, A_y, B_x, B_y
    expect(moore.states).toHaveLength(5);
    expect(moore.states.sort()).toEqual(['A_x', 'A_y', 'B_x', 'B_y', 'S'].sort());
    expect(moore.stateOutputs['S']).toBe('ε');

    // Simulate input 1100
    const input = '1100';
    const mealySim = simulateMealy(mealy, input);
    const mooreSim = simulateMoore(moore, input);

    expect(mealySim.outputSequence).toEqual(['y', 'x', 'y', 'x']);
    expect(mooreSim.outputSequence).toEqual(['ε', 'y', 'x', 'y', 'x']);

    // Output tape alignment invariant: Moore stripped of initial epsilon equals Mealy
    expect(mooreSim.outputSequence.slice(1)).toEqual(mealySim.outputSequence);

    // State mapping
    expect(stateMapping['A'].sort()).toEqual(['A_x', 'A_y', 'S'].sort());
    expect(stateMapping['B'].sort()).toEqual(['B_x', 'B_y'].sort());
  });

  it('4. Verifies Moore to Mealy reverse conversion pipeline (Topology preservation & output folding)', () => {
    const moore = EVEN_PARITY_MOORE;
    const { machine: mealy, steps, initialOutput } = convertMooreToMealy(moore);

    // Topology preservation: state count unchanged
    expect(mealy.states).toHaveLength(moore.states.length);
    expect(mealy.initialState).toBe(moore.initialState);
    expect(steps.length).toBeGreaterThanOrEqual(4);

    // Initial Moore output is tracked
    expect(initialOutput).toBe(moore.stateOutputs[moore.initialState]);

    // Test simulation on 101 (parity = 0 -> 1 -> 1 -> 0)
    const testInput = '101';
    const mooreTrace = simulateMoore(moore, testInput);
    const mealyTrace = simulateMealy(mealy, testInput);

    // Stripping initial Moore output yields exact Mealy output
    expect(mooreTrace.outputSequence.slice(1)).toEqual(mealyTrace.outputSequence);
  });

  it('5. Verifies formal product-machine equivalence verification', () => {
    const mealy = MANDATORY_TASK_6_MEALY;
    const moore = convertMealyToMoore(mealy).machine;

    const equivResult = verifyEquivalenceProductMachine(mealy, moore);
    expect(equivResult.isEquivalent).toBe(true);

    // Mutate a transition to verify counterexample detection
    const mutatedMealy = {
      ...mealy,
      transitions: [
        { fromState: 'A', inputSymbol: '0', toState: 'A', outputSymbol: 'y' }, // Mismatch
        ...mealy.transitions.slice(1),
      ],
    };

    const diffResult = verifyEquivalenceProductMachine(mutatedMealy, moore);
    expect(diffResult.isEquivalent).toBe(false);
    expect(diffResult.counterexample).toBeDefined();
    expect(diffResult.counterexample?.inputSequence).toEqual(['0']);
  });
});
