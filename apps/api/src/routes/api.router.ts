import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { machineController } from '../controllers/machine.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { AnyMachineSchema } from '@automatalab/contracts';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', getHealth);

// Machine Persistence CRUD
apiRouter.get('/machines', (req, res, next) => machineController.list(req, res, next));
apiRouter.get('/machines/:id', (req, res, next) => machineController.getById(req, res, next));
apiRouter.post(
  '/machines',
  validateBody(AnyMachineSchema),
  (req, res, next) => machineController.create(req, res, next)
);
apiRouter.delete('/machines/:id', (req, res, next) => machineController.delete(req, res, next));
