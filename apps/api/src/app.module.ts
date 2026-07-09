import { MongoModule } from '@jperezmart/nest-mongodb';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { onError, ORPCModule } from '@orpc/nest';
import type { Request } from 'express';

import { HealthModule } from './features/health/health.module.js';
import { ServerEnv, validateEnv } from './integrations/env/server.js';
import { OrpcDocsController } from './integrations/orpc/orpc-docs.controller.js';
import { logOrpcError } from './integrations/orpc/orpc-error-logger.js';

const mode = process.env.NODE_ENV ?? 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${mode}.local`, `.env.${mode}`, '.env.local', '.env'],
      validate: validateEnv,
    }),
    ORPCModule.forRootAsync({
      useFactory: (request: Request) => ({
        context: { request },
        interceptors: [onError(logOrpcError)],
      }),
      inject: [REQUEST],
    }),
    MongoModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<ServerEnv, true>) => ({
        uri: config.get('MONGODB_URI', { infer: true }),
        dbName: config.get('MONGODB_DBNAME', { infer: true }),
      }),
    }),
    HealthModule,
  ],
  controllers: [OrpcDocsController],
})
export class AppModule {}
