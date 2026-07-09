import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { env } from './integrations/env/server.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // oRPC lee el stream del body; Nest no debe parsearlo antes.
    bodyParser: false,
  });

  app.enableShutdownHooks();

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  await app.listen(env.port);

  const logger = new Logger('Bootstrap');
  logger.log(`listening on http://localhost:${env.port}`);
  logger.log(`swagger    http://localhost:${env.port}/api/orpc`);
  logger.log(`spec       http://localhost:${env.port}/api/orpc/spec.json`);
}

bootstrap();
