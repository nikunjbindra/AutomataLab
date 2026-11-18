import { describe, it, expect } from 'vitest';
import {
  EVEN_PARITY_MEALY,
  EVEN_PARITY_MOORE,
  SEQUENCE_101_MEALY,
  SEQUENCE_010_MOORE,
  BINARY_COUNTER_2BIT_MEALY,
  MULTI_SPLIT_MEALY,
  UNREACHABLE_STATE_MEALY,
  convertMealyToMoore,
  convertMooreToMealy,
  simulateMealy,
  simulateMoore,
  simulateMachine,
  alignOutputs,
  verifyEquivalenceBounded,
  verifyEquivalenceProductMachine,
  validateMachine,
} from '../index.js';
import type { MealyMachine, MooreMachine } from '@automatalab/contracts';

describe('TASK 7: Comprehensive Mathematical Test Suite', () => {
  describe('Parity Generators', () => {
    it('verifies Even Parity Mealy-to-Moore conversion and behavioral equivalence', () => {
      const conversion = convertMealyToMoore(EVEN_PARITY_MEALY);
      const moore = conversion.machine;

      // Product-machine proof
      const productProof = verifyEquivalenceProductMachine(EVEN_PARITY_MEALY, moore);
      expect(productProof.isEquivalent).toBe(true);

      // Verify sequence parity calculation: "1101" has 3 ones -> odd parity (1)
      const testInput = '1101';
      const mealyTrace = simulateMealy(EVEN_PARITY_MEALY, testInput);
      const mooreTrace = simulateMoore(moore, testInput);

      expect(mealyTrace.outputSequence).toEqual(['1', '0', '0', '1']);
      expect(mooreTrace.outputSequence).toEqual(['ε', '1', '0', '0', '1']);

      const aligned = alignOutputs(mealyTrace.outputSequence, mooreTrace.outputSequence);
      expect(aligned.isMatch).toBe(true);
    });

    it('verifies Even Parity Moore-to-Mealy conversion', () => {
      const conversion = convertMooreToMealy(EVEN_PARITY_MOORE);
      const mealy = conversion.machine;

      expect(conversion.initialOutput).toBe('0');
      const productProof = verifyEquivalenceProductMachine(mealy, EVEN_PARITY_MOORE);
      expect(productProof.isEquivalent).toBe(true);

      const mealyTrace = simulateMealy(mealy, '101');
      const mooreTrace = simulateMoore(EVEN_PARITY_MOORE, '101');
      const aligned = alignOutputs(mealyTrace.outputSequence, mooreTrace.outputSequence);
      expect(aligned.isMatch).toBe(true);
    });
  });

  describe('Sequence Detectors (101 and 010)', () => {
    it('verifies 101 Overlapping Sequence Detector conversion', () => {
      const conversion = convertMealyToMoore(SEQUENCE_101_MEALY);
      const moore = conversion.machine;

      // Verify equivalence via product machine
      const equiv = verifyEquivalenceProductMachine(SEQUENCE_101_MEALY, moore);
      expect(equiv.isEquivalent).toBe(true);

      // Test overlapping 10101 string: matches at index 2 (101) and index 4 (101)
      const stream = '10101';
      const mealyTrace = simulateMealy(SEQUENCE_101_MEALY, stream);
      const mooreTrace = simulateMoore(moore, stream);

      expect(mealyTrace.outputSequence).toEqual(['0', '0', '1', '0', '1']);
      const aligned = alignOutputs(mealyTrace.outputSequence, mooreTrace.outputSequence);
      expect(aligned.isMatch).toBe(true);
    });

    it('verifies 010 Non-Overlapping Moore-to-Mealy conversion', () => {
      const conversion = convertMooreToMealy(SEQUENCE_010_MOORE);
      const mealy = conversion.machine;

      const equiv = verifyEquivalenceProductMachine(mealy, SEQUENCE_010_MOORE);
      expect(equiv.isEquivalent).toBe(true);

      const stream = '010010';
      const mealyTrace = simulateMealy(mealy, stream);
      const mooreTrace = simulateMoore(SEQUENCE_010_MOORE, stream);

      const aligned = alignOutputs(mealyTrace.outputSequence, mooreTrace.outputSequence);
      expect(aligned.isMatch).toBe(true);
      // Both detect 010 at step 3 and step 6
      expect(mealyTrace.outputSequence).toEqual(['0', '0', '1', '0', '0', '1']);
    });
  });

  describe('Multi-Character Symbols & Binary Counters', () => {
    it('correctly handles multi-character input and output symbols in 2-bit counter', () => {
      const conversion = convertMealyToMoore(BINARY_COUNTER_2BIT_MEALY);
      const moore = conversion.machine;

      expect(moore.alphabet).toEqual(['inc', 'hold']);
      expect(moore.outputAlphabet).toContain('norm');
      expect(moore.outputAlphabet).toContain('roll');

      // Test input sequence of 4 increments: C0 -> C1 -> C2 -> C3 -> C0 (rolls over on 4th inc)
      const input = ['inc', 'inc', 'inc', 'inc', 'hold'];
      const mealyTrace = simulateMealy(BINARY_COUNTER_2BIT_MEALY, input);
      const mooreTrace = simulateMoore(moore, input);

      expect(mealyTrace.outputSequence).toEqual(['norm', 'norm', 'norm', 'roll', 'norm']);
      const aligned = alignOutputs(mealyTrace.outputSequence, mooreTrace.outputSequence);
      expect(aligned.isMatch).toBe(true);
    });
  });

  describe('Multiple State Splits (3-way split)', () => {
    it('splits state R into 3 distinct Moore states for incoming outputs p, q, r', () => {
      const conversion = convertMealyToMoore(MULTI_SPLIT_MEALY);
      const moore = conversion.machine;

      // State R must be split into R_p, R_q, R_r
      expect(moore.states).toContain('R_p');
      expect(moore.states).toContain('R_q');
      expect(moore.states).toContain('R_r');

      expect(moore.stateOutputs['R_p']).toBe('p');
      expect(moore.stateOutputs['R_q']).toBe('q');
      expect(moore.stateOutputs['R_r']).toBe('r');

      // Verify product machine equivalence
      const proof = verifyEquivalenceProductMachine(MULTI_SPLIT_MEALY, moore);
      expect(proof.isEquivalent).toBe(true);
    });
  });

  describe('Unreachable States Pruning', () => {
    it('prunes unreachable state DEAD during conversion when removeUnreachable is true', () => {
      const conversion = convertMealyToMoore(UNREACHABLE_STATE_MEALY, { removeUnreachable: true });
      const moore = conversion.machine;

      // DEAD was unreachable from ACTIVE; it should not appear in final states
      const deadStates = moore.states.filter((s) => s.startsWith('DEAD'));
      expect(deadStates).toHaveLength(0);

      // Equivalence holds
      const proof = verifyEquivalenceProductMachine(UNREACHABLE_STATE_MEALY, moore);
      expect(proof.isEquivalent).toBe(true);
    });

    it('keeps unreachable states when removeUnreachable is false', () => {
      const conversion = convertMealyToMoore(UNREACHABLE_STATE_MEALY, { removeUnreachable: false });
      const moore = conversion.machine;

      const deadStates = moore.states.filter((s) => s.startsWith('DEAD'));
      expect(deadStates.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases: Empty Input & Self-Loops', () => {
    it('handles empty input sequence (|w| = 0) correctly', () => {
      const mealyTrace = simulateMealy(EVEN_PARITY_MEALY, []);
      expect(mealyTrace.outputSequence).toEqual([]);
      expect(mealyTrace.visitedStates).toEqual(['even']);
      expect(mealyTrace.steps).toHaveLength(1);

      const mooreTrace = simulateMoore(EVEN_PARITY_MOORE, []);
      expect(mooreTrace.outputSequence).toEqual(['0']);
      expect(mooreTrace.visitedStates).toEqual(['even']);
      expect(mooreTrace.steps).toHaveLength(1);

      const aligned = alignOutputs(mealyTrace.outputSequence, mooreTrace.outputSequence);
      expect(aligned.isMatch).toBe(true);
      expect(aligned.mealyOutput).toEqual([]);
      expect(aligned.alignedMooreOutput).toEqual([]);
    });

    it('handles self-loops with differing outputs on same state', () => {
      const selfLoopMealy: MealyMachine = {
        name: 'Self Loop Mealy',
        type: 'mealy',
        states: ['q0'],
        alphabet: ['0', '1'],
        outputAlphabet: ['a', 'b'],
        initialState: 'q0',
        transitions: [
          { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: 'a' },
          { fromState: 'q0', inputSymbol: '1', toState: 'q0', outputSymbol: 'b' },
        ],
      };

      const conversion = convertMealyToMoore(selfLoopMealy);
      const moore = conversion.machine;

      expect(moore.states).toContain('q0_a');
      expect(moore.states).toContain('q0_b');

      const proof = verifyEquivalenceProductMachine(selfLoopMealy, moore);
      expect(proof.isEquivalent).toBe(true);
    });
  });

  describe('Non-Equivalence & Counterexample Synthesis', () => {
    it('identifies non-equivalent machines and produces a minimal counterexample', () => {
      const machine1: MealyMachine = {
        name: 'Inverter A',
        type: 'mealy',
        states: ['q0'],
        alphabet: ['0', '1'],
        outputAlphabet: ['0', '1'],
        initialState: 'q0',
        transitions: [
          { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: '1' },
          { fromState: 'q0', inputSymbol: '1', toState: 'q0', outputSymbol: '0' },
        ],
      };

      const machine2: MealyMachine = {
        name: 'Identity B',
        type: 'mealy',
        states: ['q0'],
        alphabet: ['0', '1'],
        outputAlphabet: ['0', '1'],
        initialState: 'q0',
        transitions: [
          { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: '0' }, // Differs here!
          { fromState: 'q0', inputSymbol: '1', toState: 'q0', outputSymbol: '1' },
        ],
      };

      // Product machine verification
      const result = verifyEquivalenceProductMachine(machine1, machine2);
      expect(result.isEquivalent).toBe(false);
      expect(result.counterexample).toBeDefined();
      expect(result.counterexample?.inputSequence).toEqual(['0']);

      // Bounded verification
      const bounded = verifyEquivalenceBounded(machine1, machine2, 3);
      expect(bounded.isEquivalent).toBe(false);
      expect(bounded.counterexample).toBeDefined();
    });
  });

  describe('Validation of Invalid Machine Definitions', () => {
    it('detects non-deterministic transitions in Mealy machine', () => {
      const nonDetMealy: MealyMachine = {
        name: 'Non Det',
        type: 'mealy',
        states: ['q0'],
        alphabet: ['0'],
        outputAlphabet: ['0', '1'],
        initialState: 'q0',
        transitions: [
          { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: '0' },
          { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: '1' },
        ],
      };

      const validation = validateMachine(nonDetMealy);
      expect(validation.isValid).toBe(false);
      expect(validation.isDeterministic).toBe(false);
      expect(validation.issues.some((i) => i.code === 'NON_DETERMINISTIC_TRANSITION')).toBe(true);

      // convertMealyToMoore throws on invalid machine
      expect(() => convertMealyToMoore(nonDetMealy)).toThrow(/Cannot convert invalid Mealy machine/);
    });

    it('detects missing outputs in Moore machine', () => {
      const badMoore = {
        name: 'Bad Moore',
        type: 'moore' as const,
        states: ['s0', 's1'],
        alphabet: ['0'],
        outputAlphabet: ['0'],
        initialState: 's0',
        transitions: [{ fromState: 's0', inputSymbol: '0', toState: 's1' }],
        stateOutputs: { s0: '0' }, // s1 missing
      };

      const validation = validateMachine(badMoore as unknown as MooreMachine);
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some((i) => i.code === 'MISSING_STATE_OUTPUT')).toBe(true);
    });
  });
});
