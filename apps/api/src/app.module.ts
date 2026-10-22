import './integrations/orpc/orpc-context.js';

import { MongoModule } from '@jperezmart/nest-mongodb';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ORPCModule } from '@orpc/nest';

import { AuthModule } from './features/auth/auth.module.js';
import { HealthModule } from './features/health/health.module.js';
import { PostsModule } from './features/posts/posts.module.js';
import { SerieModule } from './features/serie/serie.module.js';
import { UploadModule } from './features/upload/upload.module.js';
import { UsersModule } from './features/users/users.module.js';
import { ServerEnv, validateEnv } from './integrations/env/server.js';
import { AllExceptionsFilter } from './integrations/http/all-exceptions.filter.js';
import { mongoClientOptions } from './integrations/mongodb/mongodb.config.js';
import { orpcModuleOptions } from './integrations/orpc/orpc.config.js';
import { OrpcDocsController } from './integrations/orpc/orpc-docs.controller.js';

const mode = process.env.NODE_ENV ?? 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${mode}.local`, `.env.${mode}`, '.env.local', '.env'],
      validate: validateEnv,
    }),
    ORPCModule.forRootAsync(orpcModuleOptions),
    MongoModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<ServerEnv, true>) => ({
        uri: config.get('MONGODB_URI', { infer: true }),
        dbName: config.get('MONGODB_DBNAME', { infer: true }),
        ...mongoClientOptions,
      }),
    }),
    AuthModule,
    UsersModule,
    HealthModule,
    SerieModule,
    PostsModule,
    UploadModule,
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
