import { createApp } from '../apps/api/dist/app.js';
import { initDb } from '../apps/api/dist/db/index.js';

const app = createApp();
let ready;

export default async function handler(req, res) {
  try {
    ready ??= initDb().catch(error => {
      ready = undefined;
      throw error;
    });
    await ready;
  } catch {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  return app(req, res);
}
