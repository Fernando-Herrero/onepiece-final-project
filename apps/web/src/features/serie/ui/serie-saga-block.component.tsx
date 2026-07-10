import { Flex, Spinner, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { useSerieArcs } from '@/features/serie/api/use-serie';
import type { SerieProgress, SerieSaga } from '@/features/serie/serie.types';
import { SerieAccordion } from '@/features/serie/ui/serie-accordion.component';
import { SerieArcBlock } from '@/features/serie/ui/serie-arc-block.component';

type SerieSagaBlockProps = {
  saga: SerieSaga;
  isOpen: boolean;
  onToggle: () => void;
  openArcIds: Record<number, boolean>;
  onToggleArc: (arcId: number) => void;
  progress: SerieProgress;
};

export function SerieSagaBlock({
  saga,
  isOpen,
  onToggle,
  openArcIds,
  onToggleArc,
  progress,
}: SerieSagaBlockProps) {
  const { t } = useTranslation();
  const arcsQuery = useSerieArcs(saga.id, { enabled: isOpen });

  return (
    <SerieAccordion
      variant="saga"
      title={saga.name}
      subtitle={saga.titleJa}
      meta={t('serie.saga_meta', {
        arcs: saga.arcNames.length,
        episodes: saga.totalEpisodes,
      })}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {isOpen && arcsQuery.isPending ? (
        <Flex align="center" gap="2" py="3">
          <Spinner size="2" />
          <Text size="1" color="gray">
            {t('serie.loading')}
          </Text>
        </Flex>
      ) : null}

      {isOpen && arcsQuery.isError ? (
        <Text size="1" color="red">
          {t('serie.error')}
        </Text>
      ) : null}

      {isOpen && arcsQuery.data
        ? arcsQuery.data.arcs.map(arc => (
            <SerieArcBlock
              key={arc.id}
              arc={arc}
              sagaId={saga.id}
              isOpen={openArcIds[arc.id] ?? false}
              onToggle={() => onToggleArc(arc.id)}
              progress={progress}
            />
          ))
        : null}
    </SerieAccordion>
  );
}
