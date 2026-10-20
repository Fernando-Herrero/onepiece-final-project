import 'reflect-metadata';

import { DEFAULT_USER_PREFERENCES } from '@logpose/contracts/common/user.schemas';
import { type Db, MongoClient, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { Viewer } from '../auth/access.js';
import { CommentsPersistence } from '../comments/comments.persistence.js';
import { NotificationsPersistence } from '../notifications/notifications.persistence.js';
import { PostsPersistence } from '../posts/posts.persistence.js';
import type { UserDocument } from './user.mappers.js';
import { UsersPersistence } from './users.persistence.js';
import { UsersService } from './users.service.js';

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
let client: MongoClient;
let usersPersistence: UsersPersistence;
let service: UsersService;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  client = await MongoClient.connect(mongod.getUri());
  const db: Db = client.db('test');

  usersPersistence = new UsersPersistence(db.collection('users'));
  await usersPersistence.onModuleInit();
  service = new UsersService(
    usersPersistence,
    new PostsPersistence(db.collection('posts')),
    new CommentsPersistence(db.collection('comments')),
    new NotificationsPersistence(db.collection('notifications')),
  );
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

// Mongo real en memoria: el fallo nace del índice único, que un mock no tiene.
describe('UsersService.update', () => {
  it('un username que ya usa otro usuario lanza USERNAME_TAKEN', async () => {
    const luffy = await usersPersistence.insert(newUser('luffy'));
    const zoro = await usersPersistence.insert(newUser('zoro'));
    const zoroId = zoro._id.toString();
    const viewer: Viewer = { kind: 'user', id: zoroId, role: 'user' };

    await expect(
      service.update(zoroId, viewer, { username: luffy.username }),
    ).rejects.toMatchObject({ code: 'USERNAME_TAKEN' });
  });
});

describe('UsersService, pestaña privada del perfil', () => {
  let robinId: string;

  beforeAll(async () => {
    const robin = await usersPersistence.insert({
      ...newUser('robin'),
      privacy: {
        showPosts: true,
        showLikes: false,
        showBookmarked: true,
        showComments: true,
      },
    });
    robinId = robin._id.toString();
  });

  it('un anónimo recibe PRIVACY_DENIED', async () => {
    await expect(
      service.getLikedPosts(robinId, { kind: 'anonymous' }),
    ).rejects.toMatchObject({ code: 'PRIVACY_DENIED' });
  });

  it('el dueño ve la lista, vacía sin posts', async () => {
    await expect(
      service.getLikedPosts(robinId, {
        kind: 'user',
        id: robinId,
        role: 'user',
      }),
    ).resolves.toEqual([]);
  });

  it('un admin ve la lista, vacía sin posts', async () => {
    // El rol viaja en el viewer de sesión: el servicio no lo vuelve a leer de Mongo.
    const admin: Viewer = {
      kind: 'user',
      id: new ObjectId().toString(),
      role: 'admin',
    };

    await expect(service.getLikedPosts(robinId, admin)).resolves.toEqual([]);
  });
});
