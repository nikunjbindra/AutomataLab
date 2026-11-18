import type {
  MealyMachine,
  MooreMachine,
  AnyMachine,
  ConversionStep,
} from '@automatalab/contracts';

export interface ConversionOptions {
  removeUnreachable?: boolean;
  syntheticInitialStateName?: string;
  epsilonSymbol?: string;
}

export interface ConversionMetrics {
  sourceStateCount: number;
  resultStateCount: number;
  sourceTransitionCount: number;
  resultTransitionCount: number;
  executionTimeMs: number;
}

export interface MealyToMooreResult {
  machine: MooreMachine;
  steps: ConversionStep[];
  stateMapping: Record<string, string[]>;
  metrics: ConversionMetrics;
}

export interface MooreToMealyResult {
  machine: MealyMachine;
  steps: ConversionStep[];
  initialOutput: string;
  metrics: ConversionMetrics;
}

export interface SimulationStepRecord {
  stepIndex: number;
  currentState: string;
  inputSymbol?: string;
  consumedInput: string[];
  remainingInput: string[];
  emittedOutput?: string;
  cumulativeOutput: string[];
  nextState?: string;
  transitionDescription?: string;
}

export interface SimulationTrace {
  machineType: 'mealy' | 'moore';
  inputSequence: string[];
  outputSequence: string[];
  visitedStates: string[];
  steps: SimulationStepRecord[];
  finalState: string;
  initialOutput?: string; // Moore initial output at t=0
}

export interface OutputAlignmentResult {
  isMatch: boolean;
  mealyOutput: string[];
  mooreOutput: string[];
  alignedMooreOutput: string[];
  initialMooreOutput?: string;
  explanation: string;
}

export interface Counterexample {
  inputSequence: string[];
  outputA: string[];
  outputB: string[];
  firstMismatchIndex: number;
}

export interface BoundedEquivalenceResult {
  isEquivalent: boolean;
  method: 'bounded_exhaustive';
  maxDepth: number;
  checkedSequencesCount: number;
  counterexample?: Counterexample;
  explanation: string;
}

export interface ProductMachineEquivalenceResult {
  isEquivalent: boolean;
  method: 'product_machine';
  reachablePairsCount: number;
  totalPairSpaceSize: number;
  counterexample?: Counterexample;
  explanation: string;
}

export type EquivalenceResult = BoundedEquivalenceResult | ProductMachineEquivalenceResult;

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  path?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  isComplete: boolean;
  isDeterministic: boolean;
  issues: ValidationIssue[];
  unreachableStates: string[];
}
