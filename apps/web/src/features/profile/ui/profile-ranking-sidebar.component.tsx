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

import {
  DEFAULT_AVATAR_SRC,
  resolveAvatarSrc,
} from '@/features/avatar/avatar.constants';
import { useProfileRanking } from '@/features/profile/api/use-profile';
import { getUserDisplayName } from '@/features/profile/profile.constants';
import { getSerieXpPercent } from '@/features/serie/serie.selectors';

type ProfileRankingEntry = z.infer<typeof userRankingEntrySchema>;

type ProfileRankingSidebarProps = {
  currentUserId: string;
};

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
  const resolvedAvatar = resolveAvatarSrc(entry.avatar);
  const avatarSrc = avatarLoadError ? DEFAULT_AVATAR_SRC : resolvedAvatar;
  const name = getUserDisplayName(entry);
  const xpPercent = getSerieXpPercent(entry.experience);

  return (
    <Link
      href={`/dashboard/users/${entry._id}`}
      className={`hover:border-highlight/25 flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
        isCurrentUser
          ? 'border-highlight/40 bg-highlight/10'
          : 'border-highlight/10 bg-deep/40'
      }`}
    >
      <Text
        as="span"
        size="1"
        weight="bold"
        className="text-highlight/70 w-5 shrink-0 text-center"
      >
        {rank}
      </Text>

      <Box position="relative" className="shrink-0">
        <Avatar
          src={avatarSrc}
          fallback={name.slice(0, 1).toUpperCase()}
          size="2"
          radius="full"
          className="border-highlight/20 border"
          onLoadingStatusChange={status => {
            if (status === 'error') {
              setAvatarLoadError(true);
            }
          }}
        />
        <Box
          position="absolute"
          className={`border-page right-0 bottom-0 size-2 rounded-full border ${
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
          className="text-foreground truncate"
        >
          {name}
          {isCurrentUser ? (
            <Text as="span" size="1" className="text-highlight ml-1.5">
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
            className="text-highlight shrink-0"
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
    <Card className="card p-4">
      <Heading as="h2" size="3" mb="4" className="text-highlight">
        {t('profile.sidebar_ranking_title')}
      </Heading>

      {ranking.length === 0 ? (
        <Text as="p" size="2" color="gray" className="text-foreground/60">
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
    <Card className="card p-4">
      <Heading as="h2" size="3" mb="4" className="text-highlight">
        {t('profile.sidebar_ranking_title')}
      </Heading>
      <Flex direction="column" gap="2">
        {Array.from({ length: 6 }, (_, index) => (
          <Flex key={index} align="center" gap="3" className="tile">
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
