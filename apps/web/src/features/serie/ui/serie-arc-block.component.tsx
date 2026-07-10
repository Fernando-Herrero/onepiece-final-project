import { Badge, Box, Flex, Spinner, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next/pages';

import { isEpisodeWatched } from '@/features/serie/serie-progress';
import { SerieAccordion } from '@/features/serie/ui/serie-accordion.component';
import { SerieEpisodeCard } from '@/features/serie/ui/serie-episode-card.component';
import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

type SerieProgress = {
  saga: number;
  arc: number;
  episode: number;
};

type SerieArcBlockProps = {
  arc: {
    id: number;
    name: string;
    description: string;
    totalEpisodes: number;
    isFiller: boolean;
  };
  sagaId: number;
  isOpen: boolean;
  onToggle: () => void;
  progress: SerieProgress;
};

export function SerieArcBlock({
  arc,
  sagaId,
  isOpen,
  onToggle,
  progress,
}: SerieArcBlockProps) {
  const { t } = useTranslation();
  const episodesQuery = useQuery({
    ...allQueriesOptions.serie.episodesByArc(arc.id),
    enabled: isOpen,
  });

  return (
    <SerieAccordion
      variant="arc"
      title={arc.name}
      subtitle={arc.description}
      meta={t('serie.arc_meta', { episodes: arc.totalEpisodes })}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {arc.isFiller ? (
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
                key={episode.id}
                episodeId={episode.id}
                name={episode.name}
                description={episode.description}
                experience={episode.experience}
                achievements={episode.achievements}
                watched={isEpisodeWatched(episode.id, sagaId, arc.id, progress)}
              />
            ))}
          </ul>
        </Box>
      ) : null}
    </SerieAccordion>
  );
}
