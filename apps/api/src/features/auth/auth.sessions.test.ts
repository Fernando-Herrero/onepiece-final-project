import 'reflect-metadata';

import { createHash } from 'node:crypto';

import { MongoModule } from '@jperezmart/nest-mongodb';
import { SESSION_COOKIE_NAME } from '@logpose/contracts/features/auth/constants';
import type { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { createORPCClient, isDefinedError } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { ORPCModule } from '@orpc/nest';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { type Db, MongoClient, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AllExceptionsFilter } from '../../integrations/http/all-exceptions.filter.js';
import { orpcModuleOptions } from '../../integrations/orpc/orpc.config.js';
import { contract } from '../../integrations/orpc/orpc.contract.js';
import { AuthModule } from './auth.module.js';

type Client = ContractRouterClient<typeof contract>;

type SessionDocument = {
  _id: string;
  userId: ObjectId;
  expiresAt: Date;
  lastSeenAt: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_S = 30 * 24 * 60 * 60;
/** Margen para comparar fechas «≈ ahora + algo». */
const MARGIN_MS = 5_000;
const PASSWORD = 'gomu-gomu';

let mongod: MongoMemoryServer;
let app: INestApplication;
let baseUrl: string;
let mongo: MongoClient;
let db: Db;
/** `Set-Cookie` de la última respuesta que vio cualquier cliente. */
let lastSetCookies: string[] = [];

/** Mismo cliente que la web; guarda las cabeceras `Set-Cookie` de cada respuesta. */
const clientWith = (token?: string): Client =>
  createORPCClient<Client>(
    new OpenAPILink(contract, {
      url: baseUrl,
      headers: token ? { cookie: `${SESSION_COOKIE_NAME}=${token}` } : {},
      fetch: async (request, init) => {
        const response = await fetch(request, init);
        lastSetCookies = response.headers.getSetCookie();
        return response;
      },
    }),
  );

/** La cookie de sesión de la última respuesta, o `undefined` si no se envió. */
function sessionCookie() {
  const header = lastSetCookies.find(cookie =>
    cookie.startsWith(`${SESSION_COOKIE_NAME}=`),
  );
  if (!header) return undefined;

  const [pair, ...attributes] = header.split(';').map(part => part.trim());
  const token = pair!.slice(SESSION_COOKIE_NAME.length + 1);
  const attr = (name: string) =>
    attributes
      .find(a => a.toLowerCase().startsWith(`${name}=`))
      ?.slice(name.length + 1);

  return { token, maxAge: attr('max-age'), expires: attr('expires') };
}

function requireSessionCookie() {
  const cookie = sessionCookie();
  expect(cookie, 'la respuesta debía traer la cookie de sesión').toBeDefined();
  return cookie!;
}

const hashOf = (token: string) =>
  createHash('sha256').update(token).digest('hex');

const sessions = () => db.collection<SessionDocument>('sessions');

/** Registra una cuenta sin cookie y devuelve su id y el token de la cookie. */
async function register(username: string) {
  const { user } = await clientWith().auth.register({
    username,
    firstName: 'Monkey',
    lastName: 'D.',
    email: `${username}@logpose.test`,
    password: PASSWORD,
    avatar: '/avatars/luffy/luffy-happy-400.webp',
  });
  return { userId: user._id, token: requireSessionCookie().token };
}

async function login(username: string, password = PASSWORD) {
  await clientWith().auth.login({
    email: `${username}@logpose.test`,
    password,
  });
  return requireSessionCookie().token;
}

async function expectUnauthorized(call: Promise<unknown>) {
  const error = await call.then(
    () => undefined,
    (e: unknown) => e,
  );

  expect(isDefinedError(error)).toBe(true);
  expect(error).toMatchObject({ code: 'UNAUTHORIZED', status: 401 });
}

function expectCloseTo(date: Date | undefined, expectedMs: number) {
  expect(date).toBeInstanceOf(Date);
  expect(Math.abs(date!.getTime() - expectedMs)).toBeLessThan(MARGIN_MS);
}

/** La cookie dura 30 días, por Max-Age o por Expires. */
function expectThirtyDayCookie(
  cookie: ReturnType<typeof requireSessionCookie>,
) {
  if (cookie.maxAge !== undefined) {
    expect(Number(cookie.maxAge)).toBe(THIRTY_DAYS_S);
  } else {
    expect(
      cookie.expires,
      'la cookie debía llevar Max-Age o Expires',
    ).toBeDefined();
    expectCloseTo(new Date(cookie.expires!), Date.now() + THIRTY_DAYS_MS);
  }
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();

  // AuthModule real (controller y guard global); solo el env y Mongo son de prueba.
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [() => ({ NODE_ENV: 'test' })],
      }),
      ORPCModule.forRootAsync(orpcModuleOptions),
      MongoModule.forRoot(mongod.getUri(), { dbName: 'test' }),
      AuthModule,
    ],
    providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
  }).compile();

  app = moduleRef.createNestApplication({ bodyParser: false, logger: false });
  await app.listen(0);
  baseUrl = await app.getUrl();

  // Cliente aparte para leer y manipular la base sin pasar por la API.
  mongo = await MongoClient.connect(mongod.getUri());
  db = mongo.db('test');
});

afterAll(async () => {
  await mongo.close();
  await app.close();
  await mongod.stop();
});

describe('Sesiones opacas en Mongo por HTTP', () => {
  it('sin cookie, auth.me falla con el UNAUTHORIZED del contrato', async () => {
    await expectUnauthorized(clientWith().auth.me());
  });

  it('sin cookie, register y login responden', async () => {
    await expect(
      clientWith().auth.register({
        username: 'nami',
        firstName: 'Nami',
        lastName: 'Navegante',
        email: 'nami@logpose.test',
        password: PASSWORD,
        avatar: '/avatars/nami/nami-happy-400.webp',
      }),
    ).resolves.toMatchObject({ user: { username: 'nami' } });

    await expect(
      clientWith().auth.login({
        email: 'nami@logpose.test',
        password: PASSWORD,
      }),
    ).resolves.toMatchObject({ user: { username: 'nami' } });
  });

  it('el registro abre una sesión: token opaco, _id con su SHA-256 y 30 días de caducidad', async () => {
    const { userId, token } = await register('luffy');
    const cookie = requireSessionCookie();

    // Token aleatorio, no un JWT.
    expect(token).not.toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expectThirtyDayCookie(cookie);

    // Se guarda el hash, nunca el token tal cual.
    expect(await sessions().findOne({ _id: token })).toBeNull();
    const session = await sessions().findOne({ _id: hashOf(token) });
    expect(session).not.toBeNull();
    expect(session!.userId).toBeInstanceOf(ObjectId);
    expect(session!.userId.toString()).toBe(userId);
    expectCloseTo(session!.expiresAt, Date.now() + THIRTY_DAYS_MS);
    expectCloseTo(session!.lastSeenAt, Date.now());
  });

  it('el login abre otra sesión cuya cookie funciona en auth.me', async () => {
    const { userId, token: registerToken } = await register('zoro');

    const token = await login('zoro');

    expect(token).not.toBe(registerToken);
    expectThirtyDayCookie(requireSessionCookie());
    const session = await sessions().findOne({ _id: hashOf(token) });
    expect(session?.userId.toString()).toBe(userId);
    await expect(clientWith(token).auth.me()).resolves.toMatchObject({
      _id: userId,
    });
  });

  it('la colección sessions tiene un índice TTL sobre expiresAt', async () => {
    await register('usopp');

    const indexes = await sessions().indexes();
    const ttl = indexes.find(
      index => JSON.stringify(index.key) === JSON.stringify({ expiresAt: 1 }),
    );
    expect(ttl).toMatchObject({ expireAfterSeconds: 0 });
  });

  it('con lastSeenAt de menos de 24 h, una petición no escribe nada ni reenvía la cookie', async () => {
    const { token } = await register('sanji');
    // Sesión vista hace 1 h que caduca dentro de 29 días.
    await sessions().updateOne(
      { _id: hashOf(token) },
      {
        $set: {
          lastSeenAt: new Date(Date.now() - 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 29 * DAY_MS),
        },
      },
    );
    const before = await sessions().findOne({ _id: hashOf(token) });
    expect(before).not.toBeNull();

    await clientWith(token).auth.me();

    expect(sessionCookie()).toBeUndefined();
    expect(await sessions().findOne({ _id: hashOf(token) })).toEqual(before);
  });

  it('con lastSeenAt de más de 24 h, una petición renueva expiresAt y lastSeenAt y reenvía la cookie', async () => {
    const { token } = await register('chopper');
    // Sesión vista hace 2 días que caduca dentro de 28.
    const { matchedCount } = await sessions().updateOne(
      { _id: hashOf(token) },
      {
        $set: {
          lastSeenAt: new Date(Date.now() - 2 * DAY_MS),
          expiresAt: new Date(Date.now() + 28 * DAY_MS),
        },
      },
    );
    expect(matchedCount).toBe(1);

    await clientWith(token).auth.me();

    const cookie = requireSessionCookie();
    expect(cookie.token).toBe(token);
    expectThirtyDayCookie(cookie);
    const session = await sessions().findOne({ _id: hashOf(token) });
    expectCloseTo(session?.expiresAt, Date.now() + THIRTY_DAYS_MS);
    expectCloseTo(session?.lastSeenAt, Date.now());
  });

  it('logout borra la sesión de esa cookie y después auth.me da UNAUTHORIZED', async () => {
    const { token } = await register('robin');
    await expect(clientWith(token).auth.me()).resolves.toBeDefined();

    await clientWith(token).auth.logout();

    expect(await sessions().findOne({ _id: hashOf(token) })).toBeNull();
    await expectUnauthorized(clientWith(token).auth.me());
  });

  it('una cuenta desactivada recibe UNAUTHORIZED con una cookie que antes funcionaba', async () => {
    const { userId, token } = await register('franky');
    await expect(clientWith(token).auth.me()).resolves.toBeDefined();

    await db
      .collection('users')
      .updateOne({ _id: new ObjectId(userId) }, { $set: { isActive: false } });

    await expectUnauthorized(clientWith(token).auth.me());
  });

  it('si el usuario de la sesión ya no existe, UNAUTHORIZED', async () => {
    const { userId, token } = await register('brook');
    await expect(clientWith(token).auth.me()).resolves.toBeDefined();

    await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    await expectUnauthorized(clientWith(token).auth.me());
  });

  it('cambiar la contraseña borra todas las sesiones del usuario y abre una nueva', async () => {
    const { userId, token: current } = await register('jimbe');
    const otherDevice = await login('jimbe');
    const newPassword = 'umi-no-kyodai';

    await clientWith(current).auth.changePassword({
      currentPassword: PASSWORD,
      newPassword,
      repeatNewPassword: newPassword,
    });

    const rotated = requireSessionCookie();
    expect(rotated.token).not.toBe(current);
    expect(rotated.token).not.toBe(otherDevice);
    expectThirtyDayCookie(rotated);

    // Solo queda la sesión nueva.
    const remaining = await sessions()
      .find({ userId: new ObjectId(userId) })
      .toArray();
    expect(remaining.map(s => s._id)).toEqual([hashOf(rotated.token)]);

    await expectUnauthorized(clientWith(current).auth.me());
    await expectUnauthorized(clientWith(otherDevice).auth.me());
    await expect(clientWith(rotated.token).auth.me()).resolves.toMatchObject({
      _id: userId,
    });

    await expect(login('jimbe', newPassword)).resolves.toBeDefined();
  });
});
