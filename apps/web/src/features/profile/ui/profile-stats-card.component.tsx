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
    <Card className="card p-4">
      <Heading as="h2" size="3" mb="4" className="text-highlight">
        {t('profile.stats_title')}
      </Heading>
      <Flex direction="column" gap="2">
        {statItems.map(item => (
          <Flex
            key={item.label}
            align="center"
            justify="between"
            gap="3"
            className="tile"
          >
            <Text as="span" size="2" className="text-foreground/85">
              {item.label}
            </Text>
            <Text as="span" size="2" weight="bold" className="text-highlight">
              {item.value ?? t('profile.stats_hidden')}
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
    <Card className="card p-4">
      <Heading as="h2" size="3" mb="4" className="text-highlight">
        {t('profile.stats_title')}
      </Heading>
      <Flex direction="column" gap="2">
        {Array.from({ length: 5 }, (_, index) => (
          <Flex
            key={index}
            align="center"
            justify="between"
            gap="3"
            className="tile"
          >
            <Skeleton height="16px" width="45%" />
            <Skeleton height="16px" width="32px" />
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}
