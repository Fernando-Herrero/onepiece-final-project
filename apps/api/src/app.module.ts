import { Module } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { onError, ORPCModule } from '@orpc/nest';
import type { Request } from 'express';

import { HealthModule } from './features/health/health.module.js';
import { OrpcDocsController } from './integrations/orpc/orpc-docs.controller.js';
import { logOrpcError } from './integrations/orpc/orpc-error-logger.js';

@Module({
  imports: [
    ORPCModule.forRootAsync({
      useFactory: (request: Request) => ({
        context: { request },
        interceptors: [onError(logOrpcError)],
      }),
      inject: [REQUEST],
    }),
    HealthModule,
  ],
  controllers: [OrpcDocsController],
})
export class AppModule {}
