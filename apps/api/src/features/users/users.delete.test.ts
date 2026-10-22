import 'reflect-metadata';

import { MongoModule } from '@jperezmart/nest-mongodb';
import { DEFAULT_USER_PREFERENCES } from '@logpose/contracts/common/user.schemas';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { type Db, MongoClient, ObjectId } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { mongoClientOptions } from '../../integrations/mongodb/mongodb.config.js';
import type { UserViewer } from '../auth/access.js';
import type { CommentDocument } from '../comments/comments.persistence.js';
import type { PostDocument } from '../posts/posts.mappers.js';
import { PostsModule } from '../posts/posts.module.js';
import { PostsService } from '../posts/posts.service.js';
import type { UserDocument } from './user.mappers.js';
import { UsersModule } from './users.module.js';
import { UsersService } from './users.service.js';

type SessionDocument = {
  _id: string;
  userId: ObjectId;
  expiresAt: Date;
  lastSeenAt: Date;
};

const DB_NAME = 'test';
const COLLECTIONS = [
  'users',
  'posts',
  'comments',
  'notifications',
  'sessions',
] as const;

/** Usuario completo como lo crea `AuthService.register`. */
const newUser = (
  username: string,
  follows: Pick<UserDocument, 'followers' | 'following'>,
): UserDocument => ({
  _id: ids[username as keyof typeof ids],
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
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  ...follows,
});

/** Post como lo deja `PostsPersistence.insert`, con las interacciones del escenario. */
const newPost = (
  _id: ObjectId,
  userId: ObjectId,
  minute: number,
  extra: Partial<PostDocument> = {},
): PostDocument => ({
  _id,
  text: `post ${minute}`,
  userId,
  images: [],
  visibility: 'public',
  isDeleted: false,
  isRetweet: false,
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
  createdAt: new Date(`2026-01-01T00:${String(minute).padStart(2, '0')}:00Z`),
  updatedAt: new Date(`2026-01-01T00:${String(minute).padStart(2, '0')}:00Z`),
  ...extra,
});

const newComment = (
  _id: ObjectId,
  postId: ObjectId,
  author: ObjectId,
  extra: Partial<CommentDocument> = {},
): CommentDocument => ({
  _id,
  postId,
  author,
  text: 'comentario',
  images: [],
  likes: [],
  likesCount: 0,
  repliesCount: 0,
  isReply: false,
  hashtags: [],
  mentions: [],
  isDeleted: false,
  source: 'web',
  language: 'es',
  createdAt: new Date('2026-01-01T01:00:00Z'),
  updatedAt: new Date('2026-01-01T01:00:00Z'),
  ...extra,
});

// `buggy` es la cuenta que se borra; `luffy` y `zoro` interactuaron con ella;
// `kaido` no tiene ninguna relación.
const ids = {
  buggy: new ObjectId(),
  luffy: new ObjectId(),
  zoro: new ObjectId(),
  kaido: new ObjectId(),
};
const post = {
  /** Original de buggy. */
  buggyOriginal: new ObjectId(),
  /** Retweet de buggy del post de luffy. */
  buggyRetweetOfLuffy: new ObjectId(),
  /**
   * Post de luffy: buggy le dio like, lo guardó, lo retuiteó, comentó dos veces
   * y respondió a un comentario de zoro.
   */
  luffy: new ObjectId(),
  /** Retweet de zoro del post de luffy. */
  zoroRetweetOfLuffy: new ObjectId(),
  /** Retweet de zoro del original de buggy. */
  zoroRetweetOfBuggy: new ObjectId(),
  /** Post de zoro: buggy y luffy comentaron una vez cada uno. */
  zoro: new ObjectId(),
  /** Post de kaido, sin relación. */
  kaido: new ObjectId(),
};
const comment = {
  /** Comentario de buggy en el post de luffy, con una respuesta de zoro. */
  buggyOnLuffy1: new ObjectId(),
  buggyOnLuffy2: new ObjectId(),
  zoroReplyToBuggy: new ObjectId(),
  /** Comentario de zoro en el post de luffy: like de buggy y de luffy, respuestas de buggy y de luffy. */
  zoroOnLuffy: new ObjectId(),
  buggyReplyToZoro: new ObjectId(),
  luffyReplyToZoro: new ObjectId(),
  /** Comentario de luffy ya borrado (soft) en su propio post: no cuenta. */
  luffyDeletedOnLuffy: new ObjectId(),
  buggyOnZoro: new ObjectId(),
  luffyOnZoro: new ObjectId(),
  zoroOnBuggy: new ObjectId(),
  buggyOnBuggy: new ObjectId(),
  kaidoOnKaido: new ObjectId(),
};
const notification = {
  buggyLikedLuffy: new ObjectId(),
  zoroFollowedBuggy: new ObjectId(),
  luffyFollowedZoro: new ObjectId(),
  kaidoLikedKaido: new ObjectId(),
};

let replSet: MongoMemoryReplSet;
let moduleRef: TestingModule;
let client: MongoClient;
let db: Db;
let usersService: UsersService;
let postsService: PostsService;

const viewerOf = (id: ObjectId): UserViewer => ({
  kind: 'user',
  id: id.toString(),
  role: 'user',
});

const deleteBuggy = () =>
  usersService.delete(ids.buggy.toString(), viewerOf(ids.buggy));

async function seed() {
  await db.collection<UserDocument>('users').insertMany([
    // buggy sigue a luffy; zoro sigue a buggy y a luffy.
    newUser('buggy', { followers: [ids.zoro], following: [ids.luffy] }),
    newUser('luffy', { followers: [ids.buggy, ids.zoro], following: [] }),
    newUser('zoro', { followers: [], following: [ids.buggy, ids.luffy] }),
    newUser('kaido', { followers: [], following: [] }),
  ]);

  await db.collection<PostDocument>('posts').insertMany([
    newPost(post.buggyOriginal, ids.buggy, 1, {
      retweets: [post.zoroRetweetOfBuggy],
      retweetsCount: 1,
      commentsCount: 2,
    }),
    newPost(post.luffy, ids.luffy, 2, {
      likes: [ids.zoro, ids.buggy, ids.luffy],
      likesCount: 3,
      bookmarks: [ids.buggy, ids.zoro],
      bookmarksCount: 2,
      retweets: [post.buggyRetweetOfLuffy, post.zoroRetweetOfLuffy],
      retweetsCount: 2,
      // Seis activos: los dos de buggy, el de zoro y las tres respuestas.
      commentsCount: 6,
    }),
    newPost(post.buggyRetweetOfLuffy, ids.buggy, 3, {
      isRetweet: true,
      retweetOf: post.luffy,
    }),
    newPost(post.zoroRetweetOfLuffy, ids.zoro, 4, {
      isRetweet: true,
      retweetOf: post.luffy,
    }),
    newPost(post.zoroRetweetOfBuggy, ids.zoro, 5, {
      isRetweet: true,
      retweetOf: post.buggyOriginal,
    }),
    newPost(post.zoro, ids.zoro, 6, {
      likes: [ids.buggy],
      likesCount: 1,
      commentsCount: 2,
    }),
    newPost(post.kaido, ids.kaido, 7, {
      likes: [ids.kaido],
      likesCount: 1,
      bookmarks: [ids.kaido],
      bookmarksCount: 1,
      commentsCount: 1,
    }),
  ]);

  await db.collection<CommentDocument>('comments').insertMany([
    newComment(comment.buggyOnLuffy1, post.luffy, ids.buggy, {
      repliesCount: 1,
    }),
    newComment(comment.buggyOnLuffy2, post.luffy, ids.buggy),
    newComment(comment.zoroReplyToBuggy, post.luffy, ids.zoro, {
      isReply: true,
      parentComment: comment.buggyOnLuffy1,
    }),
    newComment(comment.zoroOnLuffy, post.luffy, ids.zoro, {
      likes: [ids.buggy, ids.luffy],
      likesCount: 2,
      repliesCount: 2,
    }),
    newComment(comment.buggyReplyToZoro, post.luffy, ids.buggy, {
      isReply: true,
      parentComment: comment.zoroOnLuffy,
    }),
    newComment(comment.luffyReplyToZoro, post.luffy, ids.luffy, {
      isReply: true,
      parentComment: comment.zoroOnLuffy,
    }),
    newComment(comment.luffyDeletedOnLuffy, post.luffy, ids.luffy, {
      isDeleted: true,
    }),
    newComment(comment.buggyOnZoro, post.zoro, ids.buggy),
    newComment(comment.luffyOnZoro, post.zoro, ids.luffy),
    newComment(comment.zoroOnBuggy, post.buggyOriginal, ids.zoro),
    newComment(comment.buggyOnBuggy, post.buggyOriginal, ids.buggy),
    newComment(comment.kaidoOnKaido, post.kaido, ids.kaido, {
      likes: [ids.kaido],
      likesCount: 1,
    }),
  ]);

  const expiresAt = new Date('2099-01-01T00:00:00Z');
  const lastSeenAt = new Date('2026-01-01T00:00:00Z');
  await db.collection<SessionDocument>('sessions').insertMany([
    { _id: 'buggy-movil', userId: ids.buggy, expiresAt, lastSeenAt },
    { _id: 'buggy-portatil', userId: ids.buggy, expiresAt, lastSeenAt },
    { _id: 'luffy-movil', userId: ids.luffy, expiresAt, lastSeenAt },
    { _id: 'kaido-movil', userId: ids.kaido, expiresAt, lastSeenAt },
  ]);

  const createdAt = new Date('2026-01-01T02:00:00Z');
  await db.collection('notifications').insertMany([
    {
      _id: notification.buggyLikedLuffy,
      type: 'like',
      to: ids.luffy,
      from: ids.buggy,
      postId: post.luffy,
      read: false,
      createdAt,
      updatedAt: createdAt,
    },
    {
      _id: notification.zoroFollowedBuggy,
      type: 'follow',
      to: ids.buggy,
      from: ids.zoro,
      read: false,
      createdAt,
      updatedAt: createdAt,
    },
    {
      _id: notification.luffyFollowedZoro,
      type: 'follow',
      to: ids.zoro,
      from: ids.luffy,
      read: true,
      createdAt,
      updatedAt: createdAt,
    },
    {
      _id: notification.kaidoLikedKaido,
      type: 'like',
      to: ids.kaido,
      from: ids.kaido,
      postId: post.kaido,
      read: false,
      createdAt,
      updatedAt: createdAt,
    },
  ]);
}

/** Todos los documentos de cada colección, para comparar antes y después. */
async function snapshot() {
  const entries = await Promise.all(
    COLLECTIONS.map(
      async name =>
        [
          name,
          await db.collection(name).find().sort({ _id: 1 }).toArray(),
        ] as const,
    ),
  );
  return Object.fromEntries(entries);
}

const findById = (collection: string, _id: ObjectId) =>
  db.collection(collection).findOne({ _id });

const postById = (_id: ObjectId) =>
  db.collection<PostDocument>('posts').findOne({ _id });

const userById = (_id: ObjectId) =>
  db.collection<UserDocument>('users').findOne({ _id });

beforeAll(async () => {
  // Las transacciones exigen replica set; `failCommand` exige los comandos de test.
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    instanceOpts: [{ args: ['--setParameter', 'enableTestCommands=1'] }],
  });

  // Módulos reales: `init()` dispara los `onModuleInit` (índices).
  moduleRef = await Test.createTestingModule({
    imports: [
      MongoModule.forRoot(replSet.getUri(), {
        dbName: DB_NAME,
        ...mongoClientOptions,
      }),
      UsersModule,
      PostsModule,
    ],
  }).compile();
  await moduleRef.init();

  usersService = moduleRef.get(UsersService);
  postsService = moduleRef.get(PostsService);

  // Cliente aparte para sembrar y leer la base sin pasar por el código bajo prueba.
  client = await MongoClient.connect(replSet.getUri(), mongoClientOptions);
  db = client.db(DB_NAME);
}, 120_000);

afterAll(async () => {
  await client.close();
  await moduleRef.close();
  await replSet.stop();
});

beforeEach(async () => {
  // `deleteMany` y no `drop`: borrar la colección se llevaría los índices.
  await Promise.all(
    COLLECTIONS.map(name => db.collection(name).deleteMany({})),
  );
  await seed();
});

describe('UsersService.delete: borrado físico', () => {
  it('el usuario desaparece de la colección users', async () => {
    await deleteBuggy();

    expect(await findById('users', ids.buggy)).toBeNull();
  });

  it('sus posts y sus retweets desaparecen, no se marcan isDeleted', async () => {
    await deleteBuggy();

    expect(await findById('posts', post.buggyOriginal)).toBeNull();
    expect(await findById('posts', post.buggyRetweetOfLuffy)).toBeNull();
    expect(
      await db.collection('posts').countDocuments({ userId: ids.buggy }),
    ).toBe(0);
  });

  it('los retweets ajenos de sus posts desaparecen', async () => {
    await deleteBuggy();

    expect(await findById('posts', post.zoroRetweetOfBuggy)).toBeNull();
  });

  it('sus comentarios, los ajenos en sus posts y las respuestas ajenas a sus comentarios desaparecen', async () => {
    await deleteBuggy();

    for (const id of [
      comment.buggyOnLuffy1,
      comment.buggyOnLuffy2,
      comment.buggyReplyToZoro,
      comment.zoroReplyToBuggy,
      comment.buggyOnZoro,
      comment.buggyOnBuggy,
      comment.zoroOnBuggy,
    ]) {
      expect(await findById('comments', id)).toBeNull();
    }
  });

  it('sus sesiones desaparecen y las de otros siguen', async () => {
    await deleteBuggy();

    const remaining = await db
      .collection<SessionDocument>('sessions')
      .find()
      .sort({ _id: 1 })
      .toArray();
    expect(remaining.map(session => session._id)).toEqual([
      'kaido-movil',
      'luffy-movil',
    ]);
  });

  it('las notificaciones donde es from o to desaparecen y las demás siguen', async () => {
    await deleteBuggy();

    const remaining = await db
      .collection('notifications')
      .find()
      .sort({ _id: 1 })
      .toArray();
    expect(remaining.map(n => n._id.toString()).sort()).toEqual(
      [notification.luffyFollowedZoro, notification.kaidoLikedKaido]
        .map(String)
        .sort(),
    );
  });
});

describe('UsersService.delete: referencias en documentos ajenos', () => {
  it('su id sale de followers y following de los demás', async () => {
    await deleteBuggy();

    const luffy = await userById(ids.luffy);
    const zoro = await userById(ids.zoro);
    expect(luffy?.followers).toEqual([ids.zoro]);
    expect(zoro?.following).toEqual([ids.luffy]);
  });

  it('en el post ajeno que había likeado y guardado: likes 3→2 y bookmarks 2→1 sin su id', async () => {
    await deleteBuggy();

    expect(await postById(post.luffy)).toMatchObject({
      likes: [ids.zoro, ids.luffy],
      likesCount: 2,
      bookmarks: [ids.zoro],
      bookmarksCount: 1,
    });
  });

  it('en otro post ajeno que había likeado: likes 1→0', async () => {
    await deleteBuggy();

    expect(await postById(post.zoro)).toMatchObject({
      likes: [],
      likesCount: 0,
    });
  });

  it('el original ajeno que había retuiteado pierde su retweet: retweets 2→1', async () => {
    await deleteBuggy();

    expect(await postById(post.luffy)).toMatchObject({
      retweets: [post.zoroRetweetOfLuffy],
      retweetsCount: 1,
    });
  });

  it('commentsCount de cada post ajeno queda en sus comentarios activos: 6→2 y 2→1', async () => {
    await deleteBuggy();

    // En el de luffy quedan el comentario de zoro y la respuesta de luffy.
    expect((await postById(post.luffy))?.commentsCount).toBe(2);
    expect((await postById(post.zoro))?.commentsCount).toBe(1);
  });

  it('el comentario ajeno al que había respondido baja repliesCount: 2→1', async () => {
    await deleteBuggy();

    expect(await findById('comments', comment.zoroOnLuffy)).toMatchObject({
      repliesCount: 1,
    });
  });

  it('en el comentario ajeno que había likeado: likes 2→1 sin su id', async () => {
    await deleteBuggy();

    expect(await findById('comments', comment.zoroOnLuffy)).toMatchObject({
      likes: [ids.luffy],
      likesCount: 1,
    });
  });

  it('los datos de un tercero sin relación no cambian', async () => {
    const before = await snapshot();
    const unrelated = (data: typeof before) => ({
      user: data.users!.find(doc => doc._id.equals(ids.kaido)),
      post: data.posts!.find(doc => doc._id.equals(post.kaido)),
      comment: data.comments!.find(doc => doc._id.equals(comment.kaidoOnKaido)),
      session: data.sessions!.find(doc => String(doc._id) === 'kaido-movil'),
      notification: data.notifications!.find(doc =>
        doc._id.equals(notification.kaidoLikedKaido),
      ),
    });

    await deleteBuggy();

    const after = unrelated(await snapshot());
    expect(after.user).toBeDefined();
    expect(after.post).toBeDefined();
    expect(after).toEqual(unrelated(before));
  });
});

describe('UsersService.delete: transacción', () => {
  afterEach(async () => {
    await db
      .admin()
      .command({ configureFailPoint: 'failCommand', mode: 'off' });
  });

  /** Hace fallar una vez el próximo `command` sobre `collection`; 2 = BadValue, no transitorio. */
  const failNext = (command: 'delete' | 'update', collection: string) =>
    db.admin().command({
      configureFailPoint: 'failCommand',
      mode: { times: 1 },
      data: {
        failCommands: [command],
        namespace: `${DB_NAME}.${collection}`,
        errorCode: 2,
      },
    });

  it('si falla el borrado del usuario, no queda nada borrado ni modificado', async () => {
    const before = await snapshot();
    await failNext('delete', 'users');

    await expect(deleteBuggy()).rejects.toThrow();

    expect(await snapshot()).toEqual(before);
  });

  it('si falla la limpieza de contadores en posts ajenos, no queda nada borrado ni modificado', async () => {
    const before = await snapshot();
    await failNext('update', 'posts');

    await expect(deleteBuggy()).rejects.toThrow();

    expect(await snapshot()).toEqual(before);
  });
});

describe('notifications: índices', () => {
  const indexKeys = async () =>
    (await db.collection('notifications').indexes()).map(index =>
      JSON.stringify(index.key),
    );

  it('tiene un índice { to: 1, createdAt: -1 }', async () => {
    expect(await indexKeys()).toContain(
      JSON.stringify({ to: 1, createdAt: -1 }),
    );
  });

  it('tiene un índice { from: 1 }', async () => {
    expect(await indexKeys()).toContain(JSON.stringify({ from: 1 }));
  });
});

describe('lecturas de quien interactuó con la cuenta borrada', () => {
  it.each([
    ['luffy', ids.luffy],
    ['zoro', ids.zoro],
  ])('el feed de %s no lanza error', async (_name, id) => {
    await deleteBuggy();

    await expect(
      postsService.list({ limit: 20 }, viewerOf(id)),
    ).resolves.toBeDefined();
  });

  it.each([
    ['getPosts', 'luffy', ids.luffy],
    ['getLikedPosts', 'luffy', ids.luffy],
    ['getBookmarkedPosts', 'luffy', ids.luffy],
    ['getPosts', 'zoro', ids.zoro],
    ['getLikedPosts', 'zoro', ids.zoro],
    ['getBookmarkedPosts', 'zoro', ids.zoro],
  ] as const)(
    'la pestaña %s del perfil de %s no lanza error',
    async (tab, _name, id) => {
      await deleteBuggy();

      await expect(
        usersService[tab](id.toString(), viewerOf(id), {}),
      ).resolves.toBeDefined();
    },
  );
});
