import { Request, Response, NextFunction } from 'express';
import { validationService } from '../services/validation.service.js';
import type { AnyMachine } from '@automatalab/contracts';

export class ValidationController {
  validate(req: Request, res: Response, next: NextFunction): void {
    try {
      const machine = (req.body.machine || req.body) as AnyMachine;
      const result = validationService.validate(machine);

      res.json({
        data: {
          isValid: result.isValid,
          isComplete: result.isComplete,
          isDeterministic: result.isDeterministic,
          issues: result.issues,
          unreachableStates: result.unreachableStates,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Validation error';
      res.status(400).json({
        error: message,
        code: 'VALIDATION_ERROR',
      });
    }
  }
}

export const validationController = new ValidationController();
