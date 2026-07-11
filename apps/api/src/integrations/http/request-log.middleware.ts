import { randomUUID } from 'node:crypto';

import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

type RequestWithMeta = Request & {
  user?: { id: string };
  requestId?: string;
};

export function requestLogMiddleware(
  req: RequestWithMeta,
  res: Response,
  next: NextFunction,
) {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : 'info';

    const event = {
      event: 'http.request',
      service: '@logpose/api',
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
      status,
      duration_ms: durationMs,
      user_id: req.user?.id ?? null,
      env: process.env.NODE_ENV ?? 'development',
    };

    if (level === 'error') {
      logger.error(JSON.stringify(event));
    } else {
      logger.log(JSON.stringify(event));
    }
  });

  next();
}
