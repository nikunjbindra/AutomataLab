import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error & { status?: number; type?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle JSON parsing syntax errors
  if (err instanceof SyntaxError && (err.status === 400 || err.type === 'entity.parse.failed')) {
    res.status(400).json({
      error: 'Malformed JSON payload in request body',
      code: 'MALFORMED_JSON',
    });
    return;
  }

  console.error('[API Error]', err);
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    code: status === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
  });
}
