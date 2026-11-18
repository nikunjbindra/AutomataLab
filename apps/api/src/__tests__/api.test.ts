import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { initDb } from '../db/index.js';

describe('AutomataLab API Endpoints', () => {
  const app = createApp();

  beforeAll(async () => {
    await initDb();
  });

  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'automatalab-api');
    expect(res.body).toHaveProperty('uptime');
  });

  it('POST /api/machines returns 400 when body fails Zod validation', async () => {
    const invalidMachine = {
      name: 'Bad Machine',
      type: 'mealy',
      states: [], // Empty states violates min(1)
    };

    const res = await request(app)
      .post('/api/machines')
      .send(invalidMachine);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(res.body).toHaveProperty('details');
  });

  it('POST /api/machines creates and stores a valid Mealy machine', async () => {
    const validMachine = {
      name: 'Integration Test Parity Mealy',
      type: 'mealy',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 'q0',
      transitions: [
        { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: '0' },
        { fromState: 'q0', inputSymbol: '1', toState: 'q1', outputSymbol: '1' },
      ],
    };

    const createRes = await request(app)
      .post('/api/machines')
      .send(validMachine);

    expect(createRes.status).toBe(201);
    expect(createRes.body.data).toHaveProperty('id');
    expect(createRes.body.data.name).toBe('Integration Test Parity Mealy');

    const createdId = createRes.body.data.id;

    // Retrieve by ID
    const getRes = await request(app).get(`/api/machines/${createdId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(createdId);

    // Clean up
    const deleteRes = await request(app).delete(`/api/machines/${createdId}`);
    expect(deleteRes.status).toBe(200);
  });
});
