import { Request, Response, NextFunction } from 'express';
import { conversionService } from '../services/conversion.service.js';
import type { ConversionRequest, EquivalenceRequest } from '@automatalab/contracts';

export class ConversionController {
  async convert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversionRequest = req.body as ConversionRequest;
      const result = await conversionService.convert(conversionRequest);
      res.json({ data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Conversion error';
      res.status(400).json({
        error: message,
        code: 'CONVERSION_ERROR',
      });
    }
  }

  async convertMealyToMoore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sourceMachine = req.body.sourceMachine || req.body;
      const result = await conversionService.convert({
        sourceMachine,
        targetType: 'moore',
        options: req.body.options ?? {},
      });
      res.json({ data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Conversion error';
      res.status(400).json({
        error: message,
        code: 'CONVERSION_ERROR',
      });
    }
  }

  async convertMooreToMealy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sourceMachine = req.body.sourceMachine || req.body;
      const result = await conversionService.convert({
        sourceMachine,
        targetType: 'mealy',
        options: req.body.options ?? {},
      });
      res.json({ data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Conversion error';
      res.status(400).json({
        error: message,
        code: 'CONVERSION_ERROR',
      });
    }
  }

  async verifyEquivalence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const equivRequest = req.body as EquivalenceRequest;
      const result = await conversionService.verifyEquivalence(equivRequest);
      res.json({ data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Equivalence verification error';
      res.status(400).json({
        error: message,
        code: 'VERIFICATION_ERROR',
      });
    }
  }

  async listHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const history = await conversionService.listHistory(limit);
      res.json({ data: history });
    } catch (err) {
      next(err);
    }
  }

  async getHistoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await conversionService.getHistoryById(req.params.id);
      if (!record) {
        res.status(404).json({
          error: `Conversion run with id '${req.params.id}' not found`,
          code: 'NOT_FOUND',
        });
        return;
      }
      res.json({ data: record });
    } catch (err) {
      next(err);
    }
  }
}

export const conversionController = new ConversionController();
