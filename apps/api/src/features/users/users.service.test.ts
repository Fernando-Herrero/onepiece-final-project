import 'reflect-metadata';

import { MongoTransactionService } from '@jperezmart/nest-mongodb';
import { DEFAULT_USER_PREFERENCES } from '@logpose/contracts/common/user.schemas';
import { type Db, MongoClient, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mongoClientOptions } from '../../integrations/mongodb/mongodb.config.js';
import type { Viewer } from '../auth/access.js';
import { SessionsPersistence } from '../auth/sessions.persistence.js';
import {
  type CommentDocument,
  CommentsPersistence,
} from '../comments/comments.persistence.js';
import { NotificationsPersistence } from '../notifications/notifications.persistence.js';
import type { PostDocument } from '../posts/posts.mappers.js';
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
let db: Db;
let usersPersistence: UsersPersistence;
let service: UsersService;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  client = await MongoClient.connect(mongod.getUri(), mongoClientOptions);
  db = client.db('test');

  usersPersistence = new UsersPersistence(db.collection('users'));
  await usersPersistence.onModuleInit();
  service = new UsersService(
    usersPersistence,
    new PostsPersistence(db.collection('posts')),
    new CommentsPersistence(db.collection('comments')),
    new NotificationsPersistence(db.collection('notifications')),
    new SessionsPersistence(db.collection('sessions')),
    new MongoTransactionService(client),
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

  it('null quita el campo del documento y deja los demás', async () => {
    const vivi = await usersPersistence.insert({
      ...newUser('vivi'),
      displayName: 'Miss Wednesday',
      bio: 'Princesa',
    });
    const viviId = vivi._id.toString();
    const viewer: Viewer = { kind: 'user', id: viviId, role: 'user' };

    const updated = await service.update(viviId, viewer, { displayName: null });
    const stored = await db.collection('users').findOne({ _id: vivi._id });

    expect(updated.displayName).toBeUndefined();
    expect(stored).not.toHaveProperty('displayName');
    expect(stored).toMatchObject({ bio: 'Princesa' });
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
      service.getLikedPosts(robinId, { kind: 'anonymous' }, {}),
    ).rejects.toMatchObject({ code: 'PRIVACY_DENIED' });
  });

  it('el dueño ve la lista, vacía sin posts', async () => {
    await expect(
      service.getLikedPosts(
        robinId,
        {
          kind: 'user',
          id: robinId,
          role: 'user',
        },
        {},
      ),
    ).resolves.toEqual({ posts: [], nextCursor: null });
  });

  it('un admin ve la lista, vacía sin posts', async () => {
    // El rol viaja en el viewer de sesión: el servicio no lo vuelve a leer de Mongo.
    const admin: Viewer = {
      kind: 'user',
      id: new ObjectId().toString(),
      role: 'admin',
    };

    await expect(service.getLikedPosts(robinId, admin, {})).resolves.toEqual({
      posts: [],
      nextCursor: null,
    });
  });
});

describe('UsersService.getById', () => {
  let namiId: string;
  let otherId: string;

  beforeAll(async () => {
    const nami = await usersPersistence.insert({
      ...newUser('nami'),
      phoneNumber: '600000000',
      address: 'Foosha Village',
    });
    namiId = nami._id.toString();
    otherId = (await usersPersistence.insert(newUser('usopp')))._id.toString();
  });

  const privateKeys = ['email', 'phoneNumber', 'address', 'preferences'];

  it('un anónimo recibe el perfil público, sin datos privados', async () => {
    const result = await service.getById(namiId, { kind: 'anonymous' });

    expect(result).toMatchObject({ access: 'public', username: 'nami' });
    privateKeys.forEach(key => expect(result).not.toHaveProperty(key));
  });

  it('otro usuario normal recibe el perfil público, sin datos privados', async () => {
    const viewer: Viewer = { kind: 'user', id: otherId, role: 'user' };

    const result = await service.getById(namiId, viewer);

    expect(result).toMatchObject({ access: 'public', username: 'nami' });
    privateKeys.forEach(key => expect(result).not.toHaveProperty(key));
  });

  it('el dueño recibe el perfil completo', async () => {
    const viewer: Viewer = { kind: 'user', id: namiId, role: 'user' };

    await expect(service.getById(namiId, viewer)).resolves.toMatchObject({
      access: 'full',
      email: 'nami@logpose.test',
      phoneNumber: '600000000',
      address: 'Foosha Village',
    });
  });

  it('un admin recibe el perfil completo', async () => {
    // El admin no existe en Mongo: el rol viaja en el viewer.
    const admin: Viewer = {
      kind: 'user',
      id: new ObjectId().toString(),
      role: 'admin',
    };

    await expect(service.getById(namiId, admin)).resolves.toMatchObject({
      access: 'full',
      email: 'nami@logpose.test',
      phoneNumber: '600000000',
      address: 'Foosha Village',
    });
  });
});

describe('UsersService.getPosts', () => {
  let frankyId: string;
  let publicId: string;
  let privateId: string;

  beforeAll(async () => {
    const postsPersistence = new PostsPersistence(
      client.db('test').collection('posts'),
    );
    const franky = await usersPersistence.insert(newUser('franky'));
    frankyId = franky._id.toString();
    publicId = (
      await postsPersistence.insert({
        text: 'franky public',
        userId: franky._id,
        visibility: 'public',
        language: 'es',
      })
    )._id.toString();
    privateId = (
      await postsPersistence.insert({
        text: 'franky private',
        userId: franky._id,
        visibility: 'private',
        language: 'es',
      })
    )._id.toString();
  });

  const tabIds = async (viewer: Viewer) =>
    (await service.getPosts(frankyId, viewer, {})).posts.map(post => post._id);

  it('un anónimo ve los públicos pero no los privados', async () => {
    const ids = await tabIds({ kind: 'anonymous' });

    expect(ids).toContain(publicId);
    expect(ids).not.toContain(privateId);
  });

  it('el dueño ve también sus posts privados', async () => {
    const ids = await tabIds({ kind: 'user', id: frankyId, role: 'user' });

    expect(ids).toContain(publicId);
    expect(ids).toContain(privateId);
  });

  it('un admin ve también los posts privados', async () => {
    const ids = await tabIds({
      kind: 'user',
      id: new ObjectId().toString(),
      role: 'admin',
    });

    expect(ids).toContain(publicId);
    expect(ids).toContain(privateId);
  });

  it('ningún post de la pestaña lleva likes ni bookmarks', async () => {
    const { posts } = await service.getPosts(
      frankyId,
      { kind: 'anonymous' },
      {},
    );

    expect(posts.length).toBeGreaterThan(0);
    posts.forEach(post => {
      expect(post).not.toHaveProperty('likes');
      expect(post).not.toHaveProperty('bookmarks');
    });
  });
});

describe('UsersService.getStats', () => {
  let brookId: string;

  beforeAll(async () => {
    const postsPersistence = new PostsPersistence(
      client.db('test').collection('posts'),
    );
    const brook = await usersPersistence.insert({
      ...newUser('brook'),
      privacy: {
        showPosts: true,
        showLikes: false,
        showBookmarked: true,
        showComments: true,
      },
    });
    brookId = brook._id.toString();
    await postsPersistence.insert({
      text: 'brook public',
      userId: brook._id,
      visibility: 'public',
      language: 'es',
    });
    await postsPersistence.insert({
      text: 'brook private',
      userId: brook._id,
      visibility: 'private',
      language: 'es',
    });
  });

  const owner = (): Viewer => ({ kind: 'user', id: brookId, role: 'user' });
  const admin = (): Viewer => ({
    kind: 'user',
    id: new ObjectId().toString(),
    role: 'admin',
  });

  it('con showLikes en false, un anónimo no recibe la clave likedPosts', async () => {
    const stats = await service.getStats(brookId, { kind: 'anonymous' });

    expect(stats).not.toHaveProperty('likedPosts');
  });

  it('con showLikes en false, el dueño recibe likedPosts', async () => {
    await expect(service.getStats(brookId, owner())).resolves.toHaveProperty(
      'likedPosts',
      0,
    );
  });

  it('con showLikes en false, un admin recibe likedPosts', async () => {
    await expect(service.getStats(brookId, admin())).resolves.toHaveProperty(
      'likedPosts',
      0,
    );
  });

  it('un anónimo cuenta en myPosts solo el post público', async () => {
    await expect(
      service.getStats(brookId, { kind: 'anonymous' }),
    ).resolves.toMatchObject({ myPosts: 1 });
  });

  it('el dueño cuenta en myPosts también su post privado', async () => {
    await expect(service.getStats(brookId, owner())).resolves.toMatchObject({
      myPosts: 2,
    });
  });
});

/**
 * El perfil P da like, guarda y comenta tres posts de O (público, privado y
 * para seguidores). F sigue a O; X no.
 */
async function seedProfileActivity(
  prefix: string,
  privacy: UserDocument['privacy'] = newUser(prefix).privacy,
) {
  const db = client.db('test');
  const postsPersistence = new PostsPersistence(db.collection('posts'));
  const comments = db.collection<CommentDocument>('comments');
  const profile = await usersPersistence.insert({
    ...newUser(`${prefix}_profile`),
    privacy,
  });
  const owner = await usersPersistence.insert(newUser(`${prefix}_owner`));
  const follower = await usersPersistence.insert(newUser(`${prefix}_follower`));
  const other = await usersPersistence.insert(newUser(`${prefix}_other`));
  await usersPersistence.addFollow(
    follower._id.toString(),
    owner._id.toString(),
  );

  const post = async (visibility: PostDocument['visibility']) =>
    (
      await postsPersistence.insert({
        text: `${prefix} ${visibility}`,
        userId: owner._id,
        visibility,
        language: 'es',
      })
    )._id.toString();
  const comment = (postId: string) =>
    comments.insertOne({
      _id: new ObjectId(),
      postId: new ObjectId(postId),
      author: profile._id,
      text: 'hola',
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  return {
    profileId: profile._id.toString(),
    followerId: follower._id.toString(),
    otherId: other._id.toString(),
    publicId: await post('public'),
    privateId: await post('private'),
    followersId: await post('followers'),
    comment,
    like: (postId: string) =>
      postsPersistence.toggleUserField(
        postId,
        profile._id.toString(),
        'likes',
        {},
      ),
    bookmark: (postId: string) =>
      postsPersistence.toggleUserField(
        postId,
        profile._id.toString(),
        'bookmarks',
        {},
      ),
  };
}

const userViewer = (id: string): Viewer => ({ kind: 'user', id, role: 'user' });
const adminViewer = (): Viewer => ({
  kind: 'user',
  id: new ObjectId().toString(),
  role: 'admin',
});

describe('UsersService, pestañas con posts ajenos privados y para seguidores', () => {
  let seed: Awaited<ReturnType<typeof seedProfileActivity>>;

  beforeAll(async () => {
    seed = await seedProfileActivity('tabs');
    for (const id of [seed.publicId, seed.privateId, seed.followersId]) {
      await seed.like(id);
      await seed.bookmark(id);
      await seed.comment(id);
    }
  });

  const tabs = [
    ['likes', 'getLikedPosts'],
    ['guardados', 'getBookmarkedPosts'],
    ['comentados', 'getCommentedPosts'],
  ] as const;

  describe.each(tabs)('pestaña de %s', (_name, method) => {
    const ids = async (viewer: Viewer) =>
      (await service[method](seed.profileId, viewer, {})).posts.map(
        post => post._id,
      );

    it('un anónimo solo ve el post público', async () => {
      await expect(ids({ kind: 'anonymous' })).resolves.toEqual([
        seed.publicId,
      ]);
    });

    it('un usuario que no sigue al dueño solo ve el post público', async () => {
      await expect(ids(userViewer(seed.otherId))).resolves.toEqual([
        seed.publicId,
      ]);
    });

    it('un seguidor del dueño ve también el post para seguidores', async () => {
      await expect(ids(userViewer(seed.followerId))).resolves.toEqual(
        expect.arrayContaining([seed.publicId, seed.followersId]),
      );
      await expect(ids(userViewer(seed.followerId))).resolves.toHaveLength(2);
    });

    it('un admin ve los tres', async () => {
      await expect(ids(adminViewer())).resolves.toEqual(
        expect.arrayContaining([
          seed.publicId,
          seed.privateId,
          seed.followersId,
        ]),
      );
      await expect(ids(adminViewer())).resolves.toHaveLength(3);
    });
  });
});

describe('UsersService.getStats con showComments en false', () => {
  let seed: Awaited<ReturnType<typeof seedProfileActivity>>;

  beforeAll(async () => {
    seed = await seedProfileActivity('nocomments', {
      showPosts: true,
      showLikes: true,
      showBookmarked: true,
      showComments: false,
    });
    await seed.comment(seed.publicId);
  });

  it('un anónimo no recibe commentedPosts ni totalComments', async () => {
    const stats = await service.getStats(seed.profileId, { kind: 'anonymous' });

    expect(stats).not.toHaveProperty('commentedPosts');
    expect(stats).not.toHaveProperty('totalComments');
  });

  it('el dueño del perfil sí los recibe', async () => {
    await expect(
      service.getStats(seed.profileId, userViewer(seed.profileId)),
    ).resolves.toMatchObject({ commentedPosts: 1, totalComments: 1 });
  });
});

describe('UsersService.getStats, totalComments y lo que no ves', () => {
  let seed: Awaited<ReturnType<typeof seedProfileActivity>>;

  beforeAll(async () => {
    seed = await seedProfileActivity('comments');
    await seed.comment(seed.privateId);
    await seed.comment(seed.privateId);
    await seed.comment(seed.publicId);
  });

  it('un anónimo recibe totalComments 1 y commentedPosts 1', async () => {
    await expect(
      service.getStats(seed.profileId, { kind: 'anonymous' }),
    ).resolves.toMatchObject({ totalComments: 1, commentedPosts: 1 });
  });

  it('un admin recibe totalComments 3 y commentedPosts 2', async () => {
    await expect(
      service.getStats(seed.profileId, adminViewer()),
    ).resolves.toMatchObject({ totalComments: 3, commentedPosts: 2 });
  });
});

describe('UsersService.getPosts, retweets', () => {
  let authorId: string;
  let retweeterId: string;
  let originalId: string;

  beforeAll(async () => {
    const postsPersistence = new PostsPersistence(
      client.db('test').collection('posts'),
    );
    const author = await usersPersistence.insert(newUser('rtab_author'));
    const retweeter = await usersPersistence.insert(newUser('rtab_retweeter'));
    const liker1 = await usersPersistence.insert(newUser('rtab_liker1'));
    const liker2 = await usersPersistence.insert(newUser('rtab_liker2'));
    authorId = author._id.toString();
    retweeterId = retweeter._id.toString();
    originalId = (
      await postsPersistence.insert({
        text: 'rtab original',
        userId: author._id,
        visibility: 'public',
        language: 'es',
      })
    )._id.toString();
    for (const liker of [liker1, liker2]) {
      await postsPersistence.toggleUserField(
        originalId,
        liker._id.toString(),
        'likes',
        {},
      );
    }
    await postsPersistence.toggleRetweet(originalId, retweeterId);
  });

  it('el envoltorio sale con el autor original y los contadores del original', async () => {
    const { posts } = await service.getPosts(
      retweeterId,
      userViewer(retweeterId),
      {},
    );

    expect(posts.find(post => post.retweetOf === originalId)).toMatchObject({
      isRetweet: true,
      originalAuthor: { username: 'rtab_author' },
      likesCount: 2,
      retweetsCount: 1,
      userRetweeted: true,
    });
  });

  it('para otro viewer, userRetweeted es false', async () => {
    const { posts } = await service.getPosts(
      retweeterId,
      userViewer(authorId),
      {},
    );

    expect(posts.find(post => post.retweetOf === originalId)).toMatchObject({
      userRetweeted: false,
    });
  });
});

describe('UsersService.follow y unfollow', () => {
  const create = async (username: string) =>
    (await usersPersistence.insert(newUser(username)))._id;
  const notificationsOf = (to: ObjectId, from: ObjectId) =>
    db.collection('notifications').find({ type: 'follow', to, from }).toArray();

  it('follow: A sigue a B y devuelve contadores y mensaje', async () => {
    const a = await create('fol_a1');
    const b = await create('fol_b1');

    await expect(service.follow(a.toString(), b.toString())).resolves.toEqual({
      message: 'Ahora sigues a @fol_b1',
      following: true,
      followersCount: 1,
      followingCount: 1,
    });
  });

  it('follow: B queda en following de A y A en followers de B', async () => {
    const a = await create('fol_a2');
    const b = await create('fol_b2');

    await service.follow(a.toString(), b.toString());

    const storedA = await usersPersistence.findById(a.toString());
    const storedB = await usersPersistence.findById(b.toString());
    expect(storedA?.following).toEqual([b]);
    expect(storedB?.followers).toEqual([a]);
  });

  it('follow: crea una notificación de follow para B desde A', async () => {
    const a = await create('fol_a3');
    const b = await create('fol_b3');

    await service.follow(a.toString(), b.toString());

    await expect(notificationsOf(b, a)).resolves.toHaveLength(1);
  });

  it('follow: seguir a quien ya sigues lanza ALREADY_FOLLOWING', async () => {
    const a = await create('fol_a4');
    const b = await create('fol_b4');
    await service.follow(a.toString(), b.toString());

    await expect(
      service.follow(a.toString(), b.toString()),
    ).rejects.toMatchObject({ code: 'ALREADY_FOLLOWING' });
  });

  it('unfollow: A deja de seguir a B y devuelve contadores a 0 y mensaje', async () => {
    const a = await create('fol_a5');
    const b = await create('fol_b5');
    await service.follow(a.toString(), b.toString());

    await expect(service.unfollow(a.toString(), b.toString())).resolves.toEqual(
      {
        message: 'Ya no sigues a @fol_b5',
        following: false,
        followersCount: 0,
        followingCount: 0,
      },
    );
    const storedA = await usersPersistence.findById(a.toString());
    const storedB = await usersPersistence.findById(b.toString());
    expect(storedA?.following).toEqual([]);
    expect(storedB?.followers).toEqual([]);
  });

  it('unfollow: no crea una notificación nueva', async () => {
    const a = await create('fol_a6');
    const b = await create('fol_b6');
    await service.follow(a.toString(), b.toString());

    await service.unfollow(a.toString(), b.toString());

    await expect(notificationsOf(b, a)).resolves.toHaveLength(1);
  });

  it('unfollow: dejar de seguir a quien no sigues lanza NOT_FOLLOWING', async () => {
    const a = await create('fol_a7');
    const b = await create('fol_b7');

    await expect(
      service.unfollow(a.toString(), b.toString()),
    ).rejects.toMatchObject({ code: 'NOT_FOLLOWING' });
  });

  it.each(['follow', 'unfollow'] as const)(
    '%s: uno mismo lanza CANNOT_FOLLOW_SELF',
    async method => {
      const a = (await create(`fol_self_${method}`)).toString();

      await expect(service[method](a, a)).rejects.toMatchObject({
        code: 'CANNOT_FOLLOW_SELF',
      });
    },
  );

  it.each(['follow', 'unfollow'] as const)(
    '%s: un target inexistente lanza USER_NOT_FOUND',
    async method => {
      const a = (await create(`fol_ghost_${method}`)).toString();

      await expect(
        service[method](a, new ObjectId().toString()),
      ).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
    },
  );
});

describe('UsersService, paginación por cursor de las pestañas del perfil', () => {
  const tabs = [
    ['posts', 'getPosts'],
    ['likes', 'getLikedPosts'],
    ['guardados', 'getBookmarkedPosts'],
    ['comentados', 'getCommentedPosts'],
  ] as const;

  let profileId: string;
  let viewerId: string;

  // Cuatro posts del perfil, a propósito sin insertar en orden cronológico. El
  // privado cae entre el más nuevo y el del medio: si ocupara hueco, la primera
  // página de 2 saldría con un solo post.
  beforeAll(async () => {
    const posts = db.collection<PostDocument>('posts');
    const comments = db.collection<CommentDocument>('comments');
    const postsPersistence = new PostsPersistence(posts);
    const profile = await usersPersistence.insert(newUser('pag_profile'));
    const viewer = await usersPersistence.insert(newUser('pag_viewer'));
    profileId = profile._id.toString();
    viewerId = viewer._id.toString();

    const seed = async (
      text: string,
      visibility: 'public' | 'private',
      createdAt: string,
    ) => {
      const post = await postsPersistence.insert({
        text,
        userId: profile._id,
        visibility,
        language: 'es',
      });
      await posts.updateOne(
        { _id: post._id },
        { $set: { createdAt: new Date(createdAt) } },
      );
      // Likes, guardados y comentarios en el mismo orden de inserción (no cronológico).
      await postsPersistence.toggleUserField(
        post._id.toString(),
        profileId,
        'likes',
        {},
      );
      await postsPersistence.toggleUserField(
        post._id.toString(),
        profileId,
        'bookmarks',
        {},
      );
      await comments.insertOne({
        _id: new ObjectId(),
        postId: post._id,
        author: profile._id,
        text: 'hola',
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    };

    await seed('pag medio', 'public', '2024-03-02T10:00:00Z');
    await seed('pag viejo', 'public', '2024-03-01T10:00:00Z');
    await seed('pag privado', 'private', '2024-03-03T10:00:00Z');
    await seed('pag nuevo', 'public', '2024-03-04T10:00:00Z');
  });

  describe.each(tabs)('pestaña de %s', (_name, method) => {
    it('la primera página trae los 2 más nuevos y un nextCursor', async () => {
      const page = await service[method](profileId, userViewer(viewerId), {
        limit: 2,
      });

      expect(page.posts.map(post => post.text)).toEqual([
        'pag nuevo',
        'pag medio',
      ]);
      expect(page.nextCursor).toEqual(expect.any(String));
    });

    it('con el cursor llega el que falta, sin repetidos y sin nextCursor', async () => {
      const first = await service[method](profileId, userViewer(viewerId), {
        limit: 2,
      });
      const second = await service[method](profileId, userViewer(viewerId), {
        limit: 2,
        cursor: first.nextCursor ?? undefined,
      });

      expect(second.posts.map(post => post.text)).toEqual(['pag viejo']);
      expect(second.nextCursor).toBeNull();
    });

    it('sin límite que parta la lista, devuelve los visibles sin el privado y nextCursor null', async () => {
      const page = await service[method](profileId, userViewer(viewerId), {
        limit: 10,
      });

      expect(page.posts.map(post => post.text)).toEqual([
        'pag nuevo',
        'pag medio',
        'pag viejo',
      ]);
      expect(page.nextCursor).toBeNull();
    });
  });
});
