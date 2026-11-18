import type { MealyMachine, MooreMachine, AnyMachine } from '@automatalab/contracts';
import type {
  SimulationTrace,
  SimulationStepRecord,
  OutputAlignmentResult,
} from './types.js';

export function parseInputSequence(input: string | string[], alphabet?: string[]): string[] {
  if (Array.isArray(input)) {
    return [...input];
  }

  if (input === '') {
    return [];
  }

  // If no alphabet provided or all alphabet symbols are single characters, split into chars
  if (!alphabet || alphabet.every((s) => s.length === 1)) {
    return input.split('');
  }

  // Multi-character alphabet parsing (greedy longest-match prefix parsing)
  const sortedAlphabet = [...alphabet].sort((a, b) => b.length - a.length);
  const result: string[] = [];
  let remaining = input;

  while (remaining.length > 0) {
    const matched = sortedAlphabet.find((sym) => remaining.startsWith(sym));
    if (!matched) {
      // Fallback: take 1 character
      result.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      result.push(matched);
      remaining = remaining.slice(matched.length);
    }
  }

  return result;
}

export function simulateMealy(
  machine: MealyMachine,
  rawInput: string | string[]
): SimulationTrace {
  const inputSequence = parseInputSequence(rawInput, machine.alphabet);

  // Transition lookup map: `${fromState}:::${inputSymbol}` -> { toState, outputSymbol }
  const transitionMap = new Map<string, { toState: string; outputSymbol: string }>();
  for (const t of machine.transitions) {
    transitionMap.set(`${t.fromState}:::${t.inputSymbol}`, {
      toState: t.toState,
      outputSymbol: t.outputSymbol,
    });
  }

  let currentState = machine.initialState;
  const visitedStates: string[] = [currentState];
  const outputSequence: string[] = [];
  const steps: SimulationStepRecord[] = [];

  // Initial step 0
  steps.push({
    stepIndex: 0,
    currentState,
    consumedInput: [],
    remainingInput: [...inputSequence],
    cumulativeOutput: [],
    transitionDescription: `Initial state ${currentState} (waiting for input)`,
  });

  for (let i = 0; i < inputSequence.length; i++) {
    const sym = inputSequence[i];
    const trans = transitionMap.get(`${currentState}:::${sym}`);

    if (!trans) {
      throw new Error(
        `Simulation error: No transition defined from state '${currentState}' on input symbol '${sym}' (step ${i + 1})`
      );
    }

    const nextState = trans.toState;
    const emittedOutput = trans.outputSymbol;

    outputSequence.push(emittedOutput);
    visitedStates.push(nextState);

    steps.push({
      stepIndex: i + 1,
      currentState,
      inputSymbol: sym,
      nextState,
      emittedOutput,
      consumedInput: inputSequence.slice(0, i + 1),
      remainingInput: inputSequence.slice(i + 1),
      cumulativeOutput: [...outputSequence],
      transitionDescription: `${currentState} --(${sym} / ${emittedOutput})--> ${nextState}`,
    });

    currentState = nextState;
  }

  return {
    machineType: 'mealy',
    inputSequence,
    outputSequence,
    visitedStates,
    steps,
    finalState: currentState,
  };
}

export function simulateMoore(
  machine: MooreMachine,
  rawInput: string | string[]
): SimulationTrace {
  const inputSequence = parseInputSequence(rawInput, machine.alphabet);

  // Transition lookup map: `${fromState}:::${inputSymbol}` -> toState
  const transitionMap = new Map<string, string>();
  for (const t of machine.transitions) {
    transitionMap.set(`${t.fromState}:::${t.inputSymbol}`, t.toState);
  }

  let currentState = machine.initialState;
  const initialOutput = machine.stateOutputs[currentState];
  if (initialOutput === undefined) {
    throw new Error(`Simulation error: State '${currentState}' has no assigned output in stateOutputs`);
  }

  const visitedStates: string[] = [currentState];
  const outputSequence: string[] = [initialOutput];
  const steps: SimulationStepRecord[] = [];

  // Initial step 0 (emits initial state output)
  steps.push({
    stepIndex: 0,
    currentState,
    emittedOutput: initialOutput,
    consumedInput: [],
    remainingInput: [...inputSequence],
    cumulativeOutput: [initialOutput],
    transitionDescription: `Initial state ${currentState} (emits initial output '${initialOutput}')`,
  });

  for (let i = 0; i < inputSequence.length; i++) {
    const sym = inputSequence[i];
    const nextState = transitionMap.get(`${currentState}:::${sym}`);

    if (!nextState) {
      throw new Error(
        `Simulation error: No transition defined from state '${currentState}' on input symbol '${sym}' (step ${i + 1})`
      );
    }

    const emittedOutput = machine.stateOutputs[nextState];
    if (emittedOutput === undefined) {
      throw new Error(`Simulation error: State '${nextState}' has no assigned output in stateOutputs`);
    }

    outputSequence.push(emittedOutput);
    visitedStates.push(nextState);

    steps.push({
      stepIndex: i + 1,
      currentState,
      inputSymbol: sym,
      nextState,
      emittedOutput,
      consumedInput: inputSequence.slice(0, i + 1),
      remainingInput: inputSequence.slice(i + 1),
      cumulativeOutput: [...outputSequence],
      transitionDescription: `${currentState} --(${sym})--> ${nextState} (emits '${emittedOutput}')`,
    });

    currentState = nextState;
  }

  return {
    machineType: 'moore',
    inputSequence,
    outputSequence,
    visitedStates,
    steps,
    finalState: currentState,
    initialOutput,
  };
}

export function simulateMachine(
  machine: AnyMachine,
  rawInput: string | string[]
): SimulationTrace {
  if (machine.type === 'mealy') {
    return simulateMealy(machine, rawInput);
  }
  return simulateMoore(machine, rawInput);
}

/**
 * Compares Mealy and Moore outputs under the formal initial-output alignment convention:
 * output_Moore(w) = λ_M(s_0) · output_Mealy(w)
 */
export function alignOutputs(
  mealyOutput: string[],
  mooreOutput: string[]
): OutputAlignmentResult {
  const initialMooreOutput = mooreOutput.length > 0 ? mooreOutput[0] : undefined;
  const alignedMooreOutput = mooreOutput.length > 0 ? mooreOutput.slice(1) : [];

  if (mealyOutput.length !== alignedMooreOutput.length) {
    return {
      isMatch: false,
      mealyOutput,
      mooreOutput,
      alignedMooreOutput,
      initialMooreOutput,
      explanation: `Length mismatch after alignment: Mealy produced ${mealyOutput.length} symbols while aligned Moore produced ${alignedMooreOutput.length} symbols.`,
    };
  }

  const isMatch = mealyOutput.every((sym, idx) => sym === alignedMooreOutput[idx]);

  const explanation = isMatch
    ? `Identical transductions: Dropping initial Moore output '${initialMooreOutput ?? 'ε'}' yields synchronized sequence '${mealyOutput.join('')}' on both machines.`
    : `Mismatch found: Mealy produced '${mealyOutput.join('')}' while aligned Moore produced '${alignedMooreOutput.join('')}'.`;

  return {
    isMatch,
    mealyOutput,
    mooreOutput,
    alignedMooreOutput,
    initialMooreOutput,
    explanation,
  };
}
