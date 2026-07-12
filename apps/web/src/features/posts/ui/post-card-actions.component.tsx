import { Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { toast } from 'sonner';

import { Icon } from '@/components/icons/icon';
import { useAuthSession } from '@/features/auth/api/use-auth';
import {
  useTogglePostBookmarkMutation,
  useTogglePostLikeMutation,
  useTogglePostRetweetMutation,
} from '@/features/posts/api/use-posts';
import type { PostPublic } from '@/features/posts/posts.types';

type PostCardActionsProps = {
  post: PostPublic;
  interactionPostId: string;
  isPublishing: boolean;
  isDeleting: boolean;
};

export function PostCardActions({
  post,
  interactionPostId,
  isPublishing,
  isDeleting,
}: PostCardActionsProps) {
  const { t } = useTranslation();
  const { user } = useAuthSession();
  const toggleLike = useTogglePostLikeMutation();
  const toggleBookmark = useTogglePostBookmarkMutation();
  const toggleRetweet = useTogglePostRetweetMutation();

  const userLiked = post.userLiked ?? false;
  const userBookmarked = post.userBookmarked ?? false;
  const userRetweeted = post.userRetweeted ?? false;
  const isTogglingLike =
    toggleLike.isPending && toggleLike.variables === interactionPostId;
  const isTogglingBookmark =
    toggleBookmark.isPending && toggleBookmark.variables === interactionPostId;
  const isTogglingRetweet =
    toggleRetweet.isPending && toggleRetweet.variables === interactionPostId;
  const isPending = isPublishing || isDeleting;

  function requireSession(action: () => void) {
    if (!user) {
      toast.message(t('posts.login_to_interact'));
      return;
    }

    action();
  }

  const actionButtonClassName =
    'flex items-center gap-1 text-[#f4ede1]/70 transition hover:text-[#f2d9a8] disabled:opacity-50';

  return (
    <Flex align="center" gap="4" mt="1">
      <Flex align="center" gap="1" className="text-[#f4ede1]/50">
        <Icon.Comment aria-hidden />
        <Text as="span" size="1">
          {post.commentsCount}
        </Text>
      </Flex>

      <button
        type="button"
        aria-pressed={userRetweeted}
        aria-label={t('posts.retweet_action')}
        disabled={isTogglingRetweet || isPending || post.isRetweet}
        onClick={() =>
          requireSession(() => toggleRetweet.mutate(interactionPostId))
        }
        className={actionButtonClassName}
      >
        {userRetweeted ? (
          <Icon.RepeatFill className="text-green-400" aria-hidden />
        ) : (
          <Icon.Repeat aria-hidden />
        )}
        <Text as="span" size="1">
          {post.retweetsCount}
        </Text>
      </button>

      <button
        type="button"
        aria-pressed={userLiked}
        aria-label={t('posts.like_action')}
        disabled={isTogglingLike || isPending}
        onClick={() =>
          requireSession(() => toggleLike.mutate(interactionPostId))
        }
        className={actionButtonClassName}
      >
        {userLiked ? (
          <Icon.HeartFill className="text-red-400" aria-hidden />
        ) : (
          <Icon.Heart aria-hidden />
        )}
        <Text as="span" size="1">
          {post.likesCount}
        </Text>
      </button>

      <button
        type="button"
        aria-pressed={userBookmarked}
        aria-label={t('posts.bookmark_action')}
        disabled={isTogglingBookmark || isPending}
        onClick={() =>
          requireSession(() => toggleBookmark.mutate(interactionPostId))
        }
        className={actionButtonClassName}
      >
        {userBookmarked ? (
          <Icon.BookmarkFill className="text-sky-400" aria-hidden />
        ) : (
          <Icon.Bookmark aria-hidden />
        )}
        <Text as="span" size="1">
          {post.bookmarksCount}
        </Text>
      </button>
    </Flex>
  );
}
