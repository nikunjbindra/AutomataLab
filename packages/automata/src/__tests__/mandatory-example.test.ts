import { describe, it, expect } from 'vitest';
import {
  MANDATORY_TASK_6_MEALY,
  convertMealyToMoore,
  simulateMealy,
  simulateMoore,
  alignOutputs,
  verifyEquivalenceProductMachine,
  verifyEquivalenceBounded,
} from '../index.js';

describe('TASK 6: Mandatory Manually Validated Example', () => {
  const mealy = MANDATORY_TASK_6_MEALY;

  it('converts the reference Mealy machine to expected Moore states and state outputs', () => {
    const result = convertMealyToMoore(mealy);
    const moore = result.machine;

    // Expected Moore states: S/ε, A_x/x, A_y/y, B_x/x, B_y/y
    const expectedStates = ['S', 'A_x', 'A_y', 'B_x', 'B_y'];
    expect(moore.states.slice().sort()).toEqual(expectedStates.slice().sort());
    expect(moore.initialState).toBe('S');

    // Expected outputs
    expect(moore.stateOutputs['S']).toBe('ε');
    expect(moore.stateOutputs['A_x']).toBe('x');
    expect(moore.stateOutputs['A_y']).toBe('y');
    expect(moore.stateOutputs['B_x']).toBe('x');
    expect(moore.stateOutputs['B_y']).toBe('y');
  });

  it('verifies the COMPLETE converted Moore transition table match exactly', () => {
    const result = convertMealyToMoore(mealy);
    const moore = result.machine;

    // Build transition map for exact table verification: `${fromState}:::${input}` -> toState
    const transMap = new Map<string, string>();
    for (const t of moore.transitions) {
      transMap.set(`${t.fromState}:::${t.inputSymbol}`, t.toState);
    }

    // Expected complete transition table:
    // S:   0->A_x, 1->B_y
    expect(transMap.get('S:::0')).toBe('A_x');
    expect(transMap.get('S:::1')).toBe('B_y');

    // A_x: 0->A_x, 1->B_y
    expect(transMap.get('A_x:::0')).toBe('A_x');
    expect(transMap.get('A_x:::1')).toBe('B_y');

    // A_y: 0->A_x, 1->B_y
    expect(transMap.get('A_y:::0')).toBe('A_x');
    expect(transMap.get('A_y:::1')).toBe('B_y');

    // B_x: 0->A_y, 1->B_x
    expect(transMap.get('B_x:::0')).toBe('A_y');
    expect(transMap.get('B_x:::1')).toBe('B_x');

    // B_y: 0->A_y, 1->B_x
    expect(transMap.get('B_y:::0')).toBe('A_y');
    expect(transMap.get('B_y:::1')).toBe('B_x');

    // Total transitions: 5 states * 2 inputs = 10 transitions
    expect(moore.transitions).toHaveLength(10);
  });

  it('input 1100 produces yxyx on both machines after output alignment', () => {
    const result = convertMealyToMoore(mealy);
    const moore = result.machine;

    const input = '1100';

    // Simulate Mealy machine:
    // State A on 1 -> B with output y
    // State B on 1 -> B with output x
    // State B on 0 -> A with output y
    // State A on 0 -> A with output x
    // Output: y x y x
    const mealyTrace = simulateMealy(mealy, input);
    expect(mealyTrace.outputSequence).toEqual(['y', 'x', 'y', 'x']);
    expect(mealyTrace.visitedStates).toEqual(['A', 'B', 'B', 'A', 'A']);

    // Simulate Moore machine:
    // Start at S, initial output ε
    // S on 1 -> B_y, emits y
    // B_y on 1 -> B_x, emits x
    // B_x on 0 -> A_y, emits y
    // A_y on 0 -> A_x, emits x
    // Output: ε y x y x
    const mooreTrace = simulateMoore(moore, input);
    expect(mooreTrace.outputSequence).toEqual(['ε', 'y', 'x', 'y', 'x']);
    expect(mooreTrace.visitedStates).toEqual(['S', 'B_y', 'B_x', 'A_y', 'A_x']);

    // Alignment comparison
    const alignment = alignOutputs(mealyTrace.outputSequence, mooreTrace.outputSequence);
    expect(alignment.isMatch).toBe(true);
    expect(alignment.mealyOutput).toEqual(['y', 'x', 'y', 'x']);
    expect(alignment.alignedMooreOutput).toEqual(['y', 'x', 'y', 'x']);
    expect(alignment.initialMooreOutput).toBe('ε');
  });

  it('formally proves complete equivalence via product-machine state exploration', () => {
    const result = convertMealyToMoore(mealy);
    const moore = result.machine;

    const productVerification = verifyEquivalenceProductMachine(mealy, moore);
    expect(productVerification.isEquivalent).toBe(true);
    expect(productVerification.method).toBe('product_machine');
    expect(productVerification.counterexample).toBeUndefined();
    expect(productVerification.reachablePairsCount).toBeGreaterThanOrEqual(4);
  });

  it('verifies bounded exhaustive equivalence across all sequences up to length 6', () => {
    const result = convertMealyToMoore(mealy);
    const moore = result.machine;

    const bounded = verifyEquivalenceBounded(mealy, moore, 6);
    expect(bounded.isEquivalent).toBe(true);
    expect(bounded.method).toBe('bounded_exhaustive');
    expect(bounded.checkedSequencesCount).toBe(127); // 1 + 2 + 4 + 8 + 16 + 32 + 64 = 127
  });
});
