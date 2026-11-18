import { Request, Response } from 'express';
import type { ApiHealthResponse } from '@automatalab/contracts';

const startTime = Date.now();

export function getHealth(_req: Request, res: Response<ApiHealthResponse>): void {
  res.json({
    status: 'ok',
    service: 'automatalab-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
}
