import type { userSummarySchema } from '@logpose/contracts/common/user.schemas';
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Skeleton,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { Suspense, useState } from 'react';
import type * as z from 'zod/v4';

import { VerifiedBadge } from '@/components/verified-badge/verified-badge.component';
import { resolveAvatarSrc } from '@/features/avatar/avatar.constants';
import {
  useProfileFollowers,
  useProfileFollowing,
} from '@/features/profile/api/use-profile';
import { getUserDisplayName } from '@/features/profile/profile.constants';

type UserSummary = z.infer<typeof userSummarySchema>;

type ProfileFollowCountsCardProps = {
  userId: string;
  followersCount: number;
  followingCount: number;
};

type FollowListKind = 'followers' | 'following';

function ProfileFollowUserRow({ user }: { user: UserSummary }) {
  const name = getUserDisplayName(user);
  const avatarSrc = resolveAvatarSrc(user.avatar);

  return (
    <Link
      href={`/dashboard/users/${user._id}`}
      className="tile hover:border-highlight/25 flex items-center gap-3 transition-colors"
    >
      <Avatar
        src={avatarSrc}
        fallback={name.slice(0, 1).toUpperCase()}
        size="2"
        radius="full"
        className="border-highlight/20 shrink-0 border"
      />
      <Flex direction="column" gap="0" className="min-w-0 flex-1">
        <Flex align="center" gap="1" className="min-w-0">
          <Text
            as="span"
            size="2"
            weight="medium"
            className="text-foreground truncate"
          >
            {name}
          </Text>
          <VerifiedBadge verified={user.verified} />
        </Flex>
        <Text as="span" size="1" color="gray" className="truncate">
          @{user.username}
        </Text>
      </Flex>
      <Box
        className={`border-page size-2 shrink-0 rounded-full border ${
          user.isActive ? 'bg-green-400' : 'bg-red-400'
        }`}
        aria-hidden
      />
    </Link>
  );
}

function ProfileFollowersList({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const { data: users } = useProfileFollowers(userId);

  if (users.length === 0) {
    return (
      <Text as="p" size="2" className="text-foreground/50 py-2 italic">
        {t('profile.follow_list_empty_followers')}
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="2" className="max-h-48 overflow-y-auto">
      {users.map(user => (
        <ProfileFollowUserRow key={user._id} user={user} />
      ))}
    </Flex>
  );
}

function ProfileFollowingList({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const { data: users } = useProfileFollowing(userId);

  if (users.length === 0) {
    return (
      <Text as="p" size="2" className="text-foreground/50 py-2 italic">
        {t('profile.follow_list_empty_following')}
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="2" className="max-h-48 overflow-y-auto">
      {users.map(user => (
        <ProfileFollowUserRow key={user._id} user={user} />
      ))}
    </Flex>
  );
}

function ProfileFollowListSkeleton() {
  return (
    <Flex direction="column" gap="2">
      {Array.from({ length: 3 }, (_, index) => (
        <Flex key={index} align="center" gap="3" className="tile">
          <Skeleton height="32px" width="32px" className="rounded-full" />
          <Flex direction="column" gap="1" className="flex-1">
            <Skeleton height="14px" width="60%" />
            <Skeleton height="12px" width="40%" />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

export function ProfileFollowCountsCard({
  userId,
  followersCount,
  followingCount,
}: ProfileFollowCountsCardProps) {
  const { t } = useTranslation();
  const [expandedList, setExpandedList] = useState<FollowListKind | null>(null);

  const items: { kind: FollowListKind; label: string; value: number }[] = [
    { kind: 'followers', label: t('profile.followers'), value: followersCount },
    { kind: 'following', label: t('profile.following'), value: followingCount },
  ];

  return (
    <Card className="card p-4">
      <Heading as="h2" size="3" mb="4" className="text-highlight">
        {t('profile.follow_title')}
      </Heading>
      <Flex gap="3">
        {items.map(item => {
          const isActive = expandedList === item.kind;

          return (
            <Button
              key={item.kind}
              type="button"
              variant={isActive ? 'soft' : 'outline'}
              color="orange"
              highContrast={isActive}
              aria-expanded={isActive}
              aria-controls={`profile-follow-list-${item.kind}`}
              className={`h-auto flex-1 cursor-pointer flex-col items-center gap-1 px-3 py-3 ${
                isActive
                  ? 'border-highlight/40 bg-highlight/10'
                  : 'border-highlight/10 bg-deep/40 hover:border-highlight/25'
              }`}
              onClick={() =>
                setExpandedList(current =>
                  current === item.kind ? null : item.kind,
                )
              }
            >
              <Text as="span" size="5" weight="bold" className="text-highlight">
                {item.value}
              </Text>
              <Text as="span" size="1" color="gray" align="center">
                {item.label}
              </Text>
            </Button>
          );
        })}
      </Flex>

      {expandedList ? (
        <Box
          id={`profile-follow-list-${expandedList}`}
          className="border-highlight/10 mt-4 border-t pt-4 motion-safe:animate-[profile-fade-up_0.5s_ease-out_both]"
        >
          <Suspense fallback={<ProfileFollowListSkeleton />}>
            {expandedList === 'followers' ? (
              <ProfileFollowersList userId={userId} />
            ) : (
              <ProfileFollowingList userId={userId} />
            )}
          </Suspense>
        </Box>
      ) : null}
    </Card>
  );
}
