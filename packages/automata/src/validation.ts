import type { MealyMachine, MooreMachine, AnyMachine } from '@automatalab/contracts';
import type { ValidationResult, ValidationIssue } from './types.js';

export function validateMachine(machine: AnyMachine): ValidationResult {
  if (machine.type === 'mealy') {
    return validateMealyMachine(machine);
  }
  return validateMooreMachine(machine);
}

export function validateMealyMachine(machine: MealyMachine): ValidationResult {
  const issues: ValidationIssue[] = [];
  const stateSet = new Set(machine.states);
  const alphabetSet = new Set(machine.alphabet);
  const outputAlphabetSet = new Set(machine.outputAlphabet);

  // Check unique states
  if (stateSet.size !== machine.states.length) {
    issues.push({
      severity: 'error',
      code: 'DUPLICATE_STATES',
      message: 'State identifiers must be unique in states array',
    });
  }

  // Check unique alphabet symbols
  if (alphabetSet.size !== machine.alphabet.length) {
    issues.push({
      severity: 'error',
      code: 'DUPLICATE_ALPHABET_SYMBOLS',
      message: 'Input alphabet symbols must be unique',
    });
  }

  // Check unique output alphabet symbols
  if (outputAlphabetSet.size !== machine.outputAlphabet.length) {
    issues.push({
      severity: 'error',
      code: 'DUPLICATE_OUTPUT_SYMBOLS',
      message: 'Output alphabet symbols must be unique',
    });
  }

  // Initial state check
  if (!stateSet.has(machine.initialState)) {
    issues.push({
      severity: 'error',
      code: 'INITIAL_STATE_NOT_FOUND',
      message: `Initial state '${machine.initialState}' is not in states list`,
      path: ['initialState'],
    });
  }

  // Transitions check
  const transitionKeys = new Set<string>();
  let isDeterministic = true;

  for (let i = 0; i < machine.transitions.length; i++) {
    const t = machine.transitions[i];
    const key = `${t.fromState}:::${t.inputSymbol}`;

    if (transitionKeys.has(key)) {
      isDeterministic = false;
      issues.push({
        severity: 'error',
        code: 'NON_DETERMINISTIC_TRANSITION',
        message: `Multiple transitions defined for state '${t.fromState}' on input '${t.inputSymbol}'`,
        path: ['transitions', String(i)],
      });
    }
    transitionKeys.add(key);

    if (!stateSet.has(t.fromState)) {
      issues.push({
        severity: 'error',
        code: 'UNDECLARED_FROM_STATE',
        message: `Transition source '${t.fromState}' is not in states list`,
        path: ['transitions', String(i), 'fromState'],
      });
    }

    if (!stateSet.has(t.toState)) {
      issues.push({
        severity: 'error',
        code: 'UNDECLARED_TO_STATE',
        message: `Transition target '${t.toState}' is not in states list`,
        path: ['transitions', String(i), 'toState'],
      });
    }

    if (!alphabetSet.has(t.inputSymbol)) {
      issues.push({
        severity: 'error',
        code: 'UNDECLARED_INPUT_SYMBOL',
        message: `Input symbol '${t.inputSymbol}' is not in input alphabet`,
        path: ['transitions', String(i), 'inputSymbol'],
      });
    }

    if (!outputAlphabetSet.has(t.outputSymbol)) {
      issues.push({
        severity: 'error',
        code: 'UNDECLARED_OUTPUT_SYMBOL',
        message: `Output symbol '${t.outputSymbol}' is not in output alphabet`,
        path: ['transitions', String(i), 'outputSymbol'],
      });
    }
  }

  // Completeness check
  let isComplete = true;
  for (const s of machine.states) {
    for (const a of machine.alphabet) {
      if (!transitionKeys.has(`${s}:::${a}`)) {
        isComplete = false;
        issues.push({
          severity: 'warning',
          code: 'INCOMPLETE_TRANSITION',
          message: `Missing transition for state '${s}' on input '${a}'`,
        });
      }
    }
  }

  // Reachability analysis
  const reachable = computeReachableStates(
    machine.initialState,
    machine.transitions.map((t) => ({ from: t.fromState, to: t.toState }))
  );
  const unreachableStates = machine.states.filter((s) => !reachable.has(s));

  if (unreachableStates.length > 0) {
    issues.push({
      severity: 'warning',
      code: 'UNREACHABLE_STATES',
      message: `Machine contains unreachable states: ${unreachableStates.join(', ')}`,
    });
  }

  const hasErrors = issues.some((iss) => iss.severity === 'error');

  return {
    isValid: !hasErrors,
    isComplete,
    isDeterministic,
    issues,
    unreachableStates,
  };
}

export function validateMooreMachine(machine: MooreMachine): ValidationResult {
  const issues: ValidationIssue[] = [];
  const stateSet = new Set(machine.states);
  const alphabetSet = new Set(machine.alphabet);
  const outputAlphabetSet = new Set(machine.outputAlphabet);

  // Check unique states
  if (stateSet.size !== machine.states.length) {
    issues.push({
      severity: 'error',
      code: 'DUPLICATE_STATES',
      message: 'State identifiers must be unique in states array',
    });
  }

  // Check unique alphabet symbols
  if (alphabetSet.size !== machine.alphabet.length) {
    issues.push({
      severity: 'error',
      code: 'DUPLICATE_ALPHABET_SYMBOLS',
      message: 'Input alphabet symbols must be unique',
    });
  }

  // Check unique output alphabet symbols
  if (outputAlphabetSet.size !== machine.outputAlphabet.length) {
    issues.push({
      severity: 'error',
      code: 'DUPLICATE_OUTPUT_SYMBOLS',
      message: 'Output alphabet symbols must be unique',
    });
  }

  // Initial state check
  if (!stateSet.has(machine.initialState)) {
    issues.push({
      severity: 'error',
      code: 'INITIAL_STATE_NOT_FOUND',
      message: `Initial state '${machine.initialState}' is not in states list`,
      path: ['initialState'],
    });
  }

  // State outputs check
  for (const s of machine.states) {
    const out = machine.stateOutputs[s];
    if (out === undefined) {
      issues.push({
        severity: 'error',
        code: 'MISSING_STATE_OUTPUT',
        message: `State '${s}' has no associated output in stateOutputs`,
        path: ['stateOutputs', s],
      });
    } else if (!outputAlphabetSet.has(out) && out !== 'ε') {
      issues.push({
        severity: 'error',
        code: 'UNDECLARED_OUTPUT_SYMBOL',
        message: `Output '${out}' for state '${s}' is not declared in output alphabet`,
        path: ['stateOutputs', s],
      });
    }
  }

  // Transitions check
  const transitionKeys = new Set<string>();
  let isDeterministic = true;

  for (let i = 0; i < machine.transitions.length; i++) {
    const t = machine.transitions[i];
    const key = `${t.fromState}:::${t.inputSymbol}`;

    if (transitionKeys.has(key)) {
      isDeterministic = false;
      issues.push({
        severity: 'error',
        code: 'NON_DETERMINISTIC_TRANSITION',
        message: `Multiple transitions defined for state '${t.fromState}' on input '${t.inputSymbol}'`,
        path: ['transitions', String(i)],
      });
    }
    transitionKeys.add(key);

    if (!stateSet.has(t.fromState)) {
      issues.push({
        severity: 'error',
        code: 'UNDECLARED_FROM_STATE',
        message: `Transition source '${t.fromState}' is not in states list`,
        path: ['transitions', String(i), 'fromState'],
      });
    }

    if (!stateSet.has(t.toState)) {
      issues.push({
        severity: 'error',
        code: 'UNDECLARED_TO_STATE',
        message: `Transition target '${t.toState}' is not in states list`,
        path: ['transitions', String(i), 'toState'],
      });
    }

    if (!alphabetSet.has(t.inputSymbol)) {
      issues.push({
        severity: 'error',
        code: 'UNDECLARED_INPUT_SYMBOL',
        message: `Input symbol '${t.inputSymbol}' is not in input alphabet`,
        path: ['transitions', String(i), 'inputSymbol'],
      });
    }
  }

  // Completeness check
  let isComplete = true;
  for (const s of machine.states) {
    for (const a of machine.alphabet) {
      if (!transitionKeys.has(`${s}:::${a}`)) {
        isComplete = false;
        issues.push({
          severity: 'warning',
          code: 'INCOMPLETE_TRANSITION',
          message: `Missing transition for state '${s}' on input '${a}'`,
        });
      }
    }
  }

  // Reachability analysis
  const reachable = computeReachableStates(
    machine.initialState,
    machine.transitions.map((t) => ({ from: t.fromState, to: t.toState }))
  );
  const unreachableStates = machine.states.filter((s) => !reachable.has(s));

  if (unreachableStates.length > 0) {
    issues.push({
      severity: 'warning',
      code: 'UNREACHABLE_STATES',
      message: `Machine contains unreachable states: ${unreachableStates.join(', ')}`,
    });
  }

  const hasErrors = issues.some((iss) => iss.severity === 'error');

  return {
    isValid: !hasErrors,
    isComplete,
    isDeterministic,
    issues,
    unreachableStates,
  };
}

export function computeReachableStates(
  initialState: string,
  transitions: Array<{ from: string; to: string }>
): Set<string> {
  const reachable = new Set<string>([initialState]);
  const adj = new Map<string, string[]>();

  for (const t of transitions) {
    const list = adj.get(t.from) || [];
    list.push(t.to);
    adj.set(t.from, list);
  }

  const queue: string[] = [initialState];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adj.get(curr) || [];
    for (const next of neighbors) {
      if (!reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    }
  }

  return reachable;
}
