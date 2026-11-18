import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL || 'file:./automata.db';

export const client = createClient({
  url,
});

export const db = drizzle(client, { schema });

/**
 * Initializes database tables if migrations have not yet been applied.
 */
export async function initDb(): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      machine_data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS conversion_history (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL,
      target_type TEXT NOT NULL,
      source_machine_data TEXT NOT NULL,
      result_machine_data TEXT NOT NULL,
      steps_data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}
