/**
 * Vitest global setup — runs once in the main process before any test workers start.
 * Sets the DATABASE_URL environment variable to the test database path so that
 * the lazy database singleton (created when first accessed) uses the correct file.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB_PATH = path.resolve(__dirname, '..', 'test_integration.db');

export function setup() {
  process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;
  // Clean up any leftover test DB from a previous interrupted run
  for (const suffix of ['', '-wal', '-shm']) {
    const p = `${TEST_DB_PATH}${suffix}`;
    if (fs.existsSync(p)) {
      try { fs.unlinkSync(p); } catch {}
    }
  }
}

export function teardown() {
  // Clean up test database files after all tests complete
  for (const suffix of ['', '-wal', '-shm']) {
    const p = `${TEST_DB_PATH}${suffix}`;
    if (fs.existsSync(p)) {
      try { fs.unlinkSync(p); } catch {}
    }
  }
}
