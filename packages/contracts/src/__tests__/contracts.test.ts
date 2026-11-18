import { describe, it, expect } from 'vitest';
import { MealyMachineSchema, MooreMachineSchema, AnyMachineSchema } from '../machine.js';

describe('Contracts Schema Validation', () => {
  it('validates a valid Mealy machine', () => {
    const validMealy = {
      name: 'Serial Parity Mealy',
      type: 'mealy' as const,
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 'q0',
      transitions: [
        { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: '0' },
        { fromState: 'q0', inputSymbol: '1', toState: 'q1', outputSymbol: '1' },
        { fromState: 'q1', inputSymbol: '0', toState: 'q1', outputSymbol: '1' },
        { fromState: 'q1', inputSymbol: '1', toState: 'q0', outputSymbol: '0' },
      ],
    };

    const parsed = MealyMachineSchema.safeParse(validMealy);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.states).toHaveLength(2);
      expect(parsed.data.initialState).toBe('q0');
    }
  });

  it('rejects a Mealy machine where initialState is not in states', () => {
    const invalidMealy = {
      name: 'Invalid Initial State',
      type: 'mealy' as const,
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 'q99',
      transitions: [],
    };

    const parsed = MealyMachineSchema.safeParse(invalidMealy);
    expect(parsed.success).toBe(false);
  });

  it('validates a valid Moore machine with state outputs', () => {
    const validMoore = {
      name: 'Serial Parity Moore',
      type: 'moore' as const,
      states: ['s0', 's1'],
      alphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 's0',
      transitions: [
        { fromState: 's0', inputSymbol: '0', toState: 's0' },
        { fromState: 's0', inputSymbol: '1', toState: 's1' },
      ],
      stateOutputs: {
        s0: '0',
        s1: '1',
      },
    };

    const parsed = MooreMachineSchema.safeParse(validMoore);
    expect(parsed.success).toBe(true);
  });

  it('rejects a Moore machine missing an output for a state', () => {
    const incompleteMoore = {
      name: 'Missing Output Moore',
      type: 'moore' as const,
      states: ['s0', 's1'],
      alphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 's0',
      transitions: [],
      stateOutputs: {
        s0: '0',
      },
    };

    const parsed = MooreMachineSchema.safeParse(incompleteMoore);
    expect(parsed.success).toBe(false);
  });

  it('correctly parses polymorphic machines through AnyMachineSchema', () => {
    const mealy = {
      name: 'Mealy Polymorphic',
      type: 'mealy' as const,
      states: ['q0'],
      alphabet: ['0'],
      outputAlphabet: ['0'],
      initialState: 'q0',
      transitions: [],
    };

    const parsed = AnyMachineSchema.safeParse(mealy);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.type).toBe('mealy');
    }
  });
});
