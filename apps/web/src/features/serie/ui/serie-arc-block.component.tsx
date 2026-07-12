import { Badge, Box, Flex, Spinner, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { useSerieEpisodes } from '@/features/serie/api/use-serie';
import { isEpisodeWatched } from '@/features/serie/serie.selectors';
import type { SerieArc, SerieProgress } from '@/features/serie/serie.types';
import { SerieAccordion } from '@/features/serie/ui/serie-accordion.component';
import { SerieEpisodeCard } from '@/features/serie/ui/serie-episode-card.component';

type SerieArcBlockProps = {
  arc: SerieArc;
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
  const { t } = useTranslation(['common', 'serie']);
  const episodesQuery = useSerieEpisodes(arc.id, { enabled: isOpen });

  return (
    <SerieAccordion
      variant="arc"
      title={t(`arcs.${arc.id}.name`, { ns: 'serie', defaultValue: arc.name })}
      subtitle={t(`arcs.${arc.id}.description`, {
        ns: 'serie',
        defaultValue: arc.description,
      })}
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
