import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query';
import { useTranslation } from 'next-i18next/pages';
import { toast } from 'sonner';

import {
  createOptimisticPost,
  getSessionUser,
  getSessionUserId,
  invalidateProfilePostQueries,
  patchPostInCaches,
  type PostsFeedInfiniteData,
  prependPostToFeed,
  removeOptimisticPostFromFeed,
  removePostFromCaches,
  replaceOptimisticPostInFeed,
  revokeOptimisticImageUrls,
} from '@/features/posts/api/posts-cache';
import { uploadPostImages } from '@/features/posts/api/upload-post-images';
import type { PostPublic } from '@/features/posts/posts.types';
import type { ProfilePostsTab } from '@/features/profile/profile.types';
import { client } from '@/integrations/orpc/orpc.client';
import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

type CreatePostVariables = {
  text: string;
  files?: File[];
};

export type { CreatePostVariables };

const feedQueryKey = allQueriesOptions.posts.feedInfinite().queryKey;

function matchesInteractionPost(post: PostPublic, postId: string) {
  return post._id === postId || (post.isRetweet && post.retweetOf === postId);
}

export function usePostsFeedInfinite() {
  return useSuspenseInfiniteQuery(allQueriesOptions.posts.feedInfinite());
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ text, files }: CreatePostVariables) => {
      const images = files?.length ? await uploadPostImages(files) : undefined;
      return client.posts.create({ text, images });
    },
    onMutate: async body => {
      await queryClient.cancelQueries({ queryKey: feedQueryKey });

      const previousFeed =
        queryClient.getQueryData<PostsFeedInfiniteData>(feedQueryKey);
      const user = getSessionUser(queryClient);

      if (user) {
        const optimisticImageUrls = body.files?.length
          ? body.files.map(file => URL.createObjectURL(file))
          : undefined;
        const optimisticPost = createOptimisticPost(
          user,
          body.text.trim(),
          optimisticImageUrls,
        );
        prependPostToFeed(queryClient, optimisticPost);
        return {
          previousFeed,
          optimisticId: optimisticPost._id,
          optimisticImageUrls,
        };
      }

      return {
        previousFeed,
        optimisticId: null,
        optimisticImageUrls: undefined,
      };
    },
    onError: (_error, _body, context) => {
      revokeOptimisticImageUrls(context?.optimisticImageUrls);

      if (context?.previousFeed) {
        queryClient.setQueryData(feedQueryKey, context.previousFeed);
      } else if (context?.optimisticId) {
        removeOptimisticPostFromFeed(queryClient, context.optimisticId);
      }

      toast.error(t('posts.create_error'));
    },
    onSuccess: (post, _body, context) => {
      revokeOptimisticImageUrls(context.optimisticImageUrls);

      if (context.optimisticId) {
        replaceOptimisticPostInFeed(queryClient, context.optimisticId, post);
      } else {
        prependPostToFeed(queryClient, post);
      }

      const userId = getSessionUserId(queryClient);
      if (userId) {
        invalidateProfilePostQueries(queryClient, userId, ['posts']);
      }

      toast.success(t('posts.create_success'));
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (postId: string) =>
      client.posts.delete({ params: { id: postId } }),
    onError: () => {
      toast.error(t('posts.delete_error'));
    },
    onSuccess: (_post, postId) => {
      removePostFromCaches(queryClient, postId);

      const userId = getSessionUserId(queryClient);
      if (userId) {
        invalidateProfilePostQueries(queryClient, userId, [
          'posts',
          'liked',
          'bookmarked',
        ]);
      }

      toast.success(t('posts.delete_success'));
    },
  });
}

type ToggleFieldResult<
  BoolKey extends 'userLiked' | 'userBookmarked',
  CountKey extends 'likesCount' | 'bookmarksCount',
> = Record<BoolKey, boolean> & Record<CountKey, number>;

function useTogglePostFieldMutation<
  BoolKey extends 'userLiked' | 'userBookmarked',
  CountKey extends 'likesCount' | 'bookmarksCount',
>({
  mutationFn,
  boolKey,
  countKey,
  invalidateTab,
}: {
  mutationFn: (postId: string) => Promise<ToggleFieldResult<BoolKey, CountKey>>;
  boolKey: BoolKey;
  countKey: CountKey;
  invalidateTab: ProfilePostsTab;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: feedQueryKey });

      const previousFeed =
        queryClient.getQueryData<PostsFeedInfiniteData>(feedQueryKey);

      queryClient.setQueryData<PostsFeedInfiniteData>(feedQueryKey, old => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            posts: page.posts.map(post => {
              if (!matchesInteractionPost(post, postId)) {
                return post;
              }

              const active = !(post[boolKey] ?? false);
              return {
                ...post,
                [boolKey]: active,
                [countKey]: Math.max(0, post[countKey] + (active ? 1 : -1)),
              } as PostPublic;
            }),
          })),
        };
      });

      return { previousFeed };
    },
    onError: (_error, _postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(feedQueryKey, context.previousFeed);
      }
    },
    onSuccess: (result, postId) => {
      patchPostInCaches(queryClient, postId, {
        [countKey]: result[countKey],
        [boolKey]: result[boolKey],
      } as Partial<PostPublic>);

      const userId = getSessionUserId(queryClient);
      if (userId) {
        invalidateProfilePostQueries(queryClient, userId, [invalidateTab]);
      }
    },
  });
}

export function useTogglePostLikeMutation() {
  return useTogglePostFieldMutation({
    mutationFn: (postId: string) =>
      client.posts.toggleLike({ params: { id: postId } }),
    boolKey: 'userLiked',
    countKey: 'likesCount',
    invalidateTab: 'liked',
  });
}

export function useTogglePostBookmarkMutation() {
  return useTogglePostFieldMutation({
    mutationFn: (postId: string) =>
      client.posts.toggleBookmark({ params: { id: postId } }),
    boolKey: 'userBookmarked',
    countKey: 'bookmarksCount',
    invalidateTab: 'bookmarked',
  });
}

export function useTogglePostRetweetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      client.posts.toggleRetweet({ params: { id: postId } }),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: feedQueryKey });

      const previousFeed =
        queryClient.getQueryData<PostsFeedInfiniteData>(feedQueryKey);

      queryClient.setQueryData<PostsFeedInfiniteData>(feedQueryKey, old => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            posts: page.posts.map(post => {
              if (!matchesInteractionPost(post, postId)) {
                return post;
              }

              const active = !(post.userRetweeted ?? false);
              return {
                ...post,
                userRetweeted: active,
                retweetsCount: Math.max(
                  0,
                  post.retweetsCount + (active ? 1 : -1),
                ),
              };
            }),
          })),
        };
      });

      return { previousFeed };
    },
    onError: (_error, _postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(feedQueryKey, context.previousFeed);
      }
    },
    onSuccess: (result, originalPostId) => {
      patchPostInCaches(queryClient, originalPostId, {
        retweetsCount: result.retweetsCount,
        userRetweeted: result.userRetweeted,
      });

      if (result.retweeted && result.retweetPost) {
        prependPostToFeed(queryClient, result.retweetPost);
      } else if (result.removedRetweetPostId) {
        removePostFromCaches(queryClient, result.removedRetweetPostId);
      }

      const userId = getSessionUserId(queryClient);
      if (userId) {
        invalidateProfilePostQueries(queryClient, userId, ['posts']);
      }
    },
  });
}
