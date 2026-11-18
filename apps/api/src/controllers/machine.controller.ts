import { Request, Response, NextFunction } from 'express';
import { machineService } from '../services/machine.service.js';
import type { AnyMachine } from '@automatalab/contracts';

export class MachineController {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const machines = await machineService.listMachines();
      res.json({ data: machines });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const machine = await machineService.getMachineById(req.params.id);
      if (!machine) {
        res.status(404).json({
          error: `Machine with id '${req.params.id}' not found`,
          code: 'NOT_FOUND',
        });
        return;
      }
      res.json({ data: machine });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const machineData = req.body as AnyMachine;
      const created = await machineService.saveMachine(machineData);
      res.status(201).json({ data: created });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const success = await machineService.deleteMachine(req.params.id);
      if (!success) {
        res.status(404).json({
          error: `Machine with id '${req.params.id}' not found`,
          code: 'NOT_FOUND',
        });
        return;
      }
      res.json({ success: true, message: 'Machine deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const machineController = new MachineController();
