import { describe, it, expect } from 'vitest';
import {
  validateMachine,
  validateMealyMachine,
  validateMooreMachine,
  convertMealyToMoore,
  convertMooreToMealy,
} from '../index.js';
import type { MealyMachine, MooreMachine } from '@automatalab/contracts';

describe('CHECKPOINT D3: Comprehensive Negative & Boundary Validation Tests', () => {
  it('rejects a machine with duplicate state identifiers', () => {
    const invalidMachine: MealyMachine = {
      name: 'Duplicate States',
      type: 'mealy',
      states: ['q0', 'q0', 'q1'],
      alphabet: ['0', '1'],
      outputAlphabet: ['x', 'y'],
      initialState: 'q0',
      transitions: [],
    };

    const result = validateMealyMachine(invalidMachine);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'DUPLICATE_STATES')).toBe(true);
  });

  it('rejects a machine with an invalid initial state not present in states', () => {
    const invalidMachine: MealyMachine = {
      name: 'Missing Start State',
      type: 'mealy',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      outputAlphabet: ['x', 'y'],
      initialState: 'q99',
      transitions: [],
    };

    const result = validateMealyMachine(invalidMachine);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INITIAL_STATE_NOT_FOUND')).toBe(true);

    // Also verify conversion throws descriptive error
    expect(() => convertMealyToMoore(invalidMachine)).toThrow(/Initial state 'q99' is not in states/);
  });

  it('detects transitions with destination outside states set', () => {
    const invalidMachine: MealyMachine = {
      name: 'Unknown Destination',
      type: 'mealy',
      states: ['q0'],
      alphabet: ['0'],
      outputAlphabet: ['x'],
      initialState: 'q0',
      transitions: [
        { fromState: 'q0', inputSymbol: '0', toState: 'NON_EXISTENT', outputSymbol: 'x' },
      ],
    };

    const result = validateMealyMachine(invalidMachine);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'UNDECLARED_TO_STATE')).toBe(true);
  });

  it('detects input symbols outside the defined alphabet', () => {
    const invalidMachine: MealyMachine = {
      name: 'Alien Input Symbol',
      type: 'mealy',
      states: ['q0'],
      alphabet: ['0', '1'],
      outputAlphabet: ['x'],
      initialState: 'q0',
      transitions: [
        { fromState: 'q0', inputSymbol: '2', toState: 'q0', outputSymbol: 'x' },
      ],
    };

    const result = validateMealyMachine(invalidMachine);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'UNDECLARED_INPUT_SYMBOL')).toBe(true);
  });

  it('detects transition outputs outside the defined output alphabet', () => {
    const invalidMachine: MealyMachine = {
      name: 'Alien Output Symbol',
      type: 'mealy',
      states: ['q0'],
      alphabet: ['0'],
      outputAlphabet: ['x'],
      initialState: 'q0',
      transitions: [
        { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: 'z' },
      ],
    };

    const result = validateMealyMachine(invalidMachine);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'UNDECLARED_OUTPUT_SYMBOL')).toBe(true);
  });

  it('detects non-deterministic transitions (duplicate fromState + inputSymbol)', () => {
    const nonDetMachine: MealyMachine = {
      name: 'NFA Mealy',
      type: 'mealy',
      states: ['q0', 'q1'],
      alphabet: ['0'],
      outputAlphabet: ['x'],
      initialState: 'q0',
      transitions: [
        { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: 'x' },
        { fromState: 'q0', inputSymbol: '0', toState: 'q1', outputSymbol: 'x' },
      ],
    };

    const result = validateMealyMachine(nonDetMachine);
    expect(result.isValid).toBe(false);
    expect(result.isDeterministic).toBe(false);
    expect(result.issues.some((i) => i.code === 'NON_DETERMINISTIC_TRANSITION')).toBe(true);
  });

  it('detects incomplete transition functions as a warning/incompleteness flag', () => {
    const incompleteMachine: MealyMachine = {
      name: 'Incomplete Mealy',
      type: 'mealy',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      outputAlphabet: ['x'],
      initialState: 'q0',
      transitions: [
        { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: 'x' },
        // Missing transitions for (q0, 1), (q1, 0), (q1, 1)
      ],
    };

    const result = validateMealyMachine(incompleteMachine);
    expect(result.isComplete).toBe(false);
    expect(result.issues.some((i) => i.code === 'INCOMPLETE_TRANSITION')).toBe(true);
  });

  it('rejects Moore machines missing an output assignment for one or more states', () => {
    const incompleteMoore: MooreMachine = {
      name: 'Missing Output Moore',
      type: 'moore',
      states: ['s0', 's1'],
      alphabet: ['0'],
      outputAlphabet: ['a', 'b'],
      initialState: 's0',
      transitions: [
        { fromState: 's0', inputSymbol: '0', toState: 's1' },
        { fromState: 's1', inputSymbol: '0', toState: 's0' },
      ],
      stateOutputs: {
        s0: 'a',
        // s1 is missing an output
      },
    };

    const result = validateMooreMachine(incompleteMoore);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'MISSING_STATE_OUTPUT')).toBe(true);
    expect(() => convertMooreToMealy(incompleteMoore)).toThrow(/State 's1' has no associated output/);
  });
});
