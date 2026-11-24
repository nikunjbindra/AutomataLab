import { createClient, Client } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';

dotenv.config();

function databaseUrl(): string {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  if (process.env.VERCEL && (!url || !/^(libsql|https):\/\//.test(url))) {
    throw new Error('A hosted database URL is required on Vercel.');
  }
  return url || 'file:./automata.db';
}

export function createDatabaseConnection(url: string = databaseUrl()): {
  client: Client;
  db: LibSQLDatabase<typeof schema>;
  initDb: () => Promise<void>;
} {
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_AUTH_TOKEN });
  const db = drizzle(client, { schema });

  const initDb = async (): Promise<void> => {
    // Enable foreign keys in SQLite
    await client.execute('PRAGMA foreign_keys = ON;');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS machines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        initial_state TEXT NOT NULL DEFAULT '',
        alphabet TEXT NOT NULL DEFAULT '[]',
        output_alphabet TEXT NOT NULL DEFAULT '[]',
        machine_data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Ensure columns exist if table was created in an earlier phase
    try {
      await client.execute('ALTER TABLE machines ADD COLUMN initial_state TEXT NOT NULL DEFAULT "";');
    } catch {
      // Column already exists
    }
    try {
      await client.execute('ALTER TABLE machines ADD COLUMN alphabet TEXT NOT NULL DEFAULT "[]";');
    } catch {
      // Column already exists
    }
    try {
      await client.execute('ALTER TABLE machines ADD COLUMN output_alphabet TEXT NOT NULL DEFAULT "[]";');
    } catch {
      // Column already exists
    }

    await client.execute(`
      CREATE TABLE IF NOT EXISTS states (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        name TEXT NOT NULL,
        output TEXT,
        is_initial INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
      );
    `);

    await client.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS states_machine_name_idx ON states(machine_id, name);
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS transitions (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        from_state TEXT NOT NULL,
        input_symbol TEXT NOT NULL,
        to_state TEXT NOT NULL,
        output_symbol TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
      );
    `);

    await client.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS transitions_machine_from_input_idx ON transitions(machine_id, from_state, input_symbol);
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS conversion_runs (
        id TEXT PRIMARY KEY,
        source_machine_id TEXT,
        result_machine_id TEXT,
        source_type TEXT NOT NULL,
        target_type TEXT NOT NULL,
        source_machine_data TEXT NOT NULL,
        result_machine_data TEXT NOT NULL,
        steps_data TEXT NOT NULL,
        metrics TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (source_machine_id) REFERENCES machines(id) ON DELETE SET NULL,
        FOREIGN KEY (result_machine_id) REFERENCES machines(id) ON DELETE SET NULL
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS test_cases (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        input_sequence TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS simulation_runs (
        id TEXT PRIMARY KEY,
        machine_id TEXT,
        machine_type TEXT NOT NULL,
        input_sequence TEXT NOT NULL,
        output_sequence TEXT NOT NULL,
        trace_data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL
      );
    `);
  };

  return { client, db, initDb };
}

// Global default singleton — lazily initialized on first use so that
// environment variables (e.g. DATABASE_URL set by tests via globalSetup) are
// respected before any database connection is opened.
let _conn: ReturnType<typeof createDatabaseConnection> | null = null;

function getConn(): ReturnType<typeof createDatabaseConnection> {
  if (!_conn) {
    _conn = createDatabaseConnection();
  }
  return _conn;
}

/** Reset the global singleton (used by tests to force a fresh connection). */
export function resetDatabaseConnection(): void {
  _conn = null;
}

// Export proxied accessors so that repositories importing `db` and `client`
// at module level always get the *current* singleton's instances.
// Using a Proxy means the actual DB object is resolved at call-time, not
// at the time the `import` statement is evaluated.

type ConnClient = ReturnType<typeof createDatabaseConnection>['client'];
type ConnDb = ReturnType<typeof createDatabaseConnection>['db'];

export const client: ConnClient = new Proxy({} as ConnClient, {
  get(_t, prop) {
    return Reflect.get(getConn().client, prop, getConn().client);
  },
  apply(_t, _this, args) {
    return Reflect.apply(getConn().client as unknown as Function, _this, args);
  },
});

export const db: ConnDb = new Proxy({} as ConnDb, {
  get(_t, prop) {
    return Reflect.get(getConn().db, prop, getConn().db);
  },
  apply(_t, _this, args) {
    return Reflect.apply(getConn().db as unknown as Function, _this, args);
  },
});

export function initDb(): Promise<void> {
  return getConn().initDb();
}
