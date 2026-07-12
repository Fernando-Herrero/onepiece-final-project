import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorFallback } from '@/components/error-boundary/query-error-fallback';
import {
  useCreatePostMutation,
  useDeletePostMutation,
  usePostsFeedInfinite,
} from '@/features/posts/api/use-posts';
import { CreatePostFab } from '@/features/posts/ui/create-post-fab.component';
import { CreatePostModal } from '@/features/posts/ui/create-post-modal.component';
import { PostCard } from '@/features/posts/ui/post-card.component';
import { PostFeedSkeleton } from '@/features/posts/ui/post-card-skeleton.component';

function CommunityFeed({
  onDeletePost,
  deletingPostId,
}: {
  onDeletePost: (postId: string) => void;
  deletingPostId?: string;
}) {
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostsFeedInfinite();
  const posts = data.pages.flatMap(page => page.posts);

  if (posts.length === 0) {
    return (
      <Text
        as="p"
        size="2"
        align="center"
        className="py-12 text-[#f4ede1]/50 italic"
      >
        {t('community.empty')}
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="3">
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onDeletePost={onDeletePost}
          isDeleting={deletingPostId === post._id}
        />
      ))}

      {hasNextPage ? (
        <Flex justify="center" pt="2">
          <Button
            type="button"
            variant="soft"
            color="gray"
            highContrast
            disabled={isFetchingNextPage}
            className="cursor-pointer"
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage
              ? t('community.load_more_pending')
              : t('community.load_more')}
          </Button>
        </Flex>
      ) : null}
    </Flex>
  );
}

export default function CommunityPageContent() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const createPost = useCreatePostMutation();
  const deletePost = useDeletePostMutation();

  return (
    <Box className="relative mx-auto max-w-2xl pb-24">
      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {t('community.title')}
      </Heading>
      <Text as="p" size="2" color="gray" mb="6" className="text-[#f4ede1]/75">
        {t('community.subtitle')}
      </Text>

      <ErrorBoundary FallbackComponent={QueryErrorFallback}>
        <Suspense fallback={<PostFeedSkeleton />}>
          <CommunityFeed
            onDeletePost={postId => deletePost.mutate(postId)}
            deletingPostId={
              deletePost.isPending ? deletePost.variables : undefined
            }
          />
        </Suspense>
      </ErrorBoundary>

      <CreatePostFab onClick={() => setCreateOpen(true)} />
      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onPublish={payload => createPost.mutate(payload)}
      />
    </Box>
  );
}
