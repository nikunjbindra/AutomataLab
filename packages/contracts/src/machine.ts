import { z } from 'zod';

export const MachineTypeSchema = z.enum(['mealy', 'moore']);
export type MachineType = z.infer<typeof MachineTypeSchema>;

export const StateIdSchema = z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/, {
  message: 'State identifier must contain only alphanumeric characters, underscores, or hyphens',
});

export const SymbolSchema = z.string().min(1).max(10);

// Mealy Machine Schemas
export const MealyTransitionSchema = z.object({
  fromState: StateIdSchema,
  inputSymbol: SymbolSchema,
  toState: StateIdSchema,
  outputSymbol: SymbolSchema,
});
export type MealyTransition = z.infer<typeof MealyTransitionSchema>;

export const MealyMachineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).default('Untitled Mealy Machine'),
  description: z.string().optional(),
  type: z.literal('mealy'),
  states: z.array(StateIdSchema).min(1),
  alphabet: z.array(SymbolSchema).min(1),
  outputAlphabet: z.array(SymbolSchema).min(1),
  initialState: StateIdSchema,
  transitions: z.array(MealyTransitionSchema),
}).refine((data) => data.states.includes(data.initialState), {
  message: 'Initial state must be included in the states list',
  path: ['initialState'],
});
export type MealyMachine = z.infer<typeof MealyMachineSchema>;

// Moore Machine Schemas
export const MooreTransitionSchema = z.object({
  fromState: StateIdSchema,
  inputSymbol: SymbolSchema,
  toState: StateIdSchema,
});
export type MooreTransition = z.infer<typeof MooreTransitionSchema>;

export const MooreMachineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).default('Untitled Moore Machine'),
  description: z.string().optional(),
  type: z.literal('moore'),
  states: z.array(StateIdSchema).min(1),
  alphabet: z.array(SymbolSchema).min(1),
  outputAlphabet: z.array(SymbolSchema).min(1),
  initialState: StateIdSchema,
  transitions: z.array(MooreTransitionSchema),
  stateOutputs: z.record(StateIdSchema, SymbolSchema),
}).refine((data) => data.states.includes(data.initialState), {
  message: 'Initial state must be included in the states list',
  path: ['initialState'],
}).refine((data) => data.states.every((s) => s in data.stateOutputs), {
  message: 'All states must have an associated output symbol',
  path: ['stateOutputs'],
});
export type MooreMachine = z.infer<typeof MooreMachineSchema>;

// Universal Machine Union
export const AnyMachineSchema = z.union([
  MealyMachineSchema,
  MooreMachineSchema,
]);
export type AnyMachine = z.infer<typeof AnyMachineSchema>;
