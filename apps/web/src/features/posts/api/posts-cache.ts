import type { postPageSchema } from '@logpose/contracts/common/post.schemas';
import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type * as z from 'zod/v4';

import type { SessionUser } from '@/features/auth/api/session-user';
import { postsKeys } from '@/features/posts/api/posts.keys';
import type { PostPublic } from '@/features/posts/posts.types';
import { profileKeys } from '@/features/profile/api/profile.keys';
import type { ProfilePostsTab } from '@/features/profile/profile.types';

type PostsFeedPage = z.infer<typeof postPageSchema>;
export type PostsFeedInfiniteData = InfiniteData<
  PostsFeedPage,
  string | undefined
>;

const postPagesKeys = [postsKeys.feed(), profileKeys.postsTabs()];

/** Feed y pestañas del perfil guardan lo mismo: páginas `{ posts, nextCursor }`. */
function mapPostPages(
  queryClient: QueryClient,
  mapPosts: (posts: PostPublic[]) => PostPublic[],
) {
  for (const queryKey of postPagesKeys) {
    queryClient.setQueriesData<PostsFeedInfiniteData>(
      { queryKey },
      old =>
        old && {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            posts: mapPosts(page.posts),
          })),
        },
    );
  }
}

/** Para un update optimista: que una lectura en vuelo no lo pise al llegar. */
export function cancelPostPages(queryClient: QueryClient) {
  return Promise.all(
    postPagesKeys.map(queryKey => queryClient.cancelQueries({ queryKey })),
  );
}

/** Un retweet enseña los contadores de su original: se actualizan juntos. */
function mapInteractionPosts(
  queryClient: QueryClient,
  postId: string,
  mapper: (post: PostPublic) => PostPublic,
) {
  mapPostPages(queryClient, posts =>
    posts.map(post =>
      post._id === postId || (post.isRetweet && post.retweetOf === postId)
        ? mapper(post)
        : post,
    ),
  );
}

export function patchPostInCaches(
  queryClient: QueryClient,
  postId: string,
  patch: Partial<PostPublic>,
) {
  mapInteractionPosts(queryClient, postId, post => ({ ...post, ...patch }));
}

/** Devuelve lo que había: si la mutación falla, se restaura con `patchPostInCaches`. */
export function togglePostInCaches(
  queryClient: QueryClient,
  postId: string,
  boolKey: 'userLiked' | 'userBookmarked' | 'userRetweeted',
  countKey: 'likesCount' | 'bookmarksCount' | 'retweetsCount',
) {
  let previous: Partial<PostPublic> | undefined;

  mapInteractionPosts(queryClient, postId, post => {
    // Original y envoltorios llevan los mismos valores (la API pinta el retweet con su original).
    previous ??= { [boolKey]: post[boolKey], [countKey]: post[countKey] };
    const active = !post[boolKey];

    return {
      ...post,
      [boolKey]: active,
      [countKey]: Math.max(0, post[countKey] + (active ? 1 : -1)),
    };
  });

  return previous;
}

export function prependPostToFeed(queryClient: QueryClient, post: PostPublic) {
  if (post.visibility !== 'public' || post.isDeleted) {
    return;
  }

  queryClient.setQueryData<PostsFeedInfiniteData>(postsKeys.feed(), old => {
    const [firstPage, ...restPages] = old?.pages ?? [];

    if (!old || !firstPage) {
      return {
        pages: [{ posts: [post], nextCursor: null }],
        pageParams: [undefined],
      };
    }

    return {
      ...old,
      pages: [
        { ...firstPage, posts: [post, ...firstPage.posts] },
        ...restPages,
      ],
    };
  });
}

export function replacePostInCaches(
  queryClient: QueryClient,
  optimisticId: string,
  post: PostPublic,
) {
  mapPostPages(queryClient, posts =>
    posts.map(item => (item._id === optimisticId ? post : item)),
  );
}

export function removePostFromCaches(queryClient: QueryClient, postId: string) {
  mapPostPages(queryClient, posts => posts.filter(post => post._id !== postId));
}

export function invalidateProfilePostQueries(
  queryClient: QueryClient,
  userId: string,
  tabs: ProfilePostsTab[],
) {
  void queryClient.invalidateQueries({ queryKey: profileKeys.stats(userId) });

  for (const tab of tabs) {
    void queryClient.invalidateQueries({
      queryKey: profileKeys.postsTab(userId, tab),
    });
  }
}

export function createOptimisticPost(
  user: SessionUser,
  text: string,
  images?: string[],
): PostPublic {
  return {
    _id: `optimistic-${Date.now()}`,
    text,
    images,
    userId: {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      displayName: user.displayName,
      verified: user.verified,
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
    createdAt: new Date().toISOString(),
    userLiked: false,
    userBookmarked: false,
    userRetweeted: false,
  };
}

export function revokeOptimisticImageUrls(urls?: string[]) {
  if (!urls?.length) {
    return;
  }

  for (const url of urls) {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}
