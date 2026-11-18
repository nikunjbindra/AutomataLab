# AutomataLab — Phase 2 Report
## Backend, Database, and REST API Integration

**Date:** November 2026  
**Phase:** 2 of 4  
**Status:** ✅ Complete

---

## 1. Overview

Phase 2 implemented the full backend stack for AutomataLab: a 6-table SQLite database with Drizzle ORM, a layered service architecture (controllers → services → repositories), and a complete REST API with 18 endpoints and 12 Supertest integration tests.

All Phase 0 (monorepo structure) and Phase 1 (automata conversion engine) functionality was preserved without modification.

---

## 2. Files Created or Modified

### New Files

| File | Description |
|------|-------------|
| `apps/api/src/db/schema.ts` | Drizzle ORM schema — 6 tables with foreign keys and unique indexes |
| `apps/api/src/db/index.ts` | Lazy singleton database connection factory with Proxy exports |
| `apps/api/src/db/seed.ts` | Seeds 4 preset machines: Task6 Mealy, Parity Mealy, Parity Moore, Sequence 101 |
| `apps/api/drizzle/0000_wakeful_hellcat.sql` | Generated Drizzle migration for all 6 tables |
| `apps/api/src/repositories/machine.repository.ts` | Transactional CRUD for machines, states, transitions |
| `apps/api/src/repositories/conversion.repository.ts` | Conversion run persistence |
| `apps/api/src/repositories/simulation.repository.ts` | Simulation run persistence |
| `apps/api/src/repositories/test-case.repository.ts` | Test case persistence per machine |
| `apps/api/src/services/machine.service.ts` | Machine CRUD business logic |
| `apps/api/src/services/conversion.service.ts` | Mealy↔Moore conversion, equivalence verification, history |
| `apps/api/src/services/simulation.service.ts` | Machine simulation with trace recording |
| `apps/api/src/services/validation.service.ts` | Delegates to pure automata validator |
| `apps/api/src/controllers/machine.controller.ts` | HTTP handlers for machine CRUD |
| `apps/api/src/controllers/conversion.controller.ts` | HTTP handlers for conversion, equivalence |
| `apps/api/src/controllers/simulation.controller.ts` | HTTP handlers for simulation |
| `apps/api/src/controllers/validation.controller.ts` | HTTP handler for validation |
| `apps/api/src/controllers/health.controller.ts` | Health check handler |
| `apps/api/src/routes/api.router.ts` | Unified Express router for all 18 endpoints |
| `apps/api/src/middleware/error.middleware.ts` | Global error handler with MALFORMED_JSON detection |
| `apps/api/src/__tests__/api.test.ts` | 12 Supertest integration tests |
| `apps/api/src/__tests__/globalSetup.ts` | Vitest global setup: sets DATABASE_URL to test DB before any module loads |
| `apps/api/vitest.config.ts` | API-specific Vitest config with `pool: forks` and globalSetup |
| `docs/API.md` | Full REST API reference documentation |
| `docs/DATABASE.md` | Database schema, ER diagram, migration commands |

### Modified Files

| File | Change |
|------|--------|
| `apps/api/package.json` | Added `db:seed` script |
| `package.json` (root) | Added `db:seed` workspace script |

---

## 3. Database Schema

Six tables were created with foreign keys, unique constraints, and UUID primary keys:

```
machines
  id TEXT PK
  name TEXT
  description TEXT
  type TEXT ('mealy'|'moore')
  initial_state TEXT
  alphabet TEXT (JSON array)
  output_alphabet TEXT (JSON array)
  machine_data TEXT (full JSON)
  created_at INTEGER
  updated_at INTEGER

states
  id TEXT PK
  machine_id TEXT FK→machines(id) ON DELETE CASCADE
  name TEXT
  output TEXT
  is_initial INTEGER
  created_at INTEGER
  UNIQUE(machine_id, name)

transitions
  id TEXT PK
  machine_id TEXT FK→machines(id) ON DELETE CASCADE
  from_state TEXT
  input_symbol TEXT
  to_state TEXT
  output_symbol TEXT
  created_at INTEGER
  UNIQUE(machine_id, from_state, input_symbol)

conversion_runs
  id TEXT PK
  source_machine_id TEXT FK→machines(id) ON DELETE SET NULL
  result_machine_id TEXT FK→machines(id) ON DELETE SET NULL
  source_type TEXT
  target_type TEXT
  source_machine_data TEXT (JSON)
  result_machine_data TEXT (JSON)
  steps_data TEXT (JSON)
  metrics TEXT (JSON)
  created_at INTEGER

test_cases
  id TEXT PK
  machine_id TEXT FK→machines(id) ON DELETE CASCADE
  name TEXT
  description TEXT
  input_sequence TEXT
  expected_output TEXT
  created_at INTEGER

simulation_runs
  id TEXT PK
  machine_id TEXT FK→machines(id) ON DELETE SET NULL
  machine_type TEXT
  input_sequence TEXT
  output_sequence TEXT
  trace_data TEXT (JSON)
  created_at INTEGER
```

### Migration Commands

```bash
npm run db:generate --workspace=@automatalab/api  # Generate Drizzle migration SQL
npm run db:migrate --workspace=@automatalab/api   # Apply migration to database
npm run db:seed --workspace=@automatalab/api       # Insert preset machines
```

---

## 4. API Endpoints Implemented

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/machines` | List machines (optional `?type=` filter) |
| GET | `/api/machines/:id` | Get machine by ID |
| POST | `/api/machines` | Create machine |
| PUT | `/api/machines/:id` | Update machine (full replace, transactional) |
| DELETE | `/api/machines/:id` | Delete machine + cascade |
| POST | `/api/conversions` | Convert machine (generic) |
| GET | `/api/conversions` | List conversion history |
| GET | `/api/conversions/:id` | Get conversion run by ID |
| POST | `/api/convert/mealy-to-moore` | Convert Mealy → Moore (alias) |
| POST | `/api/convert/moore-to-mealy` | Convert Moore → Mealy (alias) |
| POST | `/api/simulations` | Simulate machine |
| GET | `/api/simulations` | List simulation history |
| GET | `/api/simulations/:id` | Get simulation run by ID |
| POST | `/api/simulate` | Simulate machine (alias) |
| POST | `/api/validations` | Validate machine definition |
| POST | `/api/verify-equivalence` | Verify equivalence (product machine + bounded) |
| POST | `/api/verifications` | Verify equivalence (alias) |

---

## 5. Test Results

### Actual Terminal Output

```
> automatalab-monorepo@0.1.0 test

> @automatalab/automata@0.1.0 test
  ✓ src/__tests__/automata.test.ts (3 tests)
  ✓ src/__tests__/mandatory-example.test.ts (5 tests)
  ✓ src/__tests__/conversion-and-simulation.test.ts (13 tests)
  Test Files  3 passed (3)
  Tests       21 passed (21)

> @automatalab/contracts@0.1.0 test
  ✓ src/__tests__/contracts.test.ts (5 tests)
  Test Files  1 passed (1)
  Tests       5 passed (5)

> @automatalab/api@0.1.0 test
  ✓ AutomataLab REST API & Persistence Integration Test Suite
     ✓ 1. GET /api/health returns 200 and health metadata
     ✓ 2. POST /api/machines creates and persists a valid Mealy machine
     ✓ 3. GET /api/machines/:id retrieves the persisted machine
     ✓ 4. PUT /api/machines/:id updates an existing machine definition
     ✓ 5. DELETE /api/machines/:id deletes a machine and cascades cleanup
     ✓ 6. POST /api/conversions converts Mealy to Moore and generates all 5 states
     ✓ 7. POST /api/convert/moore-to-mealy folds outputs onto transitions
     ✓ 8. POST /api/simulations simulates input 1100 producing output yxyx
     ✓ 9. POST /api/verify-equivalence proves behavioral equivalence and detects differences
     ✓ 10. Rejects invalid requests with appropriate 400 status and structured JSON
     ✓ 11. GET /api/conversions records and retrieves conversion runs
     ✓ 12. Enforces relational persistence across machines, states, and transitions tables
  Test Files  1 passed (1)
  Tests       12 passed (12)

> @automatalab/web@0.1.0 test
  ✓ src/__tests__/app.test.ts (1 test)
  Test Files  1 passed (1)
  Tests       1 passed (1)

TOTAL: 39 tests, 0 failures
```

### Integration Test Coverage

| Test | Scenario | Result |
|------|----------|--------|
| 1 | `GET /api/health` → 200 + `status: ok` | ✅ |
| 2 | `POST /api/machines` creates Mealy machine → 201 | ✅ |
| 3 | `GET /api/machines/:id` retrieves states + transitions | ✅ |
| 4 | `PUT /api/machines/:id` updates name and description | ✅ |
| 5 | `DELETE /api/machines/:id` → 200; subsequent GET → 404 | ✅ |
| 6 | `POST /api/conversions` Mealy→Moore generates S, A_x, A_y, B_x, B_y | ✅ |
| 7 | `POST /api/convert/moore-to-mealy` folds state outputs onto transitions | ✅ |
| 8 | `POST /api/simulations` input `1100` → output `yxyx` | ✅ |
| 9 | `POST /api/verify-equivalence` proves equivalence; detects non-equivalence at `0` | ✅ |
| 10 | Rejects bad initialState (400 VALIDATION_ERROR), unknown ID (404 NOT_FOUND), malformed JSON (400 MALFORMED_JSON) | ✅ |
| 11 | `GET /api/conversions` lists history; `GET /api/conversions/:id` retrieves single run | ✅ |
| 12 | Verifies relational persistence: 2 states, 4 transitions; cascade delete confirmed | ✅ |

---

## 6. Typecheck and Build Results

### Typecheck

```
> npm run typecheck
> @automatalab/automata: tsc --noEmit   ✓
> @automatalab/contracts: tsc --noEmit  ✓
> @automatalab/api: tsc --noEmit        ✓
> @automatalab/web: tsc --noEmit        ✓
Exit code: 0 — 0 TypeScript errors
```

### Build

```
> npm run build
> @automatalab/contracts: tsc -b     ✓
> @automatalab/automata: tsc -b      ✓
> @automatalab/api: tsc              ✓
> @automatalab/web: tsc && vite build
  ✓ 1592 modules transformed
  dist/index.html                   0.93 kB
  dist/assets/index-*.css           14.17 kB
  dist/assets/index-*.js            241.36 kB
  Built in 4.62s
Exit code: 0 — all workspaces built successfully
```

---

## 7. Architecture Overview

```
HTTP Request
     │
     ▼
Express Router (/api/*)
     │
     ▼
Controller Layer          ← HTTP parsing, status codes, response shaping
     │
     ▼
Service Layer             ← Business logic, calls pure automata algorithms
     │                    ← Saves history to database
     ├──────────────────► packages/automata  (pure TS — no Express, no Drizzle)
     │
     ▼
Repository Layer          ← SQL queries via Drizzle ORM (transactional)
     │
     ▼
SQLite (libsql)           ← 6 tables, foreign keys, unique constraints
```

**Key invariants upheld:**
- Pure automata algorithms in `packages/automata` have zero Express or Drizzle imports
- All external input is validated with shared Zod schemas from `packages/contracts`
- Controllers never execute SQL directly
- Machine create/update use transactions: all states + transitions or none

---

## 8. Known Issues

None. All 39 tests pass, typecheck is clean, and the full monorepo builds successfully.

---

## 9. Technical Decisions

### Lazy DB Singleton with Proxy
The `db` and `client` exports from `apps/api/src/db/index.ts` use a lazy singleton pattern with JavaScript `Proxy` objects. This ensures the database connection is not opened until the first query executes, allowing tests to set `DATABASE_URL` before the connection is established. Combined with the vitest `pool: forks` configuration and a global setup file, test isolation is guaranteed without polluting the development database.

### Test Database Isolation
The API test suite uses a separate `test_integration.db` file (set via `DATABASE_URL` environment variable in `globalSetup.ts`). The setup removes any stale test database before tests run; teardown removes it afterwards.

### Conversion of Unsaved Machines
Conversion, simulation, and validation endpoints accept inline machine definitions — machines do not need to be saved first. The `sourceMachineId` / `resultMachineId` foreign keys in `conversion_runs` are set to `NULL` when the machines are not in the database.

---

## 10. Next Steps (Phase 3)

Phase 3 will implement the interactive React frontend:
- Automata canvas using `@xyflow/react`
- Interactive transition table editor
- Step-by-step conversion visualizer
- Simulation stepper with animated state highlighting
- Export to PNG/JSON

> Do not begin Phase 3 without an explicit continuation prompt.
