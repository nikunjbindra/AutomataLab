import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run each test file in a separate worker process so that
    // process.env mutations (e.g. DATABASE_URL for test isolation)
    // are applied before any module-level code executes.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Global setup runs once in the main process before any test workers,
    // setting DATABASE_URL to the test database before any module imports.
    globalSetup: ['./src/__tests__/globalSetup.ts'],
  },
});
