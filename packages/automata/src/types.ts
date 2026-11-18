import type {
  MealyMachine,
  MooreMachine,
  ConversionStep,
} from '@automatalab/contracts';

export interface ConversionOptions {
  minimize?: boolean;
  removeUnreachable?: boolean;
}

export interface MealyToMooreResult {
  machine: MooreMachine;
  steps: ConversionStep[];
  stateMapping: Record<string, string[]>;
}

export interface MooreToMealyResult {
  machine: MealyMachine;
  steps: ConversionStep[];
}
