import type { postPublicSchema } from '@logpose/contracts/common/post.schemas';
import { Avatar, Card, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import type * as z from 'zod/v4';

import {
  DEFAULT_AVATAR_SRC,
  resolveProfileAvatarSrc,
} from '@/features/profile/profile.constants';

export type PostPublic = z.infer<typeof postPublicSchema>;

type PostCardProps = {
  post: PostPublic;
};

function postAuthorDisplayName(post: PostPublic) {
  const displayName = post.userId.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  const fullName = `${post.userId.firstName}${post.userId.lastName}`.trim();
  return fullName || post.userId.username;
}

export function PostCard({ post }: PostCardProps) {
  const { t, i18n } = useTranslation();
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const authorName = postAuthorDisplayName(post);
  const resolvedAvatar = resolveProfileAvatarSrc(post.userId.avatar);
  const avatarSrc = avatarLoadError ? DEFAULT_AVATAR_SRC : resolvedAvatar;
  const createdAtLabel = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(i18n.language)
    : null;
  const profileHref = `/dashboard/users/${post.userId._id}`;

  return (
    <Card asChild className="border border-[#f2d9a8]/10 bg-[#05070d]/40 p-4">
      <article>
        <Flex gap="3" align="start">
          <Link href={profileHref} className="shrink-0">
            <Avatar
              src={avatarSrc}
              fallback={authorName.slice(0, 1).toUpperCase()}
              size="2"
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
            <Flex direction="column" gap="0">
              <Link
                href={profileHref}
                className="w-fit text-[#f2d9a8] underline-offset-2 hover:underline"
              >
                <Text as="span" size="2" weight="medium">
                  {authorName}
                </Text>
              </Link>
              <Text as="p" size="1" color="gray">
                @{post.userId.username}
                {createdAtLabel ? ` · ${createdAtLabel}` : ''}
              </Text>
            </Flex>

            <Text
              as="p"
              size="2"
              className="whitespace-pre-wrap text-[#f4ede1]/90"
            >
              {post.text}
            </Text>

            <Flex gap="3">
              <Text as="span" size="1" color="gray">
                {t('profile.post_likes_count', { count: post.likesCount })}
              </Text>
              <Text as="span" size="1" color="gray">
                {t('profile.post_comments_count', {
                  count: post.commentsCount,
                })}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </article>
    </Card>
  );
}
