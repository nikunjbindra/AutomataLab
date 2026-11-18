import { eq, desc } from 'drizzle-orm';
import { db as defaultDb } from '../db/index.js';
import { testCases, TestCaseRecord, InsertTestCaseRecord } from '../db/schema.js';

export class TestCaseRepository {
  constructor(private readonly database = defaultDb) {}

  async create(record: InsertTestCaseRecord): Promise<TestCaseRecord> {
    await this.database.insert(testCases).values(record);
    const created = await this.database
      .select()
      .from(testCases)
      .where(eq(testCases.id, record.id));
    if (!created[0]) {
      throw new Error(`Failed to retrieve newly created test case ${record.id}`);
    }
    return created[0];
  }

  async findByMachineId(machineId: string): Promise<TestCaseRecord[]> {
    return this.database
      .select()
      .from(testCases)
      .where(eq(testCases.machineId, machineId))
      .orderBy(desc(testCases.createdAt));
  }
}

export const testCaseRepository = new TestCaseRepository();
