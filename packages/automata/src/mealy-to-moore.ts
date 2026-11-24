import type {
  MealyMachine,
  MooreMachine,
  MooreTransition,
  ConversionStep,
} from '@automatalab/contracts';
import { validateMealyMachine, computeReachableStates } from './validation.js';
import type { ConversionOptions, MealyToMooreResult } from './types.js';

export function convertMealyToMoore(
  mealy: MealyMachine,
  options: ConversionOptions = {}
): MealyToMooreResult {
  const startTime = performance.now();
  const removeUnreachable = options.removeUnreachable ?? true;
  const epsilonSymbol = options.epsilonSymbol ?? 'ε';

  // Step 1: Validate machine
  const validation = validateMealyMachine(mealy);
  if (!validation.isValid) {
    const errorMsg = validation.issues
      .filter((i) => i.severity === 'error')
      .map((i) => i.message)
      .join('; ');
    throw new Error(`Cannot convert invalid Mealy machine: ${errorMsg}`);
  }

  const steps: ConversionStep[] = [];

  // Step 1 Recording
  steps.push({
    stepNumber: 1,
    type: 'analyze_outputs',
    title: 'Validate Source Mealy Machine',
    description: `Verified Mealy machine '${mealy.name}' with ${mealy.states.length} states, ${mealy.alphabet.length} input symbols, and ${mealy.transitions.length} transitions.`,
    mathematicalReason: 'The input machine must be mathematically sound, deterministic, and well-formed before state transformation.',
    highlightNodes: mealy.states,
  });

  // Step 2: Analyze incoming transitions and output values per state
  // Map: state -> Set of distinct outputs on transitions leading INTO that state
  const incomingOutputs = new Map<string, Set<string>>();
  for (const s of mealy.states) {
    incomingOutputs.set(s, new Set<string>());
  }

  for (const t of mealy.transitions) {
    const set = incomingOutputs.get(t.toState);
    if (set) {
      set.add(t.outputSymbol);
    }
  }

  const stateAnalysisMap: Record<string, string[]> = {};
  for (const [state, outputs] of incomingOutputs.entries()) {
    stateAnalysisMap[state] = Array.from(outputs).sort();
  }

  steps.push({
    stepNumber: 2,
    type: 'analyze_outputs',
    title: 'Analyze Incoming Transition Outputs',
    description: 'Examined all incoming transitions to each state to determine distinct output values emitted upon entry.',
    mathematicalReason:
      'In a Moore machine, outputs are bound to states rather than transitions. If a Mealy state is entered with differing outputs, it must be split into distinct states for each unique output.',
    intermediateStateMap: stateAnalysisMap,
    highlightNodes: mealy.states,
  });

  // Step 3: Create separate Moore states for distinct (state, output) pairs
  // Map: JSON.stringify([origState, output]) -> new Moore state name
  const stateOutputToMooreState = new Map<string, string>();
  const stateMapping: Record<string, string[]> = {};
  const mooreStates: string[] = [];
  const stateOutputs: Record<string, string> = {};

  for (const s of mealy.states) {
    stateMapping[s] = [];
    const outputs = incomingOutputs.get(s)!;

    const values = outputs.size ? Array.from(outputs).sort() : [mealy.outputAlphabet[0] || '0'];
    for (const output of values) {
      const baseName = (s + '_' + output).slice(0, 50);
      let stateName = baseName;
      let suffix = 2;
      while (mooreStates.includes(stateName)) {
        const tag = '_' + suffix++;
        stateName = baseName.slice(0, 50 - tag.length) + tag;
      }
      stateOutputToMooreState.set(JSON.stringify([s, output]), stateName);
      mooreStates.push(stateName);
      stateOutputs[stateName] = output;
      stateMapping[s].push(stateName);
    }
  }

  // Step 4: Synthetic initial state introduction
  // Determine unique name for synthetic initial state
  let syntheticInitial = options.syntheticInitialStateName || 'S';
  if (mooreStates.includes(syntheticInitial) || mealy.states.includes(syntheticInitial)) {
    syntheticInitial = 'S_init';
    let counter = 0;
    while (mooreStates.includes(syntheticInitial) || mealy.states.includes(syntheticInitial)) {
      syntheticInitial = `S_init_${counter++}`;
    }
  }

  // Add synthetic initial state
  mooreStates.unshift(syntheticInitial);
  stateOutputs[syntheticInitial] = epsilonSymbol;
  stateMapping[mealy.initialState].push(syntheticInitial);

  steps.push({
    stepNumber: 3,
    type: 'split_states',
    title: 'Create Moore States & Synthetic Initial State',
    description: `Generated ${mooreStates.length - 1} split states for (state, output) pairs and synthetic initial state '${syntheticInitial}' with non-emitting '${epsilonSymbol}' output.`,
    mathematicalReason:
      'At time t=0 before any input is consumed, a Mealy machine produces no output. Introducing synthetic initial state S with output ε preserves this invariant while transitions from S emulate initial state transitions.',
    intermediateStateMap: stateMapping,
    highlightNodes: mooreStates,
  });

  // Step 5: Wire transitions correctly
  // Map original transitions for fast lookup: JSON.stringify([fromState, inputSymbol]) -> { toState, outputSymbol }
  const mealyTransitionMap = new Map<string, { toState: string; outputSymbol: string }>();
  for (const t of mealy.transitions) {
    mealyTransitionMap.set(JSON.stringify([t.fromState, t.inputSymbol]), {
      toState: t.toState,
      outputSymbol: t.outputSymbol,
    });
  }

  const mooreTransitions: MooreTransition[] = [];

  // 5a. Wire transitions from synthetic initial state S
  for (const a of mealy.alphabet) {
    const orig = mealyTransitionMap.get(JSON.stringify([mealy.initialState, a]));
    if (orig) {
      const targetMooreState = stateOutputToMooreState.get(JSON.stringify([orig.toState, orig.outputSymbol]));
      if (targetMooreState) {
        mooreTransitions.push({
          fromState: syntheticInitial,
          inputSymbol: a,
          toState: targetMooreState,
        });
      }
    }
  }

  // 5b. Wire transitions from each split state q_y
  for (const [key, fromMooreState] of stateOutputToMooreState.entries()) {
    const origState: string = JSON.parse(key)[0];
    for (const a of mealy.alphabet) {
      const orig = mealyTransitionMap.get(JSON.stringify([origState, a]));
      if (orig) {
        const targetMooreState = stateOutputToMooreState.get(JSON.stringify([orig.toState, orig.outputSymbol]));
        if (targetMooreState) {
          mooreTransitions.push({
            fromState: fromMooreState,
            inputSymbol: a,
            toState: targetMooreState,
          });
        }
      }
    }
  }

  steps.push({
    stepNumber: 4,
    type: 'wire_transitions',
    title: 'Reconstruct State Transitions',
    description: `Constructed ${mooreTransitions.length} transitions across Moore states using target state and output mappings.`,
    mathematicalReason:
      'For every split state q_y and input symbol a, the target Moore state is p_z where δ(q, a) = p and λ(q, a) = z in the original Mealy machine.',
  });

  // Step 6: Reachability analysis & unreachable state removal
  const reachable = computeReachableStates(
    syntheticInitial,
    mooreTransitions.map((t) => ({ from: t.fromState, to: t.toState }))
  );

  let finalStates = mooreStates;
  let finalTransitions = mooreTransitions;
  let finalStateOutputs = stateOutputs;

  const unreachable = mooreStates.filter((s) => !reachable.has(s));

  if (removeUnreachable && unreachable.length > 0) {
    finalStates = mooreStates.filter((s) => reachable.has(s));
    finalTransitions = mooreTransitions.filter(
      (t) => reachable.has(t.fromState) && reachable.has(t.toState)
    );
    finalStateOutputs = {};
    for (const s of finalStates) {
      finalStateOutputs[s] = stateOutputs[s];
    }

    steps.push({
      stepNumber: 5,
      type: 'remove_unreachable',
      title: 'Prune Unreachable Generated States',
      description: `Removed ${unreachable.length} unreachable state(s): ${unreachable.join(', ')}.`,
      mathematicalReason:
        'States created during the cartesian splitting that cannot be reached from the initial state do not affect the machine language/transduction and are pruned.',
      highlightNodes: unreachable,
    });
  }

  // Ensure output alphabet includes epsilon if not present
  const outputAlphabet = [...mealy.outputAlphabet];
  if (!outputAlphabet.includes(epsilonSymbol)) {
    outputAlphabet.push(epsilonSymbol);
  }

  const mooreMachine: MooreMachine = {
    id: mealy.id ? `${mealy.id}-moore` : undefined,
    name: `${mealy.name} (Moore Converted)`,
    description: `Equivalent Moore machine converted from Mealy machine '${mealy.name}' with initial output alignment.`,
    type: 'moore',
    states: finalStates,
    alphabet: [...mealy.alphabet],
    outputAlphabet,
    initialState: syntheticInitial,
    transitions: finalTransitions,
    stateOutputs: finalStateOutputs,
  };

  const endTime = performance.now();

  steps.push({
    stepNumber: steps.length + 1,
    type: 'complete',
    title: 'Conversion Complete',
    description: `Successfully converted Mealy machine to Moore machine with ${finalStates.length} states and ${finalTransitions.length} transitions.`,
    mathematicalReason:
      'For every input string w ∈ Σ*, the converted Moore machine produces output ε · output(Mealy, w). After initial symbol alignment, outputs are identically equal.',
  });

  return {
    machine: mooreMachine,
    steps,
    stateMapping,
    metrics: {
      sourceStateCount: mealy.states.length,
      resultStateCount: finalStates.length,
      sourceTransitionCount: mealy.transitions.length,
      resultTransitionCount: finalTransitions.length,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    },
  };
}
