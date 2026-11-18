import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { machines, MachineRecord, InsertMachineRecord } from '../db/schema.js';

export class MachineRepository {
  async findAll(): Promise<MachineRecord[]> {
    return db.select().from(machines).orderBy(desc(machines.updatedAt));
  }

  async findById(id: string): Promise<MachineRecord | undefined> {
    const records = await db.select().from(machines).where(eq(machines.id, id));
    return records[0];
  }

  async create(record: InsertMachineRecord): Promise<MachineRecord> {
    await db.insert(machines).values(record);
    const created = await this.findById(record.id);
    if (!created) {
      throw new Error(`Failed to retrieve newly inserted machine: ${record.id}`);
    }
    return created;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(machines).where(eq(machines.id, id));
    return (result.rowsAffected ?? 0) > 0;
  }
}

export const machineRepository = new MachineRepository();
