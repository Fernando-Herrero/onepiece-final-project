import 'reflect-metadata';

import { MongoModule } from '@jperezmart/nest-mongodb';
import { SESSION_COOKIE_NAME } from '@logpose/contracts/features/auth/constants';
import { Controller, type INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { createORPCClient, isDefinedError } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { Implement, implement, ORPCModule } from '@orpc/nest';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AllExceptionsFilter } from '../../integrations/http/all-exceptions.filter.js';
import { orpcModuleOptions } from '../../integrations/orpc/orpc.config.js';
import { contract } from '../../integrations/orpc/orpc.contract.js';
import { UsersPersistenceModule } from '../users/users-persistence.module.js';
import { AuthSessionService } from './auth-session.service.js';
import { Public } from './public.decorator.js';
import { SessionGuard } from './session.guard.js';

/** Una procedure protegida y una pública del contrato, sin servicios. */
@Controller()
class ProbeController {
  @Implement(contract.auth.me)
  me() {
    return implement(contract.auth.me).handler(() => {
      throw new Error('el guard debía cortar antes del handler');
    });
  }

  @Public()
  @Implement(contract.health.check)
  check() {
    return implement(contract.health.check).handler(() => ({
      status: 'ok' as const,
      service: 'probe',
    }));
  }
}

// Guard y filtro globales reales, como en `app.module.ts`; solo el env y Mongo son de prueba.
describe('SessionGuard por HTTP', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;
  let baseUrl: string;
  let authSession: AuthSessionService;
  let client: ContractRouterClient<typeof contract>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'test-secret', NODE_ENV: 'test' })],
        }),
        ORPCModule.forRootAsync(orpcModuleOptions),
        MongoModule.forRoot(mongod.getUri(), { dbName: 'test' }),
        UsersPersistenceModule,
      ],
      controllers: [ProbeController],
      providers: [
        AuthSessionService,
        { provide: APP_GUARD, useClass: SessionGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
      ],
    }).compile();

    app = moduleRef.createNestApplication({ bodyParser: false, logger: false });
    await app.listen(0);
    baseUrl = await app.getUrl();
    authSession = moduleRef.get(AuthSessionService);

    // Mismo cliente que la web, sin cookie de sesión.
    client = createORPCClient<ContractRouterClient<typeof contract>>(
      new OpenAPILink(contract, { url: baseUrl }),
    );
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('sin cookie, una procedure protegida falla con el UNAUTHORIZED del contrato', async () => {
    const error = await client.auth.me().catch((e: unknown) => e);

    expect(isDefinedError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'UNAUTHORIZED', status: 401 });
  });

  it('sin cookie, una procedure pública responde', async () => {
    await expect(client.health.check()).resolves.toEqual({
      status: 'ok',
      service: 'probe',
    });
  });

  it('con la cookie válida de una cuenta que ya no existe, una procedure protegida falla con UNAUTHORIZED', async () => {
    const token = authSession.signToken(new ObjectId().toString());
    const orphanClient = createORPCClient<
      ContractRouterClient<typeof contract>
    >(
      new OpenAPILink(contract, {
        url: baseUrl,
        headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
      }),
    );

    const error = await orphanClient.auth.me().catch((e: unknown) => e);

    expect(isDefinedError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'UNAUTHORIZED', status: 401 });
  });
});
