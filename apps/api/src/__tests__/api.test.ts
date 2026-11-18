import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from '../app.js';
import { initDb } from '../db/index.js';
import {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MOORE,
} from '@automatalab/automata';

// DATABASE_URL is set by the vitest globalSetup (src/__tests__/globalSetup.ts)
// before this module is imported, ensuring the lazy DB singleton connects to the
// test database rather than the development database.
const TEST_DB_PATH = path.resolve(process.cwd(), 'test_integration.db');

describe('AutomataLab REST API & Persistence Integration Test Suite', () => {
  const app = createApp();

  beforeAll(async () => {
    await initDb();
  });

  afterAll(async () => {
    // Test database cleanup is handled by globalSetup teardown.
    // Remove any leftover WAL/SHM files just in case.
    try {
      for (const suffix of ['', '-wal', '-shm']) {
        const p = `${TEST_DB_PATH}${suffix}`;
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    } catch {}
  });

  // 1. API Health Check
  it('1. GET /api/health returns 200 and health metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'automatalab-api');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('uptime');
  });

  let savedMachineId: string;

  // 2. Creating a Machine
  it('2. POST /api/machines creates and persists a valid Mealy machine', async () => {
    const res = await request(app)
      .post('/api/machines')
      .send(MANDATORY_TASK_6_MEALY);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe(MANDATORY_TASK_6_MEALY.name);
    expect(res.body.data.type).toBe('mealy');
    savedMachineId = res.body.data.id;
  });

  // 3. Retrieving the Saved Machine
  it('3. GET /api/machines/:id retrieves the persisted machine', async () => {
    const res = await request(app).get(`/api/machines/${savedMachineId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(savedMachineId);
    expect(res.body.data.machineData.states).toEqual(['A', 'B']);
    expect(res.body.data.machineData.transitions).toHaveLength(4);
  });

  // 4. Updating a Machine
  it('4. PUT /api/machines/:id updates an existing machine definition', async () => {
    const updatedDefinition = {
      ...MANDATORY_TASK_6_MEALY,
      name: 'Updated Task 6 Mealy Machine',
      description: 'Modified description via PUT request',
    };

    const res = await request(app)
      .put(`/api/machines/${savedMachineId}`)
      .send(updatedDefinition);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Task 6 Mealy Machine');
    expect(res.body.data.description).toBe('Modified description via PUT request');

    // Confirm update persisted
    const verifyRes = await request(app).get(`/api/machines/${savedMachineId}`);
    expect(verifyRes.body.data.name).toBe('Updated Task 6 Mealy Machine');
  });

  // 5. Deleting a Machine
  it('5. DELETE /api/machines/:id deletes a machine and cascades cleanup', async () => {
    // Create an ephemeral machine to delete
    const tempMachine = {
      name: 'Ephemeral Machine',
      type: 'mealy',
      states: ['temp1'],
      alphabet: ['0'],
      outputAlphabet: ['0'],
      initialState: 'temp1',
      transitions: [{ fromState: 'temp1', inputSymbol: '0', toState: 'temp1', outputSymbol: '0' }],
    };

    const createRes = await request(app).post('/api/machines').send(tempMachine);
    const tempId = createRes.body.data.id;

    const delRes = await request(app).delete(`/api/machines/${tempId}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Confirm it is gone
    const checkRes = await request(app).get(`/api/machines/${tempId}`);
    expect(checkRes.status).toBe(404);
  });

  // 6. Converting a Mealy Machine into a Moore Machine
  it('6. POST /api/conversions converts Mealy to Moore and generates all 5 states', async () => {
    const conversionPayload = {
      sourceMachine: MANDATORY_TASK_6_MEALY,
      targetType: 'moore',
      options: { removeUnreachable: true },
    };

    const res = await request(app)
      .post('/api/conversions')
      .send(conversionPayload);

    expect(res.status).toBe(200);
    expect(res.body.data.success).toBe(true);
    expect(res.body.data.targetType).toBe('moore');

    const moore = res.body.data.resultMachine;
    // Expected states: S, A_x, A_y, B_x, B_y
    expect(moore.states.slice().sort()).toEqual(['A_x', 'A_y', 'B_x', 'B_y', 'S']);
    expect(moore.initialState).toBe('S');
    expect(moore.stateOutputs['S']).toBe('ε');
    expect(moore.stateOutputs['A_x']).toBe('x');
    expect(moore.stateOutputs['A_y']).toBe('y');
    expect(moore.stateOutputs['B_x']).toBe('x');
    expect(moore.stateOutputs['B_y']).toBe('y');
    expect(moore.transitions).toHaveLength(10);
  });

  // 7. Converting a Moore Machine into a Mealy Machine
  it('7. POST /api/convert/moore-to-mealy folds outputs onto transitions', async () => {
    const res = await request(app)
      .post('/api/convert/moore-to-mealy')
      .send(EVEN_PARITY_MOORE);

    expect(res.status).toBe(200);
    expect(res.body.data.targetType).toBe('mealy');
    const mealy = res.body.data.resultMachine;
    expect(mealy.type).toBe('mealy');
    expect(mealy.transitions).toHaveLength(4);
    // Even parity: transition to 'odd' has output '1', transition to 'even' has output '0'
    const toOdd = mealy.transitions.find((t: any) => t.toState === 'odd');
    expect(toOdd?.outputSymbol).toBe('1');
  });

  // 8. Simulating Input 1100 and Receiving Output yxyx
  it('8. POST /api/simulations simulates input 1100 producing output yxyx', async () => {
    const simPayload = {
      machine: MANDATORY_TASK_6_MEALY,
      inputString: '1100',
    };

    const res = await request(app)
      .post('/api/simulations')
      .send(simPayload);

    expect(res.status).toBe(200);
    expect(res.body.data.inputTape).toBe('1100');
    expect(res.body.data.outputTape).toBe('yxyx');
    expect(res.body.data.steps).toHaveLength(5); // Initial step 0 + 4 transitions
    expect(res.body.data.finalState).toBe('A');
  });

  // 9. Verifying Equivalent Machines
  it('9. POST /api/verify-equivalence proves behavioral equivalence and detects differences', async () => {
    // Convert Task 6 Mealy to Moore first
    const convRes = await request(app)
      .post('/api/conversions')
      .send({ sourceMachine: MANDATORY_TASK_6_MEALY, targetType: 'moore' });
    const moore = convRes.body.data.resultMachine;

    // Verify equivalence
    const equivRes = await request(app)
      .post('/api/verify-equivalence')
      .send({ machineA: MANDATORY_TASK_6_MEALY, machineB: moore });

    expect(equivRes.status).toBe(200);
    expect(equivRes.body.data.isEquivalent).toBe(true);

    // Now test non-equivalent machines
    const mutatedMealy = {
      ...MANDATORY_TASK_6_MEALY,
      transitions: [
        { fromState: 'A', inputSymbol: '0', toState: 'A', outputSymbol: 'y' }, // Mismatch here!
        ...MANDATORY_TASK_6_MEALY.transitions.slice(1),
      ],
    };

    const diffRes = await request(app)
      .post('/api/verify-equivalence')
      .send({ machineA: MANDATORY_TASK_6_MEALY, machineB: mutatedMealy });

    expect(diffRes.status).toBe(200);
    expect(diffRes.body.data.isEquivalent).toBe(false);
    expect(diffRes.body.data.counterexample).toBeDefined();
    expect(diffRes.body.data.counterexample.inputString).toBe('0');
  }, 15000);

  // 10. Rejecting Malformed Input
  it('10. Rejects invalid requests with appropriate 400 status and structured JSON', async () => {
    // 10a: Machine with initial state not in states list
    const badInitialState = {
      name: 'Bad Initial',
      type: 'mealy',
      states: ['q0'],
      alphabet: ['0'],
      outputAlphabet: ['0'],
      initialState: 'q99',
      transitions: [],
    };
    const res1 = await request(app).post('/api/machines').send(badInitialState);
    expect(res1.status).toBe(400);
    expect(res1.body.code).toBe('VALIDATION_ERROR');

    // 10b: Nonexistent machine ID lookup
    const res2 = await request(app).get('/api/machines/non-existent-uuid-12345');
    expect(res2.status).toBe(404);
    expect(res2.body.code).toBe('NOT_FOUND');

    // 10c: Malformed JSON syntax
    const res3 = await request(app)
      .post('/api/machines')
      .set('Content-Type', 'application/json')
      .send('{ "invalidJson": broken }');
    expect(res3.status).toBe(400);
    expect(res3.body.code).toBe('MALFORMED_JSON');
  });

  // 11. Saving and Retrieving Conversion History
  it('11. GET /api/conversions records and retrieves conversion runs', async () => {
    // Trigger conversion
    await request(app)
      .post('/api/conversions')
      .send({ sourceMachine: MANDATORY_TASK_6_MEALY, targetType: 'moore' });

    const listRes = await request(app).get('/api/conversions');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const firstRun = listRes.body.data[0];
    const getRes = await request(app).get(`/api/conversions/${firstRun.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(firstRun.id);
  });

  // 12. Database Persistence and Transactional Integrity
  it('12. Enforces relational persistence across machines, states, and transitions tables', async () => {
    // Use the machine saved by test 2 — savedMachineId is set by that test.
    // We verify the full relational structure via the API (states + transitions).
    expect(savedMachineId).toBeDefined();

    // Retrieve and verify the full machine data including states and transitions
    const getRes = await request(app).get(`/api/machines/${savedMachineId}`);
    expect(getRes.status).toBe(200);

    const machineData = getRes.body.data.machineData;
    // Verify states were persisted relationally (A and B)
    expect(machineData.states).toHaveLength(2);
    expect(machineData.states.slice().sort()).toEqual(['A', 'B']);

    // Verify all 4 transitions were persisted
    expect(machineData.transitions).toHaveLength(4);

    // Verify transition integrity: A,0->A,x and A,1->B,y
    const t_A0 = machineData.transitions.find(
      (t: { fromState: string; inputSymbol: string }) => t.fromState === 'A' && t.inputSymbol === '0'
    );
    expect(t_A0?.toState).toBe('A');
    expect(t_A0?.outputSymbol).toBe('x');

    const t_A1 = machineData.transitions.find(
      (t: { fromState: string; inputSymbol: string }) => t.fromState === 'A' && t.inputSymbol === '1'
    );
    expect(t_A1?.toState).toBe('B');
    expect(t_A1?.outputSymbol).toBe('y');

    // Also verify cascade delete: create a temporary machine and delete it
    const tempMachine = {
      name: 'Cascade Test Machine',
      type: 'mealy' as const,
      states: ['s0', 's1'],
      alphabet: ['a'],
      outputAlphabet: ['0', '1'],
      initialState: 's0',
      transitions: [
        { fromState: 's0', inputSymbol: 'a', toState: 's1', outputSymbol: '1' },
        { fromState: 's1', inputSymbol: 'a', toState: 's0', outputSymbol: '0' },
      ],
    };
    const createRes = await request(app).post('/api/machines').send(tempMachine);
    expect(createRes.status).toBe(201);
    const tempId = createRes.body.data.id;

    // Verify it was created with both states and transitions
    const verifyRes = await request(app).get(`/api/machines/${tempId}`);
    expect(verifyRes.body.data.machineData.states).toHaveLength(2);
    expect(verifyRes.body.data.machineData.transitions).toHaveLength(2);

    // Delete it and confirm cascade: machine must be gone
    const delRes = await request(app).delete(`/api/machines/${tempId}`);
    expect(delRes.status).toBe(200);
    const checkRes = await request(app).get(`/api/machines/${tempId}`);
    expect(checkRes.status).toBe(404);
  });
});
