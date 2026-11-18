import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const machines = sqliteTable('machines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['mealy', 'moore'] }).notNull(),
  machineData: text('machine_data', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const conversionHistory = sqliteTable('conversion_history', {
  id: text('id').primaryKey(),
  sourceType: text('source_type', { enum: ['mealy', 'moore'] }).notNull(),
  targetType: text('target_type', { enum: ['mealy', 'moore'] }).notNull(),
  sourceMachineData: text('source_machine_data', { mode: 'json' }).notNull(),
  resultMachineData: text('result_machine_data', { mode: 'json' }).notNull(),
  stepsData: text('steps_data', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type MachineRecord = typeof machines.$inferSelect;
export type InsertMachineRecord = typeof machines.$inferInsert;
export type ConversionHistoryRecord = typeof conversionHistory.$inferSelect;
export type InsertConversionHistoryRecord = typeof conversionHistory.$inferInsert;
