import { Card, Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import { PROFILE_UNLOCKED_CARD_KEYS } from '@/features/profile/profile.constants';
import type { ProfileUser } from '@/features/profile/profile.types';

type ProfileCollectionTeaserProps = {
  unlockedCards: ProfileUser['unlockedCards'];
  isOwner?: boolean;
};

export function ProfileCollectionTeaser({
  unlockedCards,
  isOwner = true,
}: ProfileCollectionTeaserProps) {
  const { t } = useTranslation();

  const totalUnlocked = PROFILE_UNLOCKED_CARD_KEYS.reduce(
    (sum, key) => sum + unlockedCards[key].length,
    0,
  );

  const breakdown = PROFILE_UNLOCKED_CARD_KEYS.map(key => ({
    key,
    count: unlockedCards[key].length,
    label: t(`profile.collection_${key}`),
  })).filter(item => item.count > 0);

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
      <Flex align="center" justify="between" gap="3" mb="4">
        <Heading as="h2" size="3" className="text-[#f2d9a8]">
          {t('profile.collection_title')}
        </Heading>
        {isOwner ? (
          <Link
            href="/dashboard/cards"
            className="text-xs text-[#f2d9a8]/80 underline-offset-2 transition hover:text-[#f2d9a8] hover:underline"
          >
            {t('profile.collection_view_all')}
          </Link>
        ) : null}
      </Flex>

      <Text as="p" size="2" mb="3" className="text-[#f4ede1]/85">
        {t('profile.collection_total', { count: totalUnlocked })}
      </Text>

      {breakdown.length === 0 ? (
        <Text as="p" size="2" className="text-[#f4ede1]/50 italic">
          {t(
            isOwner
              ? 'profile.collection_empty'
              : 'profile.collection_empty_other',
          )}
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          {breakdown.map(item => (
            <Flex
              key={item.key}
              align="center"
              justify="between"
              gap="3"
              className="rounded-md border border-[#f2d9a8]/10 bg-[#05070d]/40 px-3 py-2"
            >
              <Text as="span" size="2" className="text-[#f4ede1]/85">
                {item.label}
              </Text>
              <Text as="span" size="2" weight="bold" className="text-[#f2d9a8]">
                {item.count}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Card>
  );
}
