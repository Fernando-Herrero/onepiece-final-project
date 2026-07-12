import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import type { ServerEnv } from './integrations/env/server.js';
import { requestLogMiddleware } from './integrations/http/request-log.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // oRPC lee el stream del body; Nest no debe parsearlo antes.
    bodyParser: false,
  });

  const config = app.get<ConfigService<ServerEnv, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });
  const nodeEnv = config.get('NODE_ENV', { infer: true });

  app.enableShutdownHooks();

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.disable('x-powered-by');
  expressApp.set('trust proxy', 1);

  expressApp.use(
    helmet({
      // Swagger UI (solo dev) carga scripts de unpkg.
      contentSecurityPolicy:
        nodeEnv === 'development'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
                imgSrc: ["'self'", 'data:', 'https:'],
              },
            }
          : true,
    }),
  );

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: 'Too many requests, try again later',
    },
  });

  expressApp.use('/api/auth/login', authLimiter);
  expressApp.use('/api/auth/register', authLimiter);

  expressApp.use(requestLogMiddleware);
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`listening on http://localhost:${port}`);

  if (nodeEnv !== 'production') {
    logger.log(`swagger    http://localhost:${port}/api/orpc`);
    logger.log(`spec       http://localhost:${port}/api/orpc/spec.json`);
  }

  logger.log(`ready      http://localhost:${port}/api/health/ready`);
}

bootstrap();
