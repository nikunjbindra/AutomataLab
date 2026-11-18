import { createApp } from './app.js';
import { initDb } from './db/index.js';
import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

async function bootstrap() {
  await initDb();

  const app = createApp();

  app.listen(port, () => {
    console.log(`[AutomataLab API] Server running at http://localhost:${port}`);
    console.log(`[AutomataLab API] Health check at http://localhost:${port}/api/health`);
  });
}

bootstrap().catch((err) => {
  console.error('[AutomataLab API] Failed to start server:', err);
  process.exit(1);
});
