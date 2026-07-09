import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import type { ServerEnv } from './integrations/env/server.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // oRPC lee el stream del body; Nest no debe parsearlo antes.
    bodyParser: false,
  });

  const config = app.get<ConfigService<ServerEnv, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });

  app.enableShutdownHooks();

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`listening on http://localhost:${port}`);
  logger.log(`swagger    http://localhost:${port}/api/orpc`);
  logger.log(`spec       http://localhost:${port}/api/orpc/spec.json`);
  logger.log(`ready      http://localhost:${port}/api/health/ready`);
}

bootstrap();
