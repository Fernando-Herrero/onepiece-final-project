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
  openArcSlugs: Record<string, boolean>;
  onToggleArc: (arcSlug: string) => void;
  lastWatchedEpisode: number;
};

export function SerieSagaBlock({
  saga,
  isOpen,
  onToggle,
  openArcSlugs,
  onToggleArc,
  lastWatchedEpisode,
}: SerieSagaBlockProps) {
  const { t } = useTranslation(['common', 'serie']);
  const locale = useLocale();
  const arcsQuery = useSerieArcs(saga.slug, { enabled: isOpen });

  return (
    <SerieAccordion
      variant="saga"
      title={t(`sagas.${saga.slug}.name`, {
        ns: 'serie',
        defaultValue: '',
      })}
      subtitle={
        locale === 'ja'
          ? undefined
          : t(`sagas.${saga.slug}.nameJa`, { ns: 'serie', defaultValue: '' })
      }
      meta={t('serie.saga_meta', {
        arcs: saga.totalArcs,
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
              key={arc.slug}
              arc={arc}
              isOpen={openArcSlugs[arc.slug] ?? false}
              onToggle={() => onToggleArc(arc.slug)}
              lastWatchedEpisode={lastWatchedEpisode}
            />
          ))
        : null}
    </SerieAccordion>
  );
}
