import { Card, Flex, Heading, Progress, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import type { ProfileUser } from '@/features/profile/profile.types';
import { SERIE_TOTAL_XP } from '@/features/serie/serie.constants';
import { getSerieXpPercent } from '@/features/serie/serie.selectors';

type ProfileProgressCardProps = {
  user: ProfileUser;
  isOwner?: boolean;
};

export function ProfileProgressCard({
  user,
  isOwner = true,
}: ProfileProgressCardProps) {
  const { t } = useTranslation(['common', 'serie']);
  const { saga, arc, episode } = user.serieProgress;
  const hasSerieProgress = saga > 0 && arc > 0 && episode > 0;
  const xpPercent = getSerieXpPercent(user.experience);

  const progressItems = hasSerieProgress
    ? [
        {
          label: t('profile.progress_saga_label'),
          value: t(`sagas.${saga}.name`, {
            ns: 'serie',
            defaultValue: t('profile.progress_saga_fallback', { id: saga }),
          }),
        },
        {
          label: t('profile.progress_arc_label'),
          value: t(`arcs.${arc}.name`, {
            ns: 'serie',
            defaultValue: t('profile.progress_arc_fallback', { id: arc }),
          }),
        },
        {
          label: t('profile.progress_episode_label'),
          value: t('serie.episode_number', { number: episode }),
        },
      ]
    : [];

  return (
    <Card className="card p-4">
      <Flex align="center" justify="between" gap="3" mb="4">
        <Heading as="h2" size="3" className="text-highlight">
          {t('profile.progress_card_title')}
        </Heading>
        {isOwner ? (
          <Link
            href="/dashboard/serie"
            className="text-highlight/80 hover:text-highlight text-xs underline-offset-2 transition hover:underline"
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
                className="tile min-w-28 flex-1"
              >
                <Text as="span" size="1" color="gray">
                  {item.label}
                </Text>
                <Text
                  as="span"
                  size="2"
                  weight="medium"
                  className="text-foreground"
                >
                  {item.value}
                </Text>
              </Flex>
            ))}
          </Flex>

          <Flex direction="column" gap="2">
            <Flex align="center" justify="between" gap="3">
              <Text as="span" size="2" className="text-foreground/85">
                {t('profile.progress_xp_label')}
              </Text>
              <Text as="span" size="2" weight="bold" className="text-highlight">
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
        <Text as="p" size="2" className="text-foreground/50 italic">
          {t(
            isOwner ? 'profile.progress_empty' : 'profile.progress_empty_other',
          )}
        </Text>
      )}
    </Card>
  );
}
