import { POST_FEED_PAGE_SIZE } from '@logpose/contracts/common/post.schemas';
import { infiniteQueryOptions } from '@tanstack/react-query';

import { postsKeys } from '@/features/posts/api/posts.keys';
import type { OrpcClient } from '@/integrations/orpc/orpc.client';

export const getPostsQueriesOptions = (client: OrpcClient) => ({
  feedInfinite: () =>
    infiniteQueryOptions({
      queryKey: postsKeys.feed(),
      queryFn: ({ pageParam }) =>
        client.posts.list({
          limit: POST_FEED_PAGE_SIZE,
          cursor: pageParam,
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    }),
});
