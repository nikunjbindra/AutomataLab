import { Request, Response, NextFunction } from 'express';
import { simulationService } from '../services/simulation.service.js';
import type { SimulationRequest } from '@automatalab/contracts';

export class SimulationController {
  async simulate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const simulationRequest = req.body as SimulationRequest;
      const result = await simulationService.simulate(simulationRequest, {
        persist: req.query.persist === 'true',
      });

      if (!result.isValid) {
        res.status(400).json({
          error: result.error || 'Simulation failed',
          code: 'SIMULATION_ERROR',
          data: result,
        });
        return;
      }

      res.json({ data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Simulation error';
      res.status(400).json({
        error: message,
        code: 'SIMULATION_ERROR',
      });
    }
  }

  async listHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const history = await simulationService.listHistory(limit);
      res.json({ data: history });
    } catch (err) {
      next(err);
    }
  }

  async getHistoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await simulationService.getHistoryById(req.params.id);
      if (!record) {
        res.status(404).json({
          error: `Simulation run with id '${req.params.id}' not found`,
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

export const simulationController = new SimulationController();
