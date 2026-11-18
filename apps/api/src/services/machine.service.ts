import { randomUUID } from 'node:crypto';
import type { AnyMachine, SavedMachineEntity } from '@automatalab/contracts';
import { machineRepository, MachineRepository } from '../repositories/machine.repository.js';
import type { MachineRecord } from '../db/schema.js';

export class MachineService {
  constructor(private readonly repo: MachineRepository = machineRepository) {}

  async listMachines(filter?: { type?: 'mealy' | 'moore' }): Promise<SavedMachineEntity[]> {
    const records = await this.repo.findAll(filter);
    return records.map(this.mapRecordToEntity);
  }

  async getMachineById(id: string): Promise<SavedMachineEntity | null> {
    const record = await this.repo.findById(id);
    if (!record) return null;
    return this.mapRecordToEntity(record);
  }

  async saveMachine(machine: AnyMachine, description?: string): Promise<SavedMachineEntity> {
    const record = await this.repo.createWithRelations(machine, description);
    return this.mapRecordToEntity(record);
  }

  async updateMachine(
    id: string,
    machine: AnyMachine,
    description?: string
  ): Promise<SavedMachineEntity | null> {
    const record = await this.repo.updateWithRelations(id, machine, description);
    if (!record) return null;
    return this.mapRecordToEntity(record);
  }

  async deleteMachine(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  private mapRecordToEntity(record: MachineRecord): SavedMachineEntity {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      type: record.type,
      machineData: (typeof record.machineData === 'string'
        ? JSON.parse(record.machineData)
        : record.machineData) as AnyMachine,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}

export const machineService = new MachineService();
