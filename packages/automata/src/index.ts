export * from './types.js';
export * from './validation.js';
export * from './mealy-to-moore.js';
export * from './moore-to-mealy.js';
export * from './simulation.js';
export * from './equivalence.js';
export * from './presets.js';
export {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MEALY,
  EVEN_PARITY_MOORE,
  SEQUENCE_101_MEALY,
  SEQUENCE_010_MOORE,
  BINARY_COUNTER_2BIT_MEALY,
  MULTI_SPLIT_MEALY,
  UNREACHABLE_STATE_MEALY,
} from './presets.js';

export const AUTOMATA_ENGINE_VERSION = '1.0.0';

/**
 * Validates whether all transitions in a machine refer only to declared states and symbols.
 */
export function validateStateConsistency(states: string[], referencedStates: string[]): boolean {
  const stateSet = new Set(states);
  return referencedStates.every((s) => stateSet.has(s));
}

/**
 * Extracts incoming transition outputs for a specified state in a Mealy machine.
 */
export function getIncomingOutputsForState(
  state: string,
  transitions: Array<{ toState: string; outputSymbol: string }>
): string[] {
  const outputs = new Set<string>();
  for (const t of transitions) {
    if (t.toState === state) {
      outputs.add(t.outputSymbol);
    }
  }
  return Array.from(outputs).sort();
}
