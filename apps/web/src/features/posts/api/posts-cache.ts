import type { listPostsOutputSchema } from '@logpose/contracts/features/posts/schemas';
import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type * as z from 'zod/v4';

import { authKeys } from '@/features/auth/api/auth.keys';
import { postsKeys } from '@/features/posts/api/posts.keys';
import type { PostPublic } from '@/features/posts/posts.types';
import { profileKeys } from '@/features/profile/api/profile.keys';
import type { ProfilePostsTab } from '@/features/profile/profile.types';
import type { ProfileUser } from '@/features/profile/profile.types';

export type PostsFeedPage = z.infer<typeof listPostsOutputSchema>;
export type PostsFeedInfiniteData = InfiniteData<
  PostsFeedPage,
  string | undefined
>;

export function getSessionUserId(queryClient: QueryClient) {
  return queryClient.getQueryData<ProfileUser>(authKeys.me())?._id;
}

export function getSessionUser(queryClient: QueryClient) {
  return queryClient.getQueryData<ProfileUser>(authKeys.me());
}

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

export function patchPostInCaches(
  queryClient: QueryClient,
  postId: string,
  patch: Partial<PostPublic>,
) {
  patchPostsMatching(queryClient, post => {
    if (post._id === postId) {
      return { ...post, ...patch };
    }

    if (post.isRetweet && post.retweetOf === postId) {
      return { ...post, ...patch };
    }

    return post;
  });
}

function patchPostsMatching(
  queryClient: QueryClient,
  mapper: (post: PostPublic) => PostPublic,
) {
  mapPostsInInfiniteFeed(queryClient, mapper);

  queryClient.setQueriesData<PostPublic[]>(
    {
      predicate: query =>
        query.queryKey[0] === profileKeys.all[0] &&
        query.queryKey[1] === 'posts-tab',
    },
    old => old?.map(mapper),
  );
}

export function prependPostToFeed(queryClient: QueryClient, post: PostPublic) {
  if (post.visibility !== 'public' || post.isDeleted) {
    return;
  }

  queryClient.setQueryData<PostsFeedInfiniteData>(postsKeys.feed(), old => {
    if (!old?.pages.length) {
      return {
        pages: [{ posts: [post], nextCursor: null }],
        pageParams: [undefined],
      };
    }

    const [firstPage, ...restPages] = old.pages;

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
  queryClient.setQueryData<PostsFeedInfiniteData>(postsKeys.feed(), old => {
    if (!old) {
      return old;
    }

    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        posts: page.posts.filter(post => post._id !== postId),
      })),
    };
  });

  queryClient.setQueriesData<PostPublic[]>(
    {
      predicate: query =>
        query.queryKey[0] === profileKeys.all[0] &&
        query.queryKey[1] === 'posts-tab',
    },
    old => old?.filter(post => post._id !== postId),
  );
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
  user: ProfileUser,
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
    isPinned: false,
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
