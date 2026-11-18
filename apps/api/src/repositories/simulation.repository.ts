import { eq, desc } from 'drizzle-orm';
import { db as defaultDb } from '../db/index.js';
import { simulationRuns, SimulationRunRecord, InsertSimulationRunRecord } from '../db/schema.js';

export class SimulationRepository {
  constructor(private readonly database = defaultDb) {}

  async create(record: InsertSimulationRunRecord): Promise<SimulationRunRecord> {
    await this.database.insert(simulationRuns).values(record);
    const created = await this.findById(record.id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created simulation run ${record.id}`);
    }
    return created;
  }

  async findAll(limit = 50): Promise<SimulationRunRecord[]> {
    return this.database
      .select()
      .from(simulationRuns)
      .orderBy(desc(simulationRuns.createdAt))
      .limit(limit);
  }

  async findById(id: string): Promise<SimulationRunRecord | undefined> {
    const records = await this.database
      .select()
      .from(simulationRuns)
      .where(eq(simulationRuns.id, id));
    return records[0];
  }
}

export const simulationRepository = new SimulationRepository();
