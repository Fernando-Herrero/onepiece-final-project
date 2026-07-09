import { Card, Flex, Heading, Progress, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import { SERIE_TOTAL_XP } from '@/features/profile/profile.constants';
import type { ProfileUser } from '@/features/profile/profile.types';
import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

type ProfileProgressCardProps = {
  user: ProfileUser;
  isOwner?: boolean;
};

export function ProfileProgressCard({
  user,
  isOwner = true,
}: ProfileProgressCardProps) {
  const { t } = useTranslation();
  const { saga, arc, episode } = user.serieProgress;
  const hasSerieProgress = saga > 0 && arc > 0 && episode > 0;

  const sagasQuery = useQuery({
    ...allQueriesOptions.serie.sagas(),
    enabled: hasSerieProgress,
  });
  const arcsQuery = useQuery({
    ...allQueriesOptions.serie.arcsBySaga(saga),
    enabled: hasSerieProgress,
  });

  const sagaName = sagasQuery.data?.sagas.find(item => item.id === saga)?.name;
  const arcName = arcsQuery.data?.arcs.find(item => item.id === arc)?.name;
  const xpPercent = Math.min(
    100,
    Math.round((user.experience / SERIE_TOTAL_XP) * 100),
  );

  const progressItems = hasSerieProgress
    ? [
        {
          label: t('profile.progress_saga_label'),
          value: sagaName ?? t('profile.progress_saga_fallback', { id: saga }),
        },
        {
          label: t('profile.progress_arc_label'),
          value: arcName ?? t('profile.progress_arc_fallback', { id: arc }),
        },
        {
          label: t('profile.progress_episode_label'),
          value: t('serie.episode_number', { number: episode }),
        },
      ]
    : [];

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
      <Flex align="center" justify="between" gap="3" mb="4">
        <Heading as="h2" size="3" className="text-[#f2d9a8]">
          {t('profile.progress_card_title')}
        </Heading>
        {isOwner ? (
          <Link
            href="/dashboard/serie"
            className="text-xs text-[#f2d9a8]/80 underline-offset-2 transition hover:text-[#f2d9a8] hover:underline"
          >
            {t('profile.progress_view_serie')}
          </Link>
        ) : null}
      </Flex>

      {hasSerieProgress ? (
        <Flex direction="column" gap="3">
          <Flex gap="2" wrap="wrap">
            {progressItems.map(item => (
              <Flex
                key={item.label}
                direction="column"
                gap="1"
                className="min-w-28 flex-1 rounded-md border border-[#f2d9a8]/10 bg-[#05070d]/40 px-3 py-2"
              >
                <Text as="span" size="1" color="gray">
                  {item.label}
                </Text>
                <Text
                  as="span"
                  size="2"
                  weight="medium"
                  className="text-[#f4ede1]"
                >
                  {item.value}
                </Text>
              </Flex>
            ))}
          </Flex>

          <Flex direction="column" gap="2">
            <Flex align="center" justify="between" gap="3">
              <Text as="span" size="2" className="text-[#f4ede1]/85">
                {t('profile.progress_xp_label')}
              </Text>
              <Text as="span" size="2" weight="bold" className="text-[#f2d9a8]">
                {t('profile.experience', { value: user.experience })}
              </Text>
            </Flex>
            <Progress
              value={xpPercent}
              size="2"
              className="profile-xp-progress"
            />
            <Text as="p" size="1" color="gray" align="right">
              {t('profile.progress_xp_of_total', {
                current: user.experience,
                total: SERIE_TOTAL_XP,
              })}
            </Text>
          </Flex>
        </Flex>
      ) : (
        <Text as="p" size="2" className="text-[#f4ede1]/50 italic">
          {t(
            isOwner ? 'profile.progress_empty' : 'profile.progress_empty_other',
          )}
        </Text>
      )}
    </Card>
  );
}
