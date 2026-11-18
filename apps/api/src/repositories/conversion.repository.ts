import { eq, desc } from 'drizzle-orm';
import { db as defaultDb } from '../db/index.js';
import { conversionRuns, ConversionRunRecord, InsertConversionRunRecord } from '../db/schema.js';

export class ConversionRepository {
  constructor(private readonly database = defaultDb) {}

  async create(record: InsertConversionRunRecord): Promise<ConversionRunRecord> {
    await this.database.insert(conversionRuns).values(record);
    const created = await this.findById(record.id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created conversion run ${record.id}`);
    }
    return created;
  }

  async findAll(limit = 50): Promise<ConversionRunRecord[]> {
    return this.database
      .select()
      .from(conversionRuns)
      .orderBy(desc(conversionRuns.createdAt))
      .limit(limit);
  }

  async findById(id: string): Promise<ConversionRunRecord | undefined> {
    const records = await this.database
      .select()
      .from(conversionRuns)
      .where(eq(conversionRuns.id, id));
    return records[0];
  }
}

export const conversionRepository = new ConversionRepository();
