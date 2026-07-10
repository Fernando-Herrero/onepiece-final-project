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

type EpisodeAchievements = {
  characters: number[];
  items: number[];
  fruits: number[];
  swords: number[];
  boats: number[];
};

type SerieEpisodeCardProps = {
  episodeId: number;
  name: string;
  description: string;
  experience: number;
  achievements: EpisodeAchievements;
  watched: boolean;
};

const ACHIEVEMENT_TYPES = [
  { key: 'characters', labelKey: 'profile.collection_characters' },
  { key: 'items', labelKey: 'profile.collection_items' },
  { key: 'fruits', labelKey: 'profile.collection_fruits' },
  { key: 'swords', labelKey: 'profile.collection_swords' },
  { key: 'boats', labelKey: 'profile.collection_boats' },
] as const;

export function SerieEpisodeCard({
  episodeId,
  name,
  description,
  experience,
  achievements,
  watched,
}: SerieEpisodeCardProps) {
  const { t } = useTranslation();
  const [previewRewards, setPreviewRewards] = useState(false);
  const showRewards = watched || previewRewards;

  return (
    <Box asChild>
      <li>
        <Card className="border border-white/10 bg-[#05070d]/55 p-3 shadow-sm transition-colors duration-300 hover:border-[#f2d9a8]/25 hover:bg-[#05070d]/75">
          <Flex direction="column" gap="2">
            <Flex align="start" gap="2">
              <Text
                as="p"
                size="1"
                weight="bold"
                className="shrink-0 font-road-captain text-[#f2d9a8]"
              >
                {t('serie.episode_number', { number: episodeId })}
              </Text>
              <Text
                as="p"
                size="2"
                weight="medium"
                className="min-w-0 text-[#f4ede1]"
              >
                {name}
              </Text>
            </Flex>

            <Flex align="start" justify="between" gap="3">
              <Text as="p" size="1" className="min-w-0 flex-1 text-[#f4ede1]/75">
                {description}
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
                  className="h-auto cursor-pointer px-1 text-[#f2d9a8]/80 hover:text-[#f2d9a8]"
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
                      className="text-[#f2d9a8] underline decoration-[#f2d9a8]/40"
                    >
                      {t('serie.achievements_heading')}
                    </Text>

                    <Flex direction="column" gap="1">
                      {ACHIEVEMENT_TYPES.map(({ key, labelKey }) => {
                        const ids = achievements[key];
                        if (!ids.length) {
                          return null;
                        }

                        return (
                          <Text
                            key={key}
                            as="p"
                            size="1"
                            className="text-[#f4ede1]/80"
                          >
                            <Text as="span" weight="medium" className="text-[#f4ede1]">
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
