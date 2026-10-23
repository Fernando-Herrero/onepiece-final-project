import { Badge, Box, Flex, Spinner, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { useSerieEpisodes } from '@/features/serie/api/use-serie';
import type { SerieArc } from '@/features/serie/serie.types';
import { SerieAccordion } from '@/features/serie/ui/serie-accordion.component';
import { SerieEpisodeCard } from '@/features/serie/ui/serie-episode-card.component';

type SerieArcBlockProps = {
  arc: SerieArc;
  isOpen: boolean;
  onToggle: () => void;
  lastWatchedEpisode: number;
};

export function SerieArcBlock({
  arc,
  isOpen,
  onToggle,
  lastWatchedEpisode,
}: SerieArcBlockProps) {
  const { t } = useTranslation(['common', 'serie']);
  const episodesQuery = useSerieEpisodes(arc.slug, { enabled: isOpen });

  return (
    <SerieAccordion
      variant="arc"
      title={t(`arcs.${arc.slug}.name`, { ns: 'serie', defaultValue: '' })}
      subtitle={t(`arcs.${arc.slug}.description`, {
        ns: 'serie',
        defaultValue: '',
      })}
      meta={t('serie.arc_meta', { episodes: arc.totalEpisodes })}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {arc.type === 'filler' ? (
        <Badge color="orange" variant="soft" size="1">
          {t('serie.filler')}
        </Badge>
      ) : null}

      {isOpen && episodesQuery.isPending ? (
        <Flex align="center" gap="2" py="2">
          <Spinner size="2" />
          <Text size="1" color="gray">
            {t('serie.loading')}
          </Text>
        </Flex>
      ) : null}

      {isOpen && episodesQuery.isError ? (
        <Text size="1" color="red">
          {t('serie.error')}
        </Text>
      ) : null}

      {isOpen && episodesQuery.data?.total === 0 ? (
        <Text size="1" color="gray">
          {t('serie.no_episodes')}
        </Text>
      ) : null}

      {isOpen && episodesQuery.data && episodesQuery.data.total > 0 ? (
        <Box asChild>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {episodesQuery.data.episodes.map(episode => (
              <SerieEpisodeCard
                key={episode.number}
                episodeNumber={episode.number}
                experience={episode.experience}
                rewards={episode.rewards}
                watched={episode.number <= lastWatchedEpisode}
              />
            ))}
          </ul>
        </Box>
      ) : null}
    </SerieAccordion>
  );
}
