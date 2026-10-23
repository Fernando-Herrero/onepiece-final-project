import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Text,
  Tooltip,
} from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { SERIE_REWARD_TYPES } from '@/features/serie/serie.constants';
import type { SerieEpisodeRewards } from '@/features/serie/serie.types';

type SerieEpisodeCardProps = {
  episodeId: number;
  name: string;
  description: string;
  experience: number;
  rewards: SerieEpisodeRewards;
  watched: boolean;
};

export function SerieEpisodeCard({
  episodeId,
  name,
  description,
  experience,
  rewards,
  watched,
}: SerieEpisodeCardProps) {
  const { t } = useTranslation(['common', 'serie']);
  const [previewRewards, setPreviewRewards] = useState(false);
  const showRewards = watched || previewRewards;

  return (
    <Box asChild>
      <li>
        <Card className="bg-deep/55 hover:border-highlight/25 hover:bg-deep/75 border border-white/10 p-3 shadow-sm transition-colors duration-300">
          <Flex direction="column" gap="2">
            <Flex align="start" gap="2">
              <Text
                as="p"
                size="1"
                weight="bold"
                className="font-road-captain text-highlight shrink-0"
              >
                {t('serie.episode_number', { number: episodeId })}
              </Text>
              <Text
                as="p"
                size="2"
                weight="medium"
                className="text-foreground min-w-0"
              >
                {t(`episodes.${episodeId}.name`, {
                  ns: 'serie',
                  defaultValue: name,
                })}
              </Text>
            </Flex>

            <Flex align="start" justify="between" gap="3">
              <Text
                as="p"
                size="1"
                className="text-foreground/75 min-w-0 flex-1"
              >
                {t(`episodes.${episodeId}.description`, {
                  ns: 'serie',
                  defaultValue: description,
                })}
              </Text>

              <Tooltip content={t('serie.viewed_chapter')}>
                <Box>
                  <Checkbox checked={watched} disabled />
                </Box>
              </Tooltip>
            </Flex>

            <Flex align="center" wrap="wrap" gap="2">
              <Badge color="orange" variant="soft" size="1">
                {t('serie.episode_xp', { xp: experience })}
              </Badge>
              {!watched ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="1"
                  highContrast
                  className="text-highlight/80 hover:text-highlight h-auto cursor-pointer px-1"
                  onClick={() => setPreviewRewards(open => !open)}
                >
                  {previewRewards
                    ? t('serie.hide_rewards')
                    : t('serie.show_rewards')}
                </Button>
              ) : null}
            </Flex>

            <Card
              className="faq-item border-0 bg-black/25 p-0 shadow-none"
              data-open={showRewards || undefined}
            >
              <Box className="faq-panel">
                <Box className="faq-panel-inner">
                  <Box className="p-3">
                    <Text
                      as="p"
                      size="1"
                      weight="bold"
                      mb="2"
                      className="text-highlight decoration-highlight/40 underline"
                    >
                      {t('serie.rewards_heading')}
                    </Text>

                    <Flex direction="column" gap="1">
                      {SERIE_REWARD_TYPES.map(({ key, labelKey }) => {
                        const ids = rewards[key];
                        if (!ids.length) {
                          return null;
                        }

                        return (
                          <Text
                            key={key}
                            as="p"
                            size="1"
                            className="text-foreground/80"
                          >
                            <Text
                              as="span"
                              weight="medium"
                              className="text-foreground"
                            >
                              {t(labelKey)}:
                            </Text>{' '}
                            {ids.join(', ')}
                          </Text>
                        );
                      })}
                    </Flex>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Flex>
        </Card>
      </li>
    </Box>
  );
}
