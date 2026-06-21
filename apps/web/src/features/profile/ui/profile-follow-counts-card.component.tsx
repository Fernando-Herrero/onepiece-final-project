import { Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

type ProfileFollowCountsCardProps = {
  followersCount: number;
  followingCount: number;
  className?: string;
};

export function ProfileFollowCountsCard({
  followersCount,
  followingCount,
  className,
}: ProfileFollowCountsCardProps) {
  const { t } = useTranslation();

  const items = [
    { label: t('profile.followers'), value: followersCount },
    { label: t('profile.following'), value: followingCount },
  ];

  return (
    <Card
      className={`border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4 ${className ?? ''}`}
    >
      <Heading as="h2" size="3" mb="4" className="text-[#f2d9a8]">
        {t('profile.follow_title')}
      </Heading>
      <Flex gap="3">
        {items.map(item => (
          <Flex
            key={item.label}
            direction="column"
            align="center"
            gap="1"
            className="flex-1 rounded-md border border-[#f2d9a8]/10 bg-[#05070d]/40 px-3 py-3"
          >
            <Text as="span" size="5" weight="bold" className="text-[#f2d9a8]">
              {item.value}
            </Text>
            <Text as="span" size="1" color="gray" align="center">
              {item.label}
            </Text>
          </Flex>
        ))}
      </Flex>
      <Text as="p" size="1" color="gray" mt="3" className="text-[#f4ede1]/50">
        {t('profile.follow_lists_soon')}
      </Text>
    </Card>
  );
}
