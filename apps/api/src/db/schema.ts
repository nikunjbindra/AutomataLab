import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const machines = sqliteTable('machines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['mealy', 'moore'] }).notNull(),
  initialState: text('initial_state').notNull(),
  alphabet: text('alphabet', { mode: 'json' }).$type<string[]>().notNull(),
  outputAlphabet: text('output_alphabet', { mode: 'json' }).$type<string[]>().notNull(),
  machineData: text('machine_data', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const states = sqliteTable(
  'states',
  {
    id: text('id').primaryKey(),
    machineId: text('machine_id')
      .notNull()
      .references(() => machines.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    output: text('output'), // For Moore machines; null for Mealy
    isInitial: integer('is_initial', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    machineStateUnique: uniqueIndex('states_machine_name_idx').on(table.machineId, table.name),
  })
);

export const transitions = sqliteTable(
  'transitions',
  {
    id: text('id').primaryKey(),
    machineId: text('machine_id')
      .notNull()
      .references(() => machines.id, { onDelete: 'cascade' }),
    fromState: text('from_state').notNull(),
    inputSymbol: text('input_symbol').notNull(),
    toState: text('to_state').notNull(),
    outputSymbol: text('output_symbol'), // Emitted output for Mealy transitions; null for Moore
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    machineTransitionUnique: uniqueIndex('transitions_machine_from_input_idx').on(
      table.machineId,
      table.fromState,
      table.inputSymbol
    ),
  })
);

export const conversionRuns = sqliteTable('conversion_runs', {
  id: text('id').primaryKey(),
  sourceMachineId: text('source_machine_id').references(() => machines.id, { onDelete: 'set null' }),
  resultMachineId: text('result_machine_id').references(() => machines.id, { onDelete: 'set null' }),
  sourceType: text('source_type', { enum: ['mealy', 'moore'] }).notNull(),
  targetType: text('target_type', { enum: ['mealy', 'moore'] }).notNull(),
  sourceMachineData: text('source_machine_data', { mode: 'json' }).notNull(),
  resultMachineData: text('result_machine_data', { mode: 'json' }).notNull(),
  stepsData: text('steps_data', { mode: 'json' }).notNull(),
  metrics: text('metrics', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Backwards compatibility alias
export const conversionHistory = conversionRuns;

export const testCases = sqliteTable('test_cases', {
  id: text('id').primaryKey(),
  machineId: text('machine_id')
    .notNull()
    .references(() => machines.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  inputSequence: text('input_sequence', { mode: 'json' }).$type<string[]>().notNull(),
  expectedOutput: text('expected_output', { mode: 'json' }).$type<string[]>().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const simulationRuns = sqliteTable('simulation_runs', {
  id: text('id').primaryKey(),
  machineId: text('machine_id').references(() => machines.id, { onDelete: 'set null' }),
  machineType: text('machine_type', { enum: ['mealy', 'moore'] }).notNull(),
  inputSequence: text('input_sequence', { mode: 'json' }).$type<string[]>().notNull(),
  outputSequence: text('output_sequence', { mode: 'json' }).$type<string[]>().notNull(),
  traceData: text('trace_data', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Inferred TypeScript Types
export type MachineRecord = typeof machines.$inferSelect;
export type InsertMachineRecord = typeof machines.$inferInsert;

export type StateRecord = typeof states.$inferSelect;
export type InsertStateRecord = typeof states.$inferInsert;

export type TransitionRecord = typeof transitions.$inferSelect;
export type InsertTransitionRecord = typeof transitions.$inferInsert;

export type ConversionRunRecord = typeof conversionRuns.$inferSelect;
export type InsertConversionRunRecord = typeof conversionRuns.$inferInsert;

export type TestCaseRecord = typeof testCases.$inferSelect;
export type InsertTestCaseRecord = typeof testCases.$inferInsert;

export type SimulationRunRecord = typeof simulationRuns.$inferSelect;
export type InsertSimulationRunRecord = typeof simulationRuns.$inferInsert;
