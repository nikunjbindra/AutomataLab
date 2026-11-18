import type {
  MooreMachine,
  MealyMachine,
  MealyTransition,
  ConversionStep,
} from '@automatalab/contracts';
import { validateMooreMachine } from './validation.js';
import type { ConversionOptions, MooreToMealyResult } from './types.js';

export function convertMooreToMealy(
  moore: MooreMachine,
  options: ConversionOptions = {}
): MooreToMealyResult {
  const startTime = performance.now();

  // Step 1: Validate machine
  const validation = validateMooreMachine(moore);
  if (!validation.isValid) {
    const errorMsg = validation.issues
      .filter((i) => i.severity === 'error')
      .map((i) => i.message)
      .join('; ');
    throw new Error(`Cannot convert invalid Moore machine: ${errorMsg}`);
  }

  const steps: ConversionStep[] = [];

  // Step 1 Recording
  steps.push({
    stepNumber: 1,
    type: 'analyze_outputs',
    title: 'Validate Source Moore Machine',
    description: `Verified Moore machine '${moore.name}' with ${moore.states.length} states, ${moore.alphabet.length} input symbols, and ${moore.transitions.length} transitions.`,
    mathematicalReason:
      'The source Moore machine must be verified as deterministic and valid before output transition folding.',
    highlightNodes: moore.states,
  });

  // Step 2: Preserve state transition graph
  // States and initial state remain identical
  const mealyStates = [...moore.states];
  const initialOutput = moore.stateOutputs[moore.initialState] || 'ε';

  steps.push({
    stepNumber: 2,
    type: 'split_states',
    title: 'Preserve State Graph Topology',
    description: `Mapped all ${moore.states.length} Moore states directly to Mealy states with initial state '${moore.initialState}'.`,
    mathematicalReason:
      'In Moore-to-Mealy conversion, state splitting is not required. Every Moore state directly corresponds to a Mealy state.',
    highlightNodes: mealyStates,
  });

  // Step 3: Assign transition outputs from target state outputs
  const mealyTransitions: MealyTransition[] = [];
  const usedOutputs = new Set<string>();

  for (const t of moore.transitions) {
    const targetOutput = moore.stateOutputs[t.toState];
    if (targetOutput === undefined) {
      throw new Error(`Target state '${t.toState}' is missing an associated output in source Moore machine.`);
    }

    usedOutputs.add(targetOutput);
    mealyTransitions.push({
      fromState: t.fromState,
      inputSymbol: t.inputSymbol,
      toState: t.toState,
      outputSymbol: targetOutput,
    });
  }

  steps.push({
    stepNumber: 3,
    type: 'fold_outputs',
    title: 'Fold State Outputs onto Transitions',
    description: `Assigned the output of each destination Moore state to its incoming Mealy transition for all ${mealyTransitions.length} transitions.`,
    mathematicalReason:
      'For every state s and input a, the Mealy transition output is defined as λ(s, a) = λ_M(δ_M(s, a)), where λ_M is the Moore state output function.',
  });

  // Step 4: Document treatment of initial Moore output
  steps.push({
    stepNumber: 4,
    type: 'complete',
    title: 'Initial Output Treatment & Alignment',
    description: `The source Moore machine emits initial output '${initialOutput}' at state '${moore.initialState}' before consuming input. The converted Mealy machine emits outputs synchronously upon consuming input symbols.`,
    mathematicalReason:
      'For any input sequence w = a_1 ... a_k, output_Moore(w) = λ_M(s_0) · output_Mealy(w). Stripping the initial Moore symbol aligns the two transductions exactly.',
  });

  // Determine output alphabet (exclude epsilon if it was only on initial state and not in transitions)
  const outputAlphabet = moore.outputAlphabet.filter(
    (sym) => usedOutputs.has(sym) || sym !== 'ε'
  );

  const mealyMachine: MealyMachine = {
    id: moore.id ? `${moore.id}-mealy` : undefined,
    name: `${moore.name} (Mealy Converted)`,
    description: `Equivalent Mealy machine converted from Moore machine '${moore.name}'.`,
    type: 'mealy',
    states: mealyStates,
    alphabet: [...moore.alphabet],
    outputAlphabet: outputAlphabet.length > 0 ? outputAlphabet : [...moore.outputAlphabet],
    initialState: moore.initialState,
    transitions: mealyTransitions,
  };

  const endTime = performance.now();

  steps.push({
    stepNumber: steps.length + 1,
    type: 'complete',
    title: 'Conversion Complete',
    description: `Successfully converted Moore machine to Mealy machine with ${mealyStates.length} states and ${mealyTransitions.length} transitions.`,
    mathematicalReason:
      'Behavioral equivalence holds under the length-|w| suffix alignment convention.',
  });

  return {
    machine: mealyMachine,
    steps,
    initialOutput,
    metrics: {
      sourceStateCount: moore.states.length,
      resultStateCount: mealyStates.length,
      sourceTransitionCount: moore.transitions.length,
      resultTransitionCount: mealyTransitions.length,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    },
  };
}
