import 'reflect-metadata';

import { Controller, type INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { createORPCClient, isDefinedError } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { Implement, implement, ORPCModule } from '@orpc/nest';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AllExceptionsFilter } from '../../integrations/http/all-exceptions.filter.js';
import { orpcModuleOptions } from '../../integrations/orpc/orpc.config.js';
import { contract } from '../../integrations/orpc/orpc.contract.js';
import { AuthSessionService } from './auth-session.service.js';
import { Public } from './public.decorator.js';
import { SessionGuard } from './session.guard.js';

/** Una procedure protegida y una pública del contrato, sin servicios ni Mongo. */
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

// Guard y filtro globales reales, como en `app.module.ts`; solo el env es de prueba.
describe('SessionGuard por HTTP', () => {
  let app: INestApplication;
  let client: ContractRouterClient<typeof contract>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'test-secret', NODE_ENV: 'test' })],
        }),
        ORPCModule.forRootAsync(orpcModuleOptions),
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
    const baseUrl = await app.getUrl();

    // Mismo cliente que la web, sin cookie de sesión.
    client = createORPCClient<ContractRouterClient<typeof contract>>(
      new OpenAPILink(contract, { url: baseUrl }),
    );
  });

  afterAll(() => app.close());

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
});
