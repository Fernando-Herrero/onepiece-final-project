import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { postsKeys } from '@/features/posts/api/posts.keys';
import {
  patchPostInCaches,
  type PostsFeedInfiniteData,
  prependPostToFeed,
  removePostFromCaches,
  replaceOptimisticPostInFeed,
  togglePostInCaches,
} from '@/features/posts/api/posts-cache';
import type { PostPublic } from '@/features/posts/posts.types';
import { profileKeys } from '@/features/profile/api/profile.keys';

function makePost(id: string, overrides: Partial<PostPublic> = {}): PostPublic {
  return {
    _id: id,
    text: `texto ${id}`,
    userId: {
      _id: 'author-1',
      username: 'luffy',
      firstName: 'Monkey',
      lastName: 'D. Luffy',
      verified: false,
    },
    visibility: 'public',
    isDeleted: false,
    isRetweet: false,
    isReply: false,
    language: 'es',
    likesCount: 0,
    bookmarksCount: 0,
    commentsCount: 0,
    retweetsCount: 0,
    hashtags: [],
    mentions: [],
    retweets: [],
    ...overrides,
  };
}

function makeRetweet(
  id: string,
  of: string,
  overrides: Partial<PostPublic> = {},
) {
  return makePost(id, { isRetweet: true, retweetOf: of, ...overrides });
}

function makeCache(...posts: PostPublic[]): PostsFeedInfiniteData {
  return { pages: [{ posts, nextCursor: null }], pageParams: [undefined] };
}

const feedKey = postsKeys.feed();
const ownPostsKey = profileKeys.postsTab('user-1', 'posts');
const otherLikedKey = profileKeys.postsTab('user-2', 'liked');
const otherBookmarkedKey = profileKeys.postsTab('user-2', 'bookmarked');

const allKeys = [feedKey, ownPostsKey, otherLikedKey, otherBookmarkedKey];

function setup(...posts: PostPublic[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  });
  for (const key of allKeys) {
    queryClient.setQueryData(key, makeCache(...posts));
  }
  return queryClient;
}

function postsAt(queryClient: QueryClient, key: readonly unknown[]) {
  return (
    queryClient
      .getQueryData<PostsFeedInfiniteData>(key)
      ?.pages.flatMap(page => page.posts) ?? []
  );
}

describe('togglePostInCaches', () => {
  it.each([
    ['like', 'userLiked', 'likesCount'],
    ['guardado', 'userBookmarked', 'bookmarksCount'],
    ['retweet', 'userRetweeted', 'retweetsCount'],
  ] as const)(
    'activa el %s en el post y su envoltorio, en feed y pestañas',
    (_, boolKey, countKey) => {
      const queryClient = setup(
        makePost('p1', { [boolKey]: false, [countKey]: 3 }),
        makePost('p2', { [boolKey]: false, [countKey]: 7 }),
        makeRetweet('rt1', 'p1', { [countKey]: 3 }),
        makeRetweet('rt2', 'p2', { [countKey]: 7 }),
      );

      togglePostInCaches(queryClient, 'p1', boolKey, countKey);

      for (const key of allKeys) {
        const [p1, p2, rt1, rt2] = postsAt(queryClient, key);
        expect(p1).toMatchObject({ _id: 'p1', [boolKey]: true, [countKey]: 4 });
        expect(rt1).toMatchObject({
          _id: 'rt1',
          [boolKey]: true,
          [countKey]: 4,
        });
        expect(p2).toMatchObject({
          _id: 'p2',
          [boolKey]: false,
          [countKey]: 7,
        });
        expect(rt2).toMatchObject({ _id: 'rt2', [countKey]: 7 });
        expect(rt2).not.toHaveProperty(boolKey);
      }
    },
  );

  it.each([
    ['like', 'userLiked', 'likesCount'],
    ['guardado', 'userBookmarked', 'bookmarksCount'],
    ['retweet', 'userRetweeted', 'retweetsCount'],
  ] as const)(
    'desactiva el %s y baja el contador en 1',
    (_, boolKey, countKey) => {
      const queryClient = setup(
        makePost('p1', { [boolKey]: true, [countKey]: 3 }),
      );

      togglePostInCaches(queryClient, 'p1', boolKey, countKey);

      expect(postsAt(queryClient, feedKey)[0]).toMatchObject({
        [boolKey]: false,
        [countKey]: 2,
      });
    },
  );

  it('trata un booleano ausente como false', () => {
    const queryClient = setup(makePost('p1', { likesCount: 5 }));

    togglePostInCaches(queryClient, 'p1', 'userLiked', 'likesCount');

    expect(postsAt(queryClient, feedKey)[0]).toMatchObject({
      userLiked: true,
      likesCount: 6,
    });
  });

  it('no baja el contador de 0', () => {
    const queryClient = setup(
      makePost('p1', { userLiked: true, likesCount: 0 }),
    );

    togglePostInCaches(queryClient, 'p1', 'userLiked', 'likesCount');

    expect(postsAt(queryClient, feedKey)[0]).toMatchObject({
      userLiked: false,
      likesCount: 0,
    });
  });

  it('aplicarlo dos veces deja las cachés como estaban', () => {
    const queryClient = setup(
      makePost('p1', { userLiked: false, likesCount: 3 }),
      makeRetweet('rt1', 'p1', { userLiked: true, likesCount: 3 }),
      makePost('p2', { userLiked: true, likesCount: 9 }),
    );
    const before = allKeys.map(key =>
      structuredClone(postsAt(queryClient, key)),
    );

    togglePostInCaches(queryClient, 'p1', 'userLiked', 'likesCount');
    togglePostInCaches(queryClient, 'p1', 'userLiked', 'likesCount');

    expect(allKeys.map(key => postsAt(queryClient, key))).toEqual(before);
  });

  it('no crea consultas que no existían', () => {
    const queryClient = new QueryClient();

    togglePostInCaches(queryClient, 'p1', 'userLiked', 'likesCount');

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});

describe('patchPostInCaches', () => {
  it('escribe los campos en el post y sus envoltorios, en feed y pestañas', () => {
    const queryClient = setup(
      makePost('p1', { text: 'viejo' }),
      makeRetweet('rt1', 'p1', { text: 'viejo' }),
      makePost('p2', { text: 'otro' }),
    );

    patchPostInCaches(queryClient, 'p1', { text: 'nuevo', commentsCount: 2 });

    for (const key of allKeys) {
      const [p1, rt1, p2] = postsAt(queryClient, key);
      expect(p1).toMatchObject({ text: 'nuevo', commentsCount: 2 });
      expect(rt1).toMatchObject({ text: 'nuevo', commentsCount: 2 });
      expect(p2).toMatchObject({ text: 'otro', commentsCount: 0 });
    }
  });

  it('no crea consultas que no existían', () => {
    const queryClient = new QueryClient();

    patchPostInCaches(queryClient, 'p1', { text: 'nuevo' });

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});

describe('removePostFromCaches', () => {
  it('quita el post del feed y de las pestañas', () => {
    const queryClient = setup(makePost('p1'), makePost('p2'));

    removePostFromCaches(queryClient, 'p1');

    for (const key of allKeys) {
      expect(postsAt(queryClient, key).map(post => post._id)).toEqual(['p2']);
    }
  });

  it('quita un post optimista añadido con prependPostToFeed', () => {
    const queryClient = setup(makePost('p1'));

    prependPostToFeed(queryClient, makePost('optimistic-1'));
    expect(postsAt(queryClient, feedKey).map(post => post._id)).toEqual([
      'optimistic-1',
      'p1',
    ]);

    removePostFromCaches(queryClient, 'optimistic-1');

    expect(postsAt(queryClient, feedKey).map(post => post._id)).toEqual(['p1']);
  });

  it('no crea consultas que no existían', () => {
    const queryClient = new QueryClient();

    removePostFromCaches(queryClient, 'p1');

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});

describe('prependPostToFeed', () => {
  it('crea el feed si no existe', () => {
    const queryClient = new QueryClient();

    prependPostToFeed(queryClient, makePost('optimistic-1'));

    expect(postsAt(queryClient, feedKey).map(post => post._id)).toEqual([
      'optimistic-1',
    ]);
  });
});

describe('replaceOptimisticPostInFeed', () => {
  it('cambia el optimista por el post del servidor', () => {
    const queryClient = setup(makePost('optimistic-1'), makePost('p1'));

    replaceOptimisticPostInFeed(
      queryClient,
      'optimistic-1',
      makePost('server-1', { text: 'del servidor' }),
    );

    expect(
      postsAt(queryClient, feedKey).map(post => [post._id, post.text]),
    ).toEqual([
      ['server-1', 'del servidor'],
      ['p1', 'texto p1'],
    ]);
  });

  it('no crea consultas que no existían', () => {
    const queryClient = new QueryClient();

    replaceOptimisticPostInFeed(
      queryClient,
      'optimistic-1',
      makePost('server-1'),
    );

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});
