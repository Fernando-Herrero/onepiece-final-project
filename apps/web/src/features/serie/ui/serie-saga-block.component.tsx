import { Flex, Spinner, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { useSerieArcs } from '@/features/serie/api/use-serie';
import type { SerieSaga } from '@/features/serie/serie.types';
import { SerieAccordion } from '@/features/serie/ui/serie-accordion.component';
import { SerieArcBlock } from '@/features/serie/ui/serie-arc-block.component';
import { useLocale } from '@/integrations/next-i18next/use-locale';

type SerieSagaBlockProps = {
  saga: SerieSaga;
  isOpen: boolean;
  onToggle: () => void;
  openArcIds: Record<number, boolean>;
  onToggleArc: (arcId: number) => void;
  lastWatchedEpisode: number;
};

export function SerieSagaBlock({
  saga,
  isOpen,
  onToggle,
  openArcIds,
  onToggleArc,
  lastWatchedEpisode,
}: SerieSagaBlockProps) {
  const { t } = useTranslation(['common', 'serie']);
  const locale = useLocale();
  const arcsQuery = useSerieArcs(saga.id, { enabled: isOpen });

  return (
    <SerieAccordion
      variant="saga"
      title={t(`sagas.${saga.id}.name`, {
        ns: 'serie',
        defaultValue: saga.name,
      })}
      subtitle={locale === 'ja' ? undefined : saga.titleJa}
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
              isOpen={openArcIds[arc.id] ?? false}
              onToggle={() => onToggleArc(arc.id)}
              lastWatchedEpisode={lastWatchedEpisode}
            />
          ))
        : null}
    </SerieAccordion>
  );
}
