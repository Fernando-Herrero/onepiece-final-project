import './integrations/orpc/orpc-context.js';

import { MongoModule } from '@jperezmart/nest-mongodb';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, REQUEST } from '@nestjs/core';
import { onError, ORPCModule } from '@orpc/nest';
import type { Request } from 'express';

import { AuthModule } from './features/auth/auth.module.js';
import { AuthSessionService } from './features/auth/auth-session.service.js';
import { HealthModule } from './features/health/health.module.js';
import { SerieModule } from './features/serie/serie.module.js';
import { UsersModule } from './features/users/users.module.js';
import { ServerEnv, validateEnv } from './integrations/env/server.js';
import { AllExceptionsFilter } from './integrations/http/all-exceptions.filter.js';
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
      imports: [AuthModule],
      useFactory: (request: Request, authSession: AuthSessionService) => ({
        context: { request: authSession.attachUserToRequest(request) },
        interceptors: [onError(logOrpcError)],
      }),
      inject: [REQUEST, AuthSessionService],
    }),
    MongoModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<ServerEnv, true>) => ({
        uri: config.get('MONGODB_URI', { infer: true }),
        dbName: config.get('MONGODB_DBNAME', { infer: true }),
      }),
    }),
    AuthModule,
    UsersModule,
    HealthModule,
    SerieModule,
  ],
  controllers: [OrpcDocsController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
