import 'reflect-metadata';

import { Controller, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Implement, implement, ORPCModule } from '@orpc/nest';
import { ORPCError } from '@orpc/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { orpcModuleOptions } from './orpc.config.js';
import { contract } from './orpc.contract.js';

// Lo que lanza el handler de `getEpisode`; cada test pone el suyo.
let fail: () => never;

/** Implementa procedures reales del contrato (`EPISODE_NOT_FOUND` es 404) sin servicios ni Mongo. */
@Controller()
class ProbeController {
  @Implement(contract.serie.getEpisode)
  getEpisode() {
    return implement(contract.serie.getEpisode).handler(() => fail());
  }

  @Implement(contract.health.check)
  check() {
    return implement(contract.health.check).handler(() => ({
      status: 'ok' as const,
      service: 'probe',
    }));
  }
}

// Pasa por @orpc/nest y Express como en producción: un test con `call()` de
// @orpc/server no detecta dos copias de oRPC ni un interceptor sin registrar.
describe('errores del contrato por HTTP', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ORPCModule.forRootAsync(orpcModuleOptions)],
      controllers: [ProbeController],
    }).compile();

    app = moduleRef.createNestApplication({ bodyParser: false, logger: false });
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterAll(() => app.close());

  const getEpisode = async (error: Error) => {
    fail = () => {
      throw error;
    };
    const res = await fetch(`${baseUrl}/api/serie/episodes/1`);
    return { status: res.status, body: await res.json() };
  };

  it('un código del contrato sale con su status, su mensaje y defined', async () => {
    const { status, body } = await getEpisode(
      new ORPCError('EPISODE_NOT_FOUND'),
    );

    expect(status).toBe(404);
    expect(body).toMatchObject({
      code: 'EPISODE_NOT_FOUND',
      message: 'Episode not found',
      defined: true,
    });
  });

  it('un código que no está en el contrato sale tal cual, como 500', async () => {
    const { status, body } = await getEpisode(new ORPCError('USER_NOT_FOUND'));

    expect(status).toBe(500);
    expect(body).toMatchObject({ code: 'USER_NOT_FOUND', defined: false });
  });

  it('un error que no es ORPCError sale como 500 genérico', async () => {
    const { status, body } = await getEpisode(new Error('boom'));

    expect(status).toBe(500);
    expect(body).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      defined: false,
    });
  });

  it('sin error, devuelve la salida del handler', async () => {
    const res = await fetch(`${baseUrl}/api/health`);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', service: 'probe' });
  });
});
