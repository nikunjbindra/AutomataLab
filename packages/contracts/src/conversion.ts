import { z } from 'zod';
import { MealyMachineSchema, MooreMachineSchema, AnyMachineSchema } from './machine.js';

export const ConversionStepTypeSchema = z.enum([
  'analyze_outputs',
  'split_states',
  'wire_transitions',
  'fold_outputs',
  'remove_unreachable',
  'complete',
]);
export type ConversionStepType = z.infer<typeof ConversionStepTypeSchema>;

export const ConversionStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  type: ConversionStepTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  mathematicalReason: z.string().optional(),
  intermediateStateMap: z.record(z.string(), z.array(z.string())).optional(),
  highlightNodes: z.array(z.string()).optional(),
  highlightEdges: z.array(z.string()).optional(),
});
export type ConversionStep = z.infer<typeof ConversionStepSchema>;

export const ConversionRequestSchema = z.object({
  sourceMachine: AnyMachineSchema,
  targetType: z.enum(['mealy', 'moore']),
  options: z.object({
    minimize: z.boolean().default(false),
    removeUnreachable: z.boolean().default(true),
  }).default({}),
});
export type ConversionRequest = z.infer<typeof ConversionRequestSchema>;

export const ConversionResponseSchema = z.object({
  success: z.boolean(),
  sourceType: z.enum(['mealy', 'moore']),
  targetType: z.enum(['mealy', 'moore']),
  resultMachine: AnyMachineSchema,
  steps: z.array(ConversionStepSchema),
  metrics: z.object({
    sourceStateCount: z.number().int(),
    resultStateCount: z.number().int(),
    sourceTransitionCount: z.number().int(),
    resultTransitionCount: z.number().int(),
    executionTimeMs: z.number(),
  }),
});
export type ConversionResponse = z.infer<typeof ConversionResponseSchema>;

export const EquivalenceRequestSchema = z.object({
  machineA: AnyMachineSchema,
  machineB: AnyMachineSchema,
  maxCheckLength: z.number().int().min(1).max(50).default(15),
});
export type EquivalenceRequest = z.infer<typeof EquivalenceRequestSchema>;

export const EquivalenceResponseSchema = z.object({
  isEquivalent: z.boolean(),
  checkedStatesCount: z.number().int(),
  counterexample: z.object({
    inputString: z.string(),
    outputA: z.string(),
    outputB: z.string(),
  }).optional(),
  explanation: z.string(),
});
export type EquivalenceResponse = z.infer<typeof EquivalenceResponseSchema>;
