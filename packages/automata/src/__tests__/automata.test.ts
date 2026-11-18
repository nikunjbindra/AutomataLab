import { describe, it, expect } from 'vitest';
import {
  AUTOMATA_ENGINE_VERSION,
  validateStateConsistency,
  getIncomingOutputsForState,
} from '../index.js';

describe('Automata Core Engine Base', () => {
  it('exposes engine version', () => {
    expect(AUTOMATA_ENGINE_VERSION).toBe('1.0.0');
  });

  it('validates state consistency accurately', () => {
    const states = ['q0', 'q1', 'q2'];
    expect(validateStateConsistency(states, ['q0', 'q1'])).toBe(true);
    expect(validateStateConsistency(states, ['q0', 'q_unknown'])).toBe(false);
  });

  it('extracts incoming outputs for Mealy states', () => {
    const transitions = [
      { toState: 'q1', outputSymbol: '0' },
      { toState: 'q1', outputSymbol: '1' },
      { toState: 'q2', outputSymbol: '0' },
    ];

    const q1Outputs = getIncomingOutputsForState('q1', transitions);
    expect(q1Outputs).toEqual(['0', '1']);

    const q2Outputs = getIncomingOutputsForState('q2', transitions);
    expect(q2Outputs).toEqual(['0']);

    const q0Outputs = getIncomingOutputsForState('q0', transitions);
    expect(q0Outputs).toEqual([]);
  });
});
