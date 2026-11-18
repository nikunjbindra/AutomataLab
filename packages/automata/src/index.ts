export * from './types.js';

export const AUTOMATA_ENGINE_VERSION = '0.1.0';

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
