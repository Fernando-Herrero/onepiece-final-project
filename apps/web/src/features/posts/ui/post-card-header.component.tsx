import { Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import type { PostPublic } from '@/features/posts/posts.types';
import { PostCardMenu } from '@/features/posts/ui/post-card-menu.component';
import { getUserDisplayName } from '@/features/profile/profile.constants';

type PostCardHeaderProps = {
  post: PostPublic;
  author: PostPublic['userId'];
  isPublishing: boolean;
  isDeleting: boolean;
  locale: string;
  onDeletePost?: (postId: string) => void;
};

export function PostCardHeader({
  post,
  author,
  isPublishing,
  isDeleting,
  locale,
  onDeletePost,
}: PostCardHeaderProps) {
  const { t } = useTranslation();
  const authorName = getUserDisplayName(author);
  const profileHref = `/dashboard/users/${author._id}`;
  const fullDateLabel = post.createdAt
    ? new Date(post.createdAt).toLocaleString(locale)
    : undefined;
  const relativeTimeLabel = post.createdAt
    ? formatPostRelativeTime(post.createdAt, locale)
    : null;

  return (
    <Flex align="start" justify="between" gap="2" className="min-w-0">
      <Flex
        align="center"
        gap="1"
        wrap="wrap"
        className="min-w-0 flex-1 text-[#f4ede1]/55"
      >
        <Link
          href={profileHref}
          className="max-w-[45%] truncate text-[#f2d9a8] underline-offset-2 hover:underline"
        >
          <Text as="span" size="2" weight="medium">
            {authorName}
          </Text>
        </Link>
        <Text as="span" size="1" color="gray">
          ·
        </Text>
        <Text as="span" size="1" color="gray" className="truncate">
          @{author.username}
        </Text>
        {relativeTimeLabel ? (
          <>
            <Text as="span" size="1" color="gray">
              ·
            </Text>
            <time
              dateTime={post.createdAt}
              title={fullDateLabel}
              className="shrink-0 text-xs text-[#f4ede1]/55"
            >
              {relativeTimeLabel}
            </time>
          </>
        ) : null}
        {isPublishing ? (
          <>
            <Text as="span" size="1" color="gray">
              ·
            </Text>
            <Text as="span" size="1" color="amber">
              {t('posts.pending_publish')}
            </Text>
          </>
        ) : null}
        {isDeleting ? (
          <>
            <Text as="span" size="1" color="gray">
              ·
            </Text>
            <Text as="span" size="1" color="amber">
              {t('posts.pending_delete')}
            </Text>
          </>
        ) : null}
      </Flex>
      {!isPublishing && !isDeleting ? (
        <PostCardMenu post={post} onDeletePost={onDeletePost} />
      ) : null}
    </Flex>
  );
}

function formatPostRelativeTime(iso: string, locale: string) {
  const date = new Date(iso);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, unitSeconds] of units) {
    const value = Math.round(diffSeconds / unitSeconds);
    if (Math.abs(value) >= 1 || unit === 'second') {
      return formatter.format(value, unit);
    }
  }

  return formatter.format(0, 'second');
}
