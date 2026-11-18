import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { machineController } from '../controllers/machine.controller.js';
import { conversionController } from '../controllers/conversion.controller.js';
import { simulationController } from '../controllers/simulation.controller.js';
import { validationController } from '../controllers/validation.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  AnyMachineSchema,
  ConversionRequestSchema,
  SimulationRequestSchema,
  EquivalenceRequestSchema,
} from '@automatalab/contracts';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', getHealth);

// Machines Persistence CRUD
apiRouter.get('/machines', (req, res, next) => machineController.list(req, res, next));
apiRouter.get('/machines/:id', (req, res, next) => machineController.getById(req, res, next));
apiRouter.post(
  '/machines',
  validateBody(AnyMachineSchema),
  (req, res, next) => machineController.create(req, res, next)
);
apiRouter.put(
  '/machines/:id',
  validateBody(AnyMachineSchema),
  (req, res, next) => machineController.update(req, res, next)
);
apiRouter.delete('/machines/:id', (req, res, next) => machineController.delete(req, res, next));

// Conversions
apiRouter.post(
  '/conversions',
  validateBody(ConversionRequestSchema),
  (req, res, next) => conversionController.convert(req, res, next)
);
apiRouter.get('/conversions', (req, res, next) => conversionController.listHistory(req, res, next));
apiRouter.get('/conversions/:id', (req, res, next) => conversionController.getHistoryById(req, res, next));

// Backwards-compatible conversion aliases
apiRouter.post('/convert/mealy-to-moore', (req, res, next) =>
  conversionController.convertMealyToMoore(req, res, next)
);
apiRouter.post('/convert/moore-to-mealy', (req, res, next) =>
  conversionController.convertMooreToMealy(req, res, next)
);

// Simulations
apiRouter.post(
  '/simulations',
  validateBody(SimulationRequestSchema),
  (req, res, next) => simulationController.simulate(req, res, next)
);
apiRouter.post(
  '/simulate',
  validateBody(SimulationRequestSchema),
  (req, res, next) => simulationController.simulate(req, res, next)
);
apiRouter.get('/simulations', (req, res, next) => simulationController.listHistory(req, res, next));
apiRouter.get('/simulations/:id', (req, res, next) => simulationController.getHistoryById(req, res, next));

// Validations
apiRouter.post('/validations', (req, res, next) => validationController.validate(req, res, next));

// Equivalence Verifications
apiRouter.post(
  '/verify-equivalence',
  validateBody(EquivalenceRequestSchema),
  (req, res, next) => conversionController.verifyEquivalence(req, res, next)
);
apiRouter.post(
  '/verifications',
  validateBody(EquivalenceRequestSchema),
  (req, res, next) => conversionController.verifyEquivalence(req, res, next)
);
