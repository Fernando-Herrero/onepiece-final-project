import { Card, Flex, Heading, Skeleton, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { useProfileStats } from '@/features/profile/api/use-profile';

type ProfileStatsCardProps = {
  userId: string;
};

export function ProfileStatsCard({ userId }: ProfileStatsCardProps) {
  const { t } = useTranslation();
  const { data } = useProfileStats(userId);

  const statItems = [
    { label: t('profile.stats_posts'), value: data.myPosts },
    { label: t('profile.liked_posts'), value: data.likedPosts },
    { label: t('profile.bookmarked_posts'), value: data.bookmarkedPosts },
    { label: t('profile.commented_posts'), value: data.commentedPosts },
    { label: t('profile.total_comments'), value: data.totalComments },
  ];

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
      <Heading as="h2" size="3" mb="4" className="text-[#f2d9a8]">
        {t('profile.stats_title')}
      </Heading>
      <Flex direction="column" gap="2">
        {statItems.map(item => (
          <Flex
            key={item.label}
            align="center"
            justify="between"
            gap="3"
            className="rounded-md border border-[#f2d9a8]/10 bg-[#05070d]/40 px-3 py-2"
          >
            <Text as="span" size="2" className="text-[#f4ede1]/85">
              {item.label}
            </Text>
            <Text as="span" size="2" weight="bold" className="text-[#f2d9a8]">
              {item.value}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}

export function ProfileStatsCardSkeleton() {
  const { t } = useTranslation();

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
      <Heading as="h2" size="3" mb="4" className="text-[#f2d9a8]">
        {t('profile.stats_title')}
      </Heading>
      <Flex direction="column" gap="2">
        {Array.from({ length: 5 }, (_, index) => (
          <Flex
            key={index}
            align="center"
            justify="between"
            gap="3"
            className="rounded-md border border-[#f2d9a8]/10 bg-[#05070d]/40 px-3 py-2"
          >
            <Skeleton height="16px" width="45%" />
            <Skeleton height="16px" width="32px" />
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}
