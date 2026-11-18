import { z } from 'zod';
import { AnyMachineSchema } from './machine.js';

export const ApiHealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  version: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
});
export type ApiHealthResponse = z.infer<typeof ApiHealthResponseSchema>;

export const ApiErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.unknown().optional(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export const SavedMachineEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  type: z.enum(['mealy', 'moore']),
  machineData: AnyMachineSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SavedMachineEntity = z.infer<typeof SavedMachineEntitySchema>;
