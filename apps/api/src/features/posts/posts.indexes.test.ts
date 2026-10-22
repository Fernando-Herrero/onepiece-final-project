import 'reflect-metadata';

import { MongoModule } from '@jperezmart/nest-mongodb';
import { DEFAULT_USER_PREFERENCES } from '@logpose/contracts/common/user.schemas';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { type Db, MongoClient, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { mongoClientOptions } from '../../integrations/mongodb/mongodb.config.js';
import type { Viewer } from '../auth/access.js';
import { NotificationsPersistenceModule } from '../notifications/notifications-persistence.module.js';
import type { UserDocument } from '../users/user.mappers.js';
import { UsersPersistence } from '../users/users.persistence.js';
import { UsersPersistenceModule } from '../users/users-persistence.module.js';
import type { PostDocument } from './posts.mappers.js';
import { PostsPersistence } from './posts.persistence.js';
import { PostsService } from './posts.service.js';
import { PostsPersistenceModule } from './posts-persistence.module.js';

/** Índice del feed que pide el ticket F13. */
const FEED_INDEX_KEY = '{ isDeleted: 1, createdAt: -1, _id: -1 }';

/** Usuario completo como lo crea `AuthService.register`. */
const newUser = (username: string): Omit<UserDocument, '_id'> => ({
  username,
  firstName: 'Monkey',
  lastName: 'D.',
  email: `${username}@logpose.test`,
  password: 'hash',
  avatar: '/avatars/default.png',
  privacy: {
    showPosts: true,
    showLikes: true,
    showBookmarked: true,
    showComments: true,
  },
  preferences: DEFAULT_USER_PREFERENCES,
  role: 'user',
  verified: false,
  isActive: true,
  experience: 0,
  serieProgress: { saga: 0, arc: 0, episode: 0 },
  unlockedCards: {
    characters: [],
    items: [],
    fruits: [],
    swords: [],
    boats: [],
  },
  completedEpisodes: [],
  followers: [],
  following: [],
});

let mongod: MongoMemoryServer;
let moduleRef: TestingModule;
let client: MongoClient;
let db: Db;
let service: PostsService;
let followerId: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();

  // Módulos reales: `init()` dispara los `onModuleInit` de las persistencias.
  moduleRef = await Test.createTestingModule({
    imports: [
      MongoModule.forRoot(mongod.getUri(), {
        dbName: 'test',
        ...mongoClientOptions,
      }),
      PostsPersistenceModule,
      UsersPersistenceModule,
      NotificationsPersistenceModule,
    ],
    providers: [PostsService],
  }).compile();
  await moduleRef.init();

  service = moduleRef.get(PostsService);
  const users = moduleRef.get(UsersPersistence);
  const posts = moduleRef.get(PostsPersistence);

  // Dueño con posts de cada visibilidad y un seguidor que lo sigue.
  const owner = await users.insert(newUser('idx_owner'));
  const follower = await users.insert(newUser('idx_follower'));
  followerId = follower._id.toString();
  await users.addFollow(followerId, owner._id.toString());

  const visibilities: PostDocument['visibility'][] = [
    'public',
    'followers',
    'private',
  ];
  for (let i = 0; i < 30; i++) {
    await posts.insert({
      text: `idx ${i}`,
      userId: i % 2 === 0 ? owner._id : follower._id,
      visibility: visibilities[i % 3]!,
      language: 'es',
    });
  }

  // Cliente aparte solo para el profiler: no toca el código bajo prueba.
  client = await MongoClient.connect(mongod.getUri(), mongoClientOptions);
  db = client.db('test');
});

afterAll(async () => {
  await client.close();
  await moduleRef.close();
  await mongod.stop();
});

/** Consultas ordenadas sobre `posts` que registró el profiler durante `run`. */
async function profiledFeedQueries(run: () => Promise<unknown>) {
  await db.command({ profile: 2 });
  await run();
  await db.command({ profile: 0 });

  const entries = await db
    .collection('system.profile')
    .find({ op: 'query', ns: 'test.posts', 'command.sort': { $exists: true } })
    .toArray();
  // Cada viewer lee su propio profile.
  await db.collection('system.profile').drop();

  return entries;
}

const viewers: [string, () => Viewer][] = [
  ['anónimo', () => ({ kind: 'anonymous' })],
  [
    'usuario con sesión',
    () => ({ kind: 'user', id: followerId, role: 'user' }),
  ],
  // El admin no existe en Mongo: el rol viaja en el viewer.
  [
    'admin',
    () => ({ kind: 'user', id: new ObjectId().toString(), role: 'admin' }),
  ],
];

describe('PostsService.list: índice del feed', () => {
  beforeEach(async () => {
    await db.command({ profile: 0 });
  });

  it.each(viewers)(
    'el feed del %s usa el índice del feed y no ordena en memoria',
    async (_name, viewer) => {
      const entries = await profiledFeedQueries(() =>
        service.list({ limit: 10 }, viewer()),
      );

      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(entry.planSummary).toContain(`IXSCAN ${FEED_INDEX_KEY}`);
        expect(entry.hasSortStage).not.toBe(true);
      }
    },
  );
});
