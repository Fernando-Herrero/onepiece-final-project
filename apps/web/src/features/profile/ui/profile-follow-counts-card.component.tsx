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

import {
  useProfileFollowers,
  useProfileFollowing,
} from '@/features/profile/api/use-profile';
import { resolveProfileAvatarSrc } from '@/features/profile/profile.constants';

type UserSummary = z.infer<typeof userSummarySchema>;

type ProfileFollowCountsCardProps = {
  userId: string;
  followersCount: number;
  followingCount: number;
};

type FollowListKind = 'followers' | 'following';

function followDisplayName(user: UserSummary) {
  const displayName = user.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  return `${user.firstName}${user.lastName}`.trim() || user.username;
}

function ProfileFollowUserRow({ user }: { user: UserSummary }) {
  const name = followDisplayName(user);
  const avatarSrc = resolveProfileAvatarSrc(user.avatar);

  return (
    <Link
      href={`/dashboard/users/${user._id}`}
      className="flex items-center gap-3 rounded-md border border-[#f2d9a8]/10 bg-[#05070d]/40 px-3 py-2 transition-colors hover:border-[#f2d9a8]/25"
    >
        <Avatar
          src={avatarSrc}
          fallback={name.slice(0, 1).toUpperCase()}
          size="2"
          radius="full"
          className="shrink-0 border border-[#f2d9a8]/20"
        />
        <Flex direction="column" gap="0" className="min-w-0 flex-1">
          <Text as="span" size="2" weight="medium" className="truncate text-[#f4ede1]">
            {name}
          </Text>
          <Text as="span" size="1" color="gray" className="truncate">
            @{user.username}
          </Text>
        </Flex>
        <Box
          className={`size-2 shrink-0 rounded-full border border-[#0b1120] ${
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
      <Text as="p" size="2" className="py-2 text-[#f4ede1]/50 italic">
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
      <Text as="p" size="2" className="py-2 text-[#f4ede1]/50 italic">
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
        <Flex
          key={index}
          align="center"
          gap="3"
          className="rounded-md border border-[#f2d9a8]/10 bg-[#05070d]/40 px-3 py-2"
        >
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
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
      <Heading as="h2" size="3" mb="4" className="text-[#f2d9a8]">
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
                  ? 'border-[#f2d9a8]/40 bg-[#f2d9a8]/10'
                  : 'border-[#f2d9a8]/10 bg-[#05070d]/40 hover:border-[#f2d9a8]/25'
              }`}
              onClick={() =>
                setExpandedList(current =>
                  current === item.kind ? null : item.kind,
                )
              }
            >
              <Text as="span" size="5" weight="bold" className="text-[#f2d9a8]">
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
          className="motion-safe:animate-[profile-fade-up_0.5s_ease-out_both] mt-4 border-t border-[#f2d9a8]/10 pt-4"
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
