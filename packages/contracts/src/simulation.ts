import { z } from 'zod';
import { AnyMachineSchema } from './machine.js';

export const SimulationStepSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  currentState: z.string(),
  inputSymbol: z.string().optional(),
  consumedInput: z.string(),
  remainingInput: z.string(),
  emittedOutput: z.string().optional(),
  cumulativeOutput: z.string(),
  nextState: z.string().optional(),
  activeTransitionId: z.string().optional(),
});
export type SimulationStep = z.infer<typeof SimulationStepSchema>;

export const SimulationRequestSchema = z.object({
  machine: AnyMachineSchema,
  inputString: z.string().default(''),
});
export type SimulationRequest = z.infer<typeof SimulationRequestSchema>;

export const SimulationResponseSchema = z.object({
  machineId: z.string().optional(),
  machineType: z.enum(['mealy', 'moore']),
  inputTape: z.string(),
  outputTape: z.string(),
  initialOutput: z.string().optional(), // For Moore machines
  steps: z.array(SimulationStepSchema),
  finalState: z.string(),
  isValid: z.boolean(),
  error: z.string().optional(),
});
export type SimulationResponse = z.infer<typeof SimulationResponseSchema>;
