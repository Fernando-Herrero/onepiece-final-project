import type { postPageSchema } from '@logpose/contracts/common/post.schemas';
import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type * as z from 'zod/v4';

import type { SessionUser } from '@/features/auth/api/session-user';
import { postsKeys } from '@/features/posts/api/posts.keys';
import type { PostPublic } from '@/features/posts/posts.types';
import { profileKeys } from '@/features/profile/api/profile.keys';
import type { ProfilePostsTab } from '@/features/profile/profile.types';

export type PostsFeedPage = z.infer<typeof postPageSchema>;
export type PostsFeedInfiniteData = InfiniteData<
  PostsFeedPage,
  string | undefined
>;

function mapPostsInInfiniteFeed(
  queryClient: QueryClient,
  mapper: (post: PostPublic) => PostPublic,
) {
  queryClient.setQueryData<PostsFeedInfiniteData>(postsKeys.feed(), old => {
    if (!old) {
      return old;
    }

    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        posts: page.posts.map(mapper),
      })),
    };
  });
}

/** Feed y pestañas del perfil guardan lo mismo: páginas `{ posts, nextCursor }`. */
function mapPostPages(
  queryClient: QueryClient,
  mapPosts: (posts: PostPublic[]) => PostPublic[],
) {
  for (const queryKey of [postsKeys.feed(), profileKeys.postsTabs()]) {
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

export function patchPostInCaches(
  queryClient: QueryClient,
  postId: string,
  patch: Partial<PostPublic>,
) {
  mapPostPages(queryClient, posts =>
    posts.map(post => {
      if (post._id === postId) {
        return { ...post, ...patch };
      }

      if (post.isRetweet && post.retweetOf === postId) {
        return { ...post, ...patch };
      }

      return post;
    }),
  );
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

export function replaceOptimisticPostInFeed(
  queryClient: QueryClient,
  optimisticId: string,
  post: PostPublic,
) {
  mapPostsInInfiniteFeed(queryClient, item =>
    item._id === optimisticId ? post : item,
  );
}

export function removeOptimisticPostFromFeed(
  queryClient: QueryClient,
  optimisticId: string,
) {
  queryClient.setQueryData<PostsFeedInfiniteData>(postsKeys.feed(), old => {
    if (!old) {
      return old;
    }

    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        posts: page.posts.filter(post => post._id !== optimisticId),
      })),
    };
  });
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
