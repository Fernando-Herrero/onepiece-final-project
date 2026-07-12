import { Avatar, Card, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { Icon } from '@/components/icons/icon';
import { useAuthSession } from '@/features/auth/api/use-auth';
import {
  DEFAULT_AVATAR_SRC,
  resolveAvatarSrc,
} from '@/features/avatar/avatar.constants';
import type { PostPublic } from '@/features/posts/posts.types';
import { PostCardActions } from '@/features/posts/ui/post-card-actions.component';
import { PostCardHeader } from '@/features/posts/ui/post-card-header.component';
import { PostMediaGrid } from '@/features/posts/ui/post-media-grid.component';
import { getUserDisplayName } from '@/features/profile/profile.constants';

export type { PostPublic } from '@/features/posts/posts.types';

type PostCardProps = {
  post: PostPublic;
  onDeletePost?: (postId: string) => void;
  isDeleting?: boolean;
};

export function PostCard({
  post,
  onDeletePost,
  isDeleting = false,
}: PostCardProps) {
  const { i18n, t } = useTranslation();
  const { user } = useAuthSession();
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const contentAuthor =
    post.isRetweet && post.originalAuthor ? post.originalAuthor : post.userId;
  const authorName = getUserDisplayName(contentAuthor);
  const avatarSrc = avatarLoadError
    ? DEFAULT_AVATAR_SRC
    : resolveAvatarSrc(contentAuthor.avatar);
  const isPublishing = post._id.startsWith('optimistic-');
  const isPending = isPublishing || isDeleting;
  const profileHref = `/dashboard/users/${contentAuthor._id}`;
  const interactionPostId =
    post.isRetweet && post.retweetOf ? post.retweetOf : post._id;
  const retweeterHref = `/dashboard/users/${post.userId._id}`;
  const retweeterName = getUserDisplayName(post.userId);

  return (
    <Card
      asChild
      className={`border border-[#f2d9a8]/10 bg-[#05070d]/40 p-4 transition-opacity ${
        isPending ? 'opacity-85' : ''
      }`}
    >
      <article>
        {post.isRetweet ? (
          <Flex
            align="center"
            gap="1"
            className="mb-2 text-xs text-[#f4ede1]/55"
          >
            <Icon.Repeat className="shrink-0 text-green-400/80" aria-hidden />
            {user?._id === post.userId._id ? (
              <Text as="span" size="1">
                {t('posts.retweeted_by_you')}
              </Text>
            ) : (
              <Text as="span" size="1">
                <Link
                  href={retweeterHref}
                  className="font-medium text-[#f2d9a8]/90 underline-offset-2 hover:underline"
                >
                  {retweeterName}
                </Link>{' '}
                {t('posts.retweeted')}
              </Text>
            )}
          </Flex>
        ) : null}

        <Flex gap="3" align="start">
          <Link href={profileHref} className="shrink-0">
            <Avatar
              src={avatarSrc}
              fallback={authorName.slice(0, 1).toUpperCase()}
              size={{ initial: '2', sm: '4' }}
              radius="full"
              className="border border-[#f2d9a8]/20"
              onLoadingStatusChange={status => {
                if (status === 'error') {
                  setAvatarLoadError(true);
                }
              }}
            />
          </Link>

          <Flex direction="column" gap="2" className="min-w-0 flex-1">
            <PostCardHeader
              post={post}
              author={contentAuthor}
              isPublishing={isPublishing}
              isDeleting={isDeleting}
              locale={i18n.language}
              onDeletePost={onDeletePost}
            />

            <Text
              as="p"
              size="2"
              className="whitespace-pre-wrap text-[#f4ede1]/90"
            >
              {post.text}
            </Text>

            {post.images?.length ? (
              <PostMediaGrid images={post.images} />
            ) : null}

            <PostCardActions
              post={post}
              interactionPostId={interactionPostId}
              isPublishing={isPublishing}
              isDeleting={isDeleting}
            />
          </Flex>
        </Flex>
      </article>
    </Card>
  );
}
