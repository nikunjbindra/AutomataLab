import { randomUUID } from 'node:crypto';
import { eq, desc, and } from 'drizzle-orm';
import { db as defaultDb } from '../db/index.js';
import {
  machines,
  states,
  transitions,
  MachineRecord,
  StateRecord,
  TransitionRecord,
} from '../db/schema.js';
import type { AnyMachine } from '@automatalab/contracts';

export class MachineRepository {
  constructor(private readonly database = defaultDb) {}

  async findAll(filter?: { type?: 'mealy' | 'moore' }): Promise<MachineRecord[]> {
    if (filter?.type) {
      return this.database
        .select()
        .from(machines)
        .where(eq(machines.type, filter.type))
        .orderBy(desc(machines.updatedAt));
    }
    return this.database.select().from(machines).orderBy(desc(machines.updatedAt));
  }

  async findById(id: string): Promise<MachineRecord | undefined> {
    const records = await this.database.select().from(machines).where(eq(machines.id, id));
    return records[0];
  }

  async findStatesByMachineId(machineId: string): Promise<StateRecord[]> {
    return this.database.select().from(states).where(eq(states.machineId, machineId));
  }

  async findTransitionsByMachineId(machineId: string): Promise<TransitionRecord[]> {
    return this.database.select().from(transitions).where(eq(transitions.machineId, machineId));
  }

  /**
   * Transactionally saves a complete machine definition with its states and transitions.
   */
  async createWithRelations(
    machine: AnyMachine,
    description?: string,
    customId?: string
  ): Promise<MachineRecord> {
    const machineId = customId || machine.id || randomUUID();
    const now = new Date();

    return this.database.transaction(async (tx) => {
      // 1. Insert machine record
      await tx.insert(machines).values({
        id: machineId,
        name: machine.name,
        description: description ?? machine.description ?? null,
        type: machine.type,
        initialState: machine.initialState,
        alphabet: machine.alphabet,
        outputAlphabet: machine.outputAlphabet,
        machineData: machine,
        createdAt: now,
        updatedAt: now,
      });

      // 2. Insert state records
      for (const stateName of machine.states) {
        const isInitial = stateName === machine.initialState;
        const output = machine.type === 'moore' ? machine.stateOutputs[stateName] ?? null : null;

        await tx.insert(states).values({
          id: randomUUID(),
          machineId,
          name: stateName,
          output,
          isInitial,
          createdAt: now,
        });
      }

      // 3. Insert transition records
      if (machine.type === 'mealy') {
        for (const t of machine.transitions) {
          await tx.insert(transitions).values({
            id: randomUUID(),
            machineId,
            fromState: t.fromState,
            inputSymbol: t.inputSymbol,
            toState: t.toState,
            outputSymbol: t.outputSymbol,
            createdAt: now,
          });
        }
      } else {
        for (const t of machine.transitions) {
          await tx.insert(transitions).values({
            id: randomUUID(),
            machineId,
            fromState: t.fromState,
            inputSymbol: t.inputSymbol,
            toState: t.toState,
            outputSymbol: null,
            createdAt: now,
          });
        }
      }

      const created = await tx.select().from(machines).where(eq(machines.id, machineId));
      if (!created[0]) {
        throw new Error(`Failed to retrieve newly created machine ${machineId}`);
      }
      return created[0];
    });
  }

  /**
   * Transactionally updates an existing machine definition and refreshes its relations.
   */
  async updateWithRelations(
    id: string,
    machine: AnyMachine,
    description?: string
  ): Promise<MachineRecord | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const now = new Date();

    return this.database.transaction(async (tx) => {
      // 1. Update root machine
      await tx
        .update(machines)
        .set({
          name: machine.name,
          description: description ?? machine.description ?? existing.description,
          type: machine.type,
          initialState: machine.initialState,
          alphabet: machine.alphabet,
          outputAlphabet: machine.outputAlphabet,
          machineData: machine,
          updatedAt: now,
        })
        .where(eq(machines.id, id));

      // 2. Refresh states (delete and re-insert)
      await tx.delete(states).where(eq(states.machineId, id));
      for (const stateName of machine.states) {
        const isInitial = stateName === machine.initialState;
        const output = machine.type === 'moore' ? machine.stateOutputs[stateName] ?? null : null;

        await tx.insert(states).values({
          id: randomUUID(),
          machineId: id,
          name: stateName,
          output,
          isInitial,
          createdAt: now,
        });
      }

      // 3. Refresh transitions
      await tx.delete(transitions).where(eq(transitions.machineId, id));
      if (machine.type === 'mealy') {
        for (const t of machine.transitions) {
          await tx.insert(transitions).values({
            id: randomUUID(),
            machineId: id,
            fromState: t.fromState,
            inputSymbol: t.inputSymbol,
            toState: t.toState,
            outputSymbol: t.outputSymbol,
            createdAt: now,
          });
        }
      } else {
        for (const t of machine.transitions) {
          await tx.insert(transitions).values({
            id: randomUUID(),
            machineId: id,
            fromState: t.fromState,
            inputSymbol: t.inputSymbol,
            toState: t.toState,
            outputSymbol: null,
            createdAt: now,
          });
        }
      }

      const updated = await tx.select().from(machines).where(eq(machines.id, id));
      return updated[0] ?? null;
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(machines).where(eq(machines.id, id));
    return (result.rowsAffected ?? 0) > 0;
  }
}

export const machineRepository = new MachineRepository();
