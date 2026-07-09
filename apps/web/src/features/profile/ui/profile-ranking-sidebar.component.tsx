import type { userRankingEntrySchema } from '@logpose/contracts/features/users/schemas';
import {
  Avatar,
  Box,
  Card,
  Flex,
  Heading,
  Progress,
  Skeleton,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import type * as z from 'zod/v4';

import { useProfileRanking } from '@/features/profile/api/use-profile';
import {
  DEFAULT_AVATAR_SRC,
  resolveProfileAvatarSrc,
  SERIE_TOTAL_XP,
} from '@/features/profile/profile.constants';

type ProfileRankingEntry = z.infer<typeof userRankingEntrySchema>;

type ProfileRankingSidebarProps = {
  currentUserId: string;
};

function rankingDisplayName(entry: ProfileRankingEntry) {
  const displayName = entry.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  const fullName = `${entry.firstName}${entry.lastName}`.trim();
  return fullName || entry.username;
}

function ProfileRankingRow({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: ProfileRankingEntry;
  rank: number;
  isCurrentUser: boolean;
}) {
  const { t } = useTranslation();
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const resolvedAvatar = resolveProfileAvatarSrc(entry.avatar);
  const avatarSrc = avatarLoadError ? DEFAULT_AVATAR_SRC : resolvedAvatar;
  const name = rankingDisplayName(entry);
  const xpPercent = Math.min(
    100,
    Math.round((entry.experience / SERIE_TOTAL_XP) * 100),
  );

  return (
    <Link
      href={`/dashboard/users/${entry._id}`}
      className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:border-[#f2d9a8]/25 ${
        isCurrentUser
          ? 'border-[#f2d9a8]/40 bg-[#f2d9a8]/10'
          : 'border-[#f2d9a8]/10 bg-[#05070d]/40'
      }`}
    >
        <Text
          as="span"
          size="1"
          weight="bold"
          className="w-5 shrink-0 text-center text-[#f2d9a8]/70"
        >
          {rank}
        </Text>

        <Box position="relative" className="shrink-0">
          <Avatar
            src={avatarSrc}
            fallback={name.slice(0, 1).toUpperCase()}
            size="2"
            radius="full"
            className="border border-[#f2d9a8]/20"
            onLoadingStatusChange={status => {
              if (status === 'error') {
                setAvatarLoadError(true);
              }
            }}
          />
          <Box
            position="absolute"
            className={`right-0 bottom-0 size-2 rounded-full border border-[#0b1120] ${
              entry.isActive ? 'bg-green-400' : 'bg-red-400'
            }`}
            aria-hidden
          />
        </Box>

        <Flex direction="column" gap="1" className="min-w-0 flex-1">
          <Text
            as="span"
            size="2"
            weight="medium"
            className="truncate text-[#f4ede1]"
          >
            {name}
            {isCurrentUser ? (
              <Text as="span" size="1" className="ml-1.5 text-[#f2d9a8]">
                ({t('profile.ranking_you')})
              </Text>
            ) : null}
          </Text>
          <Text as="span" size="1" color="gray" className="truncate">
            @{entry.username}
          </Text>
          <Flex align="center" gap="2" className="pt-0.5">
            <Progress
              value={xpPercent}
              size="2"
              className="profile-xp-progress min-w-0 flex-1"
            />
            <Text
              as="span"
              size="1"
              weight="bold"
              className="shrink-0 text-[#f2d9a8]"
            >
              {t('profile.experience', { value: entry.experience })}
            </Text>
          </Flex>
        </Flex>
    </Link>
  );
}

export function ProfileRankingSidebar({
  currentUserId,
}: ProfileRankingSidebarProps) {
  const { t } = useTranslation();
  const { data: ranking } = useProfileRanking();

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
      <Heading as="h2" size="3" mb="4" className="text-[#f2d9a8]">
        {t('profile.sidebar_ranking_title')}
      </Heading>

      {ranking.length === 0 ? (
        <Text as="p" size="2" color="gray" className="text-[#f4ede1]/60">
          {t('profile.sidebar_ranking_empty')}
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          {ranking.map((entry, index) => (
            <ProfileRankingRow
              key={entry._id}
              entry={entry}
              rank={index + 1}
              isCurrentUser={entry._id === currentUserId}
            />
          ))}
        </Flex>
      )}
    </Card>
  );
}

export function ProfileRankingSidebarSkeleton() {
  const { t } = useTranslation();

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
      <Heading as="h2" size="3" mb="4" className="text-[#f2d9a8]">
        {t('profile.sidebar_ranking_title')}
      </Heading>
      <Flex direction="column" gap="2">
        {Array.from({ length: 6 }, (_, index) => (
          <Flex
            key={index}
            align="center"
            gap="3"
            className="rounded-md border border-[#f2d9a8]/10 bg-[#05070d]/40 px-3 py-2"
          >
            <Skeleton height="14px" width="20px" />
            <Skeleton height="32px" width="32px" className="rounded-full" />
            <Flex direction="column" gap="1" className="flex-1">
              <Skeleton height="14px" width="70%" />
              <Skeleton height="12px" width="45%" />
              <Flex align="center" gap="2" className="pt-0.5">
                <Skeleton height="6px" className="min-w-0 flex-1" />
                <Skeleton height="12px" width="40px" />
              </Flex>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}
