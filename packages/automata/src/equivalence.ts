import type { AnyMachine, MealyMachine, MooreMachine } from '@automatalab/contracts';
import { simulateMachine, alignOutputs } from './simulation.js';
import type {
  BoundedEquivalenceResult,
  ProductMachineEquivalenceResult,
  Counterexample,
} from './types.js';

export interface EquivalenceOptions {
  epsilonSymbol?: string;
}

/**
 * TASK 5 (Part A): Bounded exhaustive testing over input sequences up to maxDepth.
 */
export function verifyEquivalenceBounded(
  machineA: AnyMachine,
  machineB: AnyMachine,
  maxDepth = 5,
  options: EquivalenceOptions = {}
): BoundedEquivalenceResult {
  // Validate alphabet compatibility
  const setA = new Set(machineA.alphabet);
  const setB = new Set(machineB.alphabet);
  const sharedAlphabet = machineA.alphabet.filter((sym) => setB.has(sym));

  if (setA.size !== setB.size || sharedAlphabet.length !== setA.size) {
    return {
      isEquivalent: false,
      method: 'bounded_exhaustive',
      maxDepth,
      checkedSequencesCount: 0,
      explanation: `Input alphabets do not match: [${machineA.alphabet.join(', ')}] vs [${machineB.alphabet.join(', ')}].`,
    };
  }

  let checkedSequencesCount = 0;

  // Generate sequences using BFS up to maxDepth
  const queue: string[][] = [[]];

  while (queue.length > 0) {
    const seq = queue.shift()!;
    checkedSequencesCount++;

    const traceA = simulateMachine(machineA, seq);
    const traceB = simulateMachine(machineB, seq);

    const match = compareTraceOutputs(traceA.machineType, traceA.outputSequence, traceB.machineType, traceB.outputSequence);

    if (!match.isMatch) {
      return {
        isEquivalent: false,
        method: 'bounded_exhaustive',
        maxDepth,
        checkedSequencesCount,
        counterexample: {
          inputSequence: seq,
          outputA: traceA.outputSequence,
          outputB: traceB.outputSequence,
          firstMismatchIndex: match.mismatchIndex,
        },
        explanation: `Mismatch detected on input sequence '${seq.join('')}': Machine A (${machineA.name}) emitted [${traceA.outputSequence.join(', ')}], while Machine B (${machineB.name}) emitted [${traceB.outputSequence.join(', ')}].`,
      };
    }

    // Expand if under maxDepth
    if (seq.length < maxDepth) {
      for (const a of sharedAlphabet) {
        queue.push([...seq, a]);
      }
    }
  }

  return {
    isEquivalent: true,
    method: 'bounded_exhaustive',
    maxDepth,
    checkedSequencesCount,
    explanation: `Bounded verification verified identical outputs across all ${checkedSequencesCount} input sequences up to length ${maxDepth}. (Note: This is bounded exhaustive testing, not a complete mathematical proof for all lengths).`,
  };
}

/**
 * TASK 5 (Part B): Complete Product-Machine State Exploration for deterministic, complete finite transducers.
 */
export function verifyEquivalenceProductMachine(
  machineA: AnyMachine,
  machineB: AnyMachine,
  options: EquivalenceOptions = {}
): ProductMachineEquivalenceResult {
  const alphabetA = new Set(machineA.alphabet);
  const alphabetB = new Set(machineB.alphabet);

  // Verify identical input alphabets
  if (alphabetA.size !== alphabetB.size || !machineA.alphabet.every((a) => alphabetB.has(a))) {
    return {
      isEquivalent: false,
      method: 'product_machine',
      reachablePairsCount: 0,
      totalPairSpaceSize: machineA.states.length * machineB.states.length,
      explanation: `Incompatible input alphabets: [${machineA.alphabet.join(', ')}] vs [${machineB.alphabet.join(', ')}].`,
    };
  }

  const alphabet = machineA.alphabet;
  const totalPairSpaceSize = machineA.states.length * machineB.states.length;

  // Build transition lookup tables
  // For Mealy: JSON.stringify([state, sym]) -> { toState, output }
  // For Moore: JSON.stringify([state, sym]) -> toState
  const mealyTransA = machineA.type === 'mealy' ? buildMealyTransitionMap(machineA) : null;
  const mooreTransA = machineA.type === 'moore' ? buildMooreTransitionMap(machineA) : null;

  const mealyTransB = machineB.type === 'mealy' ? buildMealyTransitionMap(machineB) : null;
  const mooreTransB = machineB.type === 'moore' ? buildMooreTransitionMap(machineB) : null;

  // Check initial Moore outputs if both are Moore machines
  if (machineA.type === 'moore' && machineB.type === 'moore') {
    const initA = machineA.stateOutputs[machineA.initialState];
    const initB = machineB.stateOutputs[machineB.initialState];
    const eps = options.epsilonSymbol ?? 'ε';

    // If both have explicit non-epsilon outputs and they differ
    if (initA !== initB && initA !== eps && initB !== eps) {
      return {
        isEquivalent: false,
        method: 'product_machine',
        reachablePairsCount: 1,
        totalPairSpaceSize,
        counterexample: {
          inputSequence: [],
          outputA: [initA],
          outputB: [initB],
          firstMismatchIndex: 0,
        },
        explanation: `Initial state output mismatch on empty input ε: Machine A outputs '${initA}' while Machine B outputs '${initB}'.`,
      };
    }
  }

  // BFS Queue for Product Machine Exploration
  interface PairQueueItem {
    stateA: string;
    stateB: string;
    path: string[];
  }

  const queue: PairQueueItem[] = [
    {
      stateA: machineA.initialState,
      stateB: machineB.initialState,
      path: [],
    },
  ];

  const visitedPairs = new Set<string>();
  visitedPairs.add(JSON.stringify([machineA.initialState, machineB.initialState]));

  while (queue.length > 0) {
    const { stateA, stateB, path } = queue.shift()!;

    for (const sym of alphabet) {
      let nextStateA: string;
      let nextStateB: string;
      let outputA: string;
      let outputB: string;

      // Machine A step
      if (machineA.type === 'mealy') {
        const trans = mealyTransA!.get(JSON.stringify([stateA, sym]));
        if (!trans) {
          throw new Error(`Incomplete transition in Machine A for state '${stateA}' on symbol '${sym}'.`);
        }
        nextStateA = trans.toState;
        outputA = trans.output;
      } else {
        const toState = mooreTransA!.get(JSON.stringify([stateA, sym]));
        if (!toState) {
          throw new Error(`Incomplete transition in Machine A for state '${stateA}' on symbol '${sym}'.`);
        }
        nextStateA = toState;
        outputA = machineA.stateOutputs[nextStateA];
      }

      // Machine B step
      if (machineB.type === 'mealy') {
        const trans = mealyTransB!.get(JSON.stringify([stateB, sym]));
        if (!trans) {
          throw new Error(`Incomplete transition in Machine B for state '${stateB}' on symbol '${sym}'.`);
        }
        nextStateB = trans.toState;
        outputB = trans.output;
      } else {
        const toState = mooreTransB!.get(JSON.stringify([stateB, sym]));
        if (!toState) {
          throw new Error(`Incomplete transition in Machine B for state '${stateB}' on symbol '${sym}'.`);
        }
        nextStateB = toState;
        outputB = machineB.stateOutputs[nextStateB];
      }

      // Check synchronous output equivalence on this transition
      if (outputA !== outputB) {
        const counterInput = [...path, sym];
        const traceA = simulateMachine(machineA, counterInput);
        const traceB = simulateMachine(machineB, counterInput);

        return {
          isEquivalent: false,
          method: 'product_machine',
          reachablePairsCount: visitedPairs.size,
          totalPairSpaceSize,
          counterexample: {
            inputSequence: counterInput,
            outputA: traceA.outputSequence,
            outputB: traceB.outputSequence,
            firstMismatchIndex: counterInput.length - 1,
          },
          explanation: `Minimal counterexample found on input sequence '${counterInput.join('')}': transition from state pair (${stateA}, ${stateB}) on '${sym}' produces mismatched outputs '${outputA}' != '${outputB}'.`,
        };
      }

      // Next state pair in product automaton
      const nextPairKey = JSON.stringify([nextStateA, nextStateB]);
      if (!visitedPairs.has(nextPairKey)) {
        visitedPairs.add(nextPairKey);
        queue.push({
          stateA: nextStateA,
          stateB: nextStateB,
          path: [...path, sym],
        });
      }
    }
  }

  return {
    isEquivalent: true,
    method: 'product_machine',
    reachablePairsCount: visitedPairs.size,
    totalPairSpaceSize,
    explanation: `Complete formal proof: Explored all ${visitedPairs.size} reachable product state pairs across the total state space (${totalPairSpaceSize} possible pairs). Synchronous output equivalence is formally verified for all infinite input sequences in Σ*.`,
  };
}

function buildMealyTransitionMap(mealy: MealyMachine): Map<string, { toState: string; output: string }> {
  const map = new Map<string, { toState: string; output: string }>();
  for (const t of mealy.transitions) {
    map.set(JSON.stringify([t.fromState, t.inputSymbol]), {
      toState: t.toState,
      output: t.outputSymbol,
    });
  }
  return map;
}

function buildMooreTransitionMap(moore: MooreMachine): Map<string, string> {
  const map = new Map<string, string>();
  for (const t of moore.transitions) {
    map.set(JSON.stringify([t.fromState, t.inputSymbol]), t.toState);
  }
  return map;
}

function compareTraceOutputs(
  typeA: 'mealy' | 'moore',
  outputA: string[],
  typeB: 'mealy' | 'moore',
  outputB: string[]
): { isMatch: boolean; mismatchIndex: number } {
  let alignedA = outputA;
  let alignedB = outputB;

  if (typeA === 'moore' && typeB === 'mealy') {
    alignedA = outputA.length > 0 ? outputA.slice(1) : [];
  } else if (typeA === 'mealy' && typeB === 'moore') {
    alignedB = outputB.length > 0 ? outputB.slice(1) : [];
  } else if (typeA === 'moore' && typeB === 'moore') {
    // If both Moore, if lengths equal, compare directly
    if (alignedA.length !== alignedB.length) {
      return { isMatch: false, mismatchIndex: 0 };
    }
  }

  if (alignedA.length !== alignedB.length) {
    return { isMatch: false, mismatchIndex: Math.min(alignedA.length, alignedB.length) };
  }

  for (let i = 0; i < alignedA.length; i++) {
    if (alignedA[i] !== alignedB[i]) {
      return { isMatch: false, mismatchIndex: i };
    }
  }

  return { isMatch: true, mismatchIndex: -1 };
}
