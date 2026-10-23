import 'reflect-metadata';

import { DEFAULT_USER_PREFERENCES } from '@logpose/contracts/common/user.schemas';
import { type Db, MongoClient, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mongoClientOptions } from '../../integrations/mongodb/mongodb.config.js';
import type { UserViewer, Viewer } from '../auth/access.js';
import { NotificationsPersistence } from '../notifications/notifications.persistence.js';
import type { UserDocument } from '../users/user.mappers.js';
import { UsersPersistence } from '../users/users.persistence.js';
import type { PostDocument } from './posts.mappers.js';
import { PostsPersistence } from './posts.persistence.js';
import { PostsService } from './posts.service.js';

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
  lastWatchedEpisode: 0,
  unlockedCards: {
    characters: [],
    items: [],
    fruits: [],
    swords: [],
    boats: [],
  },
  followers: [],
  following: [],
});

const userViewer = (id: string): UserViewer => ({
  kind: 'user',
  id,
  role: 'user',
});

/** El admin no existe en Mongo: el rol viaja en el viewer. */
const adminViewer = (): Viewer => ({
  kind: 'user',
  id: new ObjectId().toString(),
  role: 'admin',
});

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let usersPersistence: UsersPersistence;
let postsPersistence: PostsPersistence;
let service: PostsService;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  client = await MongoClient.connect(mongod.getUri(), mongoClientOptions);
  db = client.db('test');

  usersPersistence = new UsersPersistence(db.collection('users'));
  await usersPersistence.onModuleInit();
  postsPersistence = new PostsPersistence(db.collection('posts'));
  service = new PostsService(
    postsPersistence,
    usersPersistence,
    new NotificationsPersistence(db.collection('notifications')),
  );
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

/** Siembra un dueño con un post de cada visibilidad, un seguidor y un ajeno. */
async function seedOwnerWithPosts(prefix: string) {
  const owner = await usersPersistence.insert(newUser(`${prefix}_owner`));
  const follower = await usersPersistence.insert(newUser(`${prefix}_follower`));
  const other = await usersPersistence.insert(newUser(`${prefix}_other`));
  const ownerId = owner._id.toString();
  const followerId = follower._id.toString();
  await usersPersistence.addFollow(followerId, ownerId);

  const post = (visibility: PostDocument['visibility']) =>
    postsPersistence.insert({
      text: `${prefix} ${visibility}`,
      userId: owner._id,
      visibility,
      language: 'es',
    });

  return {
    ownerId,
    followerId,
    otherId: other._id.toString(),
    publicId: (await post('public'))._id.toString(),
    privateId: (await post('private'))._id.toString(),
    followersId: (await post('followers'))._id.toString(),
  };
}

// El límite máximo del contrato basta: el fichero siembra menos de 50 posts.
const feed = (viewer: Viewer) => service.list({ limit: 50 }, viewer);

const feedIds = async (viewer: Viewer) =>
  (await feed(viewer)).posts.map(post => post._id);

describe('PostsService.list', () => {
  let seed: Awaited<ReturnType<typeof seedOwnerWithPosts>>;
  let orphanRetweetId: string;

  beforeAll(async () => {
    seed = await seedOwnerWithPosts('feed');

    // Retweet público de un post público: debe salir y serializarse sin arrays.
    await postsPersistence.toggleRetweet(seed.publicId, seed.otherId);

    // Retweet antiguo de un post que hoy es privado: el wrapper es público.
    const now = new Date();
    orphanRetweetId = new ObjectId().toString();
    await db.collection<PostDocument>('posts').insertOne({
      _id: new ObjectId(orphanRetweetId),
      text: 'feed private',
      userId: new ObjectId(seed.followerId),
      images: [],
      visibility: 'public',
      isDeleted: false,
      isRetweet: true,
      retweetOf: new ObjectId(seed.privateId),
      isReply: false,
      language: 'es',
      likes: [],
      bookmarks: [],
      likesCount: 0,
      bookmarksCount: 0,
      commentsCount: 0,
      retweetsCount: 0,
      hashtags: [],
      mentions: [],
      retweets: [],
      createdAt: now,
      updatedAt: now,
    });
  });

  it('un anónimo solo ve los posts públicos', async () => {
    const ids = await feedIds({ kind: 'anonymous' });

    expect(ids).toContain(seed.publicId);
    expect(ids).not.toContain(seed.privateId);
    expect(ids).not.toContain(seed.followersId);
  });

  it('otro usuario que no sigue al dueño solo ve los posts públicos', async () => {
    const ids = await feedIds(userViewer(seed.otherId));

    expect(ids).toContain(seed.publicId);
    expect(ids).not.toContain(seed.privateId);
    expect(ids).not.toContain(seed.followersId);
  });

  it('un seguidor ve también los posts para seguidores del dueño', async () => {
    const ids = await feedIds(userViewer(seed.followerId));

    expect(ids).toContain(seed.publicId);
    expect(ids).toContain(seed.followersId);
    expect(ids).not.toContain(seed.privateId);
  });

  it('el dueño ve también sus posts privados y para seguidores', async () => {
    const ids = await feedIds(userViewer(seed.ownerId));

    expect(ids).toContain(seed.publicId);
    expect(ids).toContain(seed.privateId);
    expect(ids).toContain(seed.followersId);
  });

  it('un admin ve todos los posts', async () => {
    const ids = await feedIds(adminViewer());

    expect(ids).toContain(seed.publicId);
    expect(ids).toContain(seed.privateId);
    expect(ids).toContain(seed.followersId);
  });

  it('ningún post del feed lleva likes ni bookmarks, tampoco los retweets', async () => {
    const { posts } = await feed(adminViewer());

    expect(posts.some(post => post.isRetweet)).toBe(true);
    posts.forEach(post => {
      expect(post).not.toHaveProperty('likes');
      expect(post).not.toHaveProperty('bookmarks');
      expect(post).toHaveProperty('likesCount');
      expect(post).toHaveProperty('bookmarksCount');
    });
  });

  it('un retweet cuyo original no puede ver el viewer no sale en su feed', async () => {
    await expect(feedIds({ kind: 'anonymous' })).resolves.not.toContain(
      orphanRetweetId,
    );
    await expect(feedIds(userViewer(seed.otherId))).resolves.not.toContain(
      orphanRetweetId,
    );
  });
});

describe('PostsService.toggleLike y toggleBookmark', () => {
  let seed: Awaited<ReturnType<typeof seedOwnerWithPosts>>;

  beforeAll(async () => {
    seed = await seedOwnerWithPosts('toggle');
  });

  it('dos likes seguidos del mismo usuario: el primero lo da y el segundo lo quita', async () => {
    const viewer = userViewer(seed.otherId);

    await expect(
      service.toggleLike(seed.publicId, viewer),
    ).resolves.toMatchObject({ liked: true, likesCount: 1 });
    await expect(
      service.toggleLike(seed.publicId, viewer),
    ).resolves.toMatchObject({ liked: false, likesCount: 0 });
  });

  it('dos bookmarks seguidos del mismo usuario: el primero lo guarda y el segundo lo quita', async () => {
    const viewer = userViewer(seed.otherId);

    await expect(
      service.toggleBookmark(seed.publicId, viewer),
    ).resolves.toMatchObject({ bookmarked: true, bookmarksCount: 1 });
    await expect(
      service.toggleBookmark(seed.publicId, viewer),
    ).resolves.toMatchObject({ bookmarked: false, bookmarksCount: 0 });
  });

  it('un seguidor puede dar like a un post para seguidores', async () => {
    await expect(
      service.toggleLike(seed.followersId, userViewer(seed.followerId)),
    ).resolves.toMatchObject({ liked: true, likesCount: 1 });
  });

  it('like sobre un post privado ajeno lanza POST_NOT_FOUND', async () => {
    await expect(
      service.toggleLike(seed.privateId, userViewer(seed.otherId)),
    ).rejects.toMatchObject({ code: 'POST_NOT_FOUND' });
  });

  it('like sobre un post para seguidores sin seguir al dueño lanza POST_NOT_FOUND', async () => {
    await expect(
      service.toggleLike(seed.followersId, userViewer(seed.otherId)),
    ).rejects.toMatchObject({ code: 'POST_NOT_FOUND' });
  });

  it('bookmark sobre un post privado ajeno lanza POST_NOT_FOUND', async () => {
    await expect(
      service.toggleBookmark(seed.privateId, userViewer(seed.otherId)),
    ).rejects.toMatchObject({ code: 'POST_NOT_FOUND' });
  });
});

describe('PostsService.toggleRetweet', () => {
  let seed: Awaited<ReturnType<typeof seedOwnerWithPosts>>;

  beforeAll(async () => {
    seed = await seedOwnerWithPosts('retweet');
  });

  it('retweet de un post privado ajeno lanza POST_NOT_FOUND', async () => {
    await expect(
      service.toggleRetweet(seed.privateId, userViewer(seed.otherId)),
    ).rejects.toMatchObject({ code: 'POST_NOT_FOUND' });
  });

  it('retweet de un post para seguidores sin seguir al dueño lanza POST_NOT_FOUND', async () => {
    await expect(
      service.toggleRetweet(seed.followersId, userViewer(seed.otherId)),
    ).rejects.toMatchObject({ code: 'POST_NOT_FOUND' });
  });

  it('retweet del propio post privado lanza FORBIDDEN', async () => {
    await expect(
      service.toggleRetweet(seed.privateId, userViewer(seed.ownerId)),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('retweet de un post para seguidores de alguien a quien sigue lanza FORBIDDEN', async () => {
    await expect(
      service.toggleRetweet(seed.followersId, userViewer(seed.followerId)),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

describe('PostsService.delete', () => {
  let seed: Awaited<ReturnType<typeof seedOwnerWithPosts>>;

  beforeAll(async () => {
    seed = await seedOwnerWithPosts('delete');
  });

  it('borrar un post privado ajeno lanza POST_NOT_FOUND, no FORBIDDEN', async () => {
    await expect(
      service.delete(seed.privateId, userViewer(seed.otherId)),
    ).rejects.toMatchObject({ code: 'POST_NOT_FOUND' });
  });

  it('un seguidor que borra un post para seguidores del dueño recibe FORBIDDEN', async () => {
    await expect(
      service.delete(seed.followersId, userViewer(seed.followerId)),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('el dueño borra su propio post privado y deja de salir en su feed', async () => {
    const owner = userViewer(seed.ownerId);

    await expect(service.delete(seed.privateId, owner)).resolves.toMatchObject({
      _id: seed.privateId,
    });
    await expect(feedIds(owner)).resolves.not.toContain(seed.privateId);
  });
});

describe('PostsService, toggles concurrentes', () => {
  let seed: Awaited<ReturnType<typeof seedOwnerWithPosts>>;

  beforeAll(async () => {
    seed = await seedOwnerWithPosts('concurrent');
  });

  const storedPost = async () =>
    (await db
      .collection<PostDocument>('posts')
      .findOne({ _id: new ObjectId(seed.publicId) }))!;

  it('dos toggleLike a la vez de quien ya tiene el like no rechazan y el contador cuadra', async () => {
    const viewer = userViewer(seed.otherId);
    await service.toggleLike(seed.publicId, viewer);

    await expect(
      Promise.all([
        service.toggleLike(seed.publicId, viewer),
        service.toggleLike(seed.publicId, viewer),
      ]),
    ).resolves.toHaveLength(2);

    const post = await storedPost();
    expect(post.likesCount).toBe(post.likes.length);
  });

  it('dos toggleBookmark a la vez de quien ya tiene el bookmark no rechazan y el contador cuadra', async () => {
    const viewer = userViewer(seed.otherId);
    await service.toggleBookmark(seed.publicId, viewer);

    await expect(
      Promise.all([
        service.toggleBookmark(seed.publicId, viewer),
        service.toggleBookmark(seed.publicId, viewer),
      ]),
    ).resolves.toHaveLength(2);

    const post = await storedPost();
    expect(post.bookmarksCount).toBe(post.bookmarks.length);
  });
});

describe('PostsService.list con cursor', () => {
  it('la segunda página tampoco trae posts invisibles y entre las dos salen todos los visibles sin repetir', async () => {
    const seed = await seedOwnerWithPosts('cursor');
    const viewer = userViewer(seed.otherId);

    // Del más nuevo al más viejo, con fechas futuras para quedar por delante
    // de los posts que siembran los demás tests: V = visible, I = invisible.
    const order = [
      ['V1', 'public'],
      ['I1', 'private'],
      ['I2', 'followers'],
      ['V2', 'public'],
      ['I3', 'private'],
      ['V3', 'public'],
    ] as const;
    const base = Date.now() + 365 * 24 * 3600 * 1000;
    const ids = new Map<string, string>();
    for (const [index, [name, visibility]] of order.entries()) {
      const post = await postsPersistence.insert({
        text: `cursor ${name}`,
        userId: new ObjectId(seed.ownerId),
        visibility,
        language: 'es',
      });
      await db
        .collection<PostDocument>('posts')
        .updateOne(
          { _id: post._id },
          { $set: { createdAt: new Date(base - index * 1000) } },
        );
      ids.set(name, post._id.toString());
    }

    const first = await service.list({ limit: 2 }, viewer);
    const second = await service.list(
      { limit: 2, cursor: first.nextCursor! },
      viewer,
    );
    const seen = [...first.posts, ...second.posts].map(post => post._id);

    expect(first.nextCursor).not.toBeNull();
    expect(new Set(seen).size).toBe(seen.length);
    expect(seen.filter(id => [...ids.values()].includes(id))).toEqual([
      ids.get('V1'),
      ids.get('V2'),
      ids.get('V3'),
    ]);
  });
});

describe('PostsService, retweet de un post público', () => {
  let seed: Awaited<ReturnType<typeof seedOwnerWithPosts>>;
  let retweeterId: string;

  beforeAll(async () => {
    seed = await seedOwnerWithPosts('rtcard');
    retweeterId = seed.otherId;
    // Dos likes ajenos al original: el seguidor y el propio dueño.
    await service.toggleLike(seed.publicId, userViewer(seed.followerId));
    await service.toggleLike(seed.publicId, userViewer(seed.ownerId));
    await service.toggleRetweet(seed.publicId, userViewer(retweeterId));
  });

  const wrapper = async (viewer: Viewer) =>
    (await feed(viewer)).posts.find(
      post => post.isRetweet && post.retweetOf === seed.publicId,
    );

  it('sale en el feed con el autor original y los contadores del original', async () => {
    await expect(wrapper(userViewer(seed.ownerId))).resolves.toMatchObject({
      isRetweet: true,
      retweetOf: seed.publicId,
      originalAuthor: { username: 'rtcard_owner' },
      likesCount: 2,
      retweetsCount: 1,
    });
  });

  it('userLiked refleja el like del viewer sobre el original', async () => {
    await expect(wrapper(userViewer(seed.followerId))).resolves.toMatchObject({
      userLiked: true,
    });
    await expect(wrapper(userViewer(retweeterId))).resolves.toMatchObject({
      userLiked: false,
    });
  });

  it('userRetweeted es true para quien retuiteó y false para los demás', async () => {
    await expect(wrapper(userViewer(retweeterId))).resolves.toMatchObject({
      userRetweeted: true,
    });
    await expect(wrapper(userViewer(seed.followerId))).resolves.toMatchObject({
      userRetweeted: false,
    });
  });
});

describe('PostsService.toggleRetweet, respuesta', () => {
  it('retuitear devuelve el retweet y deshacerlo devuelve su id', async () => {
    const seed = await seedOwnerWithPosts('rttoggle');
    const viewer = userViewer(seed.otherId);

    const done = await service.toggleRetweet(seed.publicId, viewer);

    expect(done).toMatchObject({
      retweeted: true,
      userRetweeted: true,
      retweetsCount: 1,
      retweetPost: {
        retweetOf: seed.publicId,
        originalAuthor: { username: 'rttoggle_owner' },
      },
    });

    const undone = await service.toggleRetweet(seed.publicId, viewer);

    expect(undone).toMatchObject({
      retweeted: false,
      retweetsCount: 0,
      removedRetweetPostId: (done as { retweetPost: { _id: string } })
        .retweetPost._id,
    });
  });
});

describe('PostsService, notificaciones de like y bookmark', () => {
  const notificationsOf = (postId: string) =>
    db
      .collection('notifications')
      .find({ postId: new ObjectId(postId) })
      .toArray();

  it('el like de otro usuario crea una notificación para el dueño', async () => {
    const seed = await seedOwnerWithPosts('notiflike');

    await service.toggleLike(seed.publicId, userViewer(seed.otherId));

    const notifications = await notificationsOf(seed.publicId);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ type: 'like', read: false });
    expect(String(notifications[0]!.to)).toBe(seed.ownerId);
    expect(String(notifications[0]!.from)).toBe(seed.otherId);
  });

  it('el like del dueño a su propio post no crea notificación', async () => {
    const seed = await seedOwnerWithPosts('notiflikeown');

    await service.toggleLike(seed.publicId, userViewer(seed.ownerId));

    await expect(notificationsOf(seed.publicId)).resolves.toHaveLength(0);
  });

  it('el bookmark de otro usuario crea una notificación para el dueño', async () => {
    const seed = await seedOwnerWithPosts('notifbook');

    await service.toggleBookmark(seed.publicId, userViewer(seed.otherId));

    const notifications = await notificationsOf(seed.publicId);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ type: 'bookmark', read: false });
    expect(String(notifications[0]!.to)).toBe(seed.ownerId);
    expect(String(notifications[0]!.from)).toBe(seed.otherId);
  });

  it('el bookmark del dueño a su propio post no crea notificación', async () => {
    const seed = await seedOwnerWithPosts('notifbookown');

    await service.toggleBookmark(seed.publicId, userViewer(seed.ownerId));

    await expect(notificationsOf(seed.publicId)).resolves.toHaveLength(0);
  });
});
