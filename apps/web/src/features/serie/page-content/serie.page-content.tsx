import {
  Badge,
  Button,
  Callout,
  Card,
  Grid,
  Heading,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

export default function SeriePageContent() {
  const { t } = useTranslation();
  const [selectedSagaId, setSelectedSagaId] = useState<number | null>(null);
  const [selectedArcId, setSelectedArcId] = useState<number | null>(null);

  const sagasQuery = useQuery(allQueriesOptions.serie.sagas());
  const arcsQuery = useQuery(
    allQueriesOptions.serie.arcsBySaga(selectedSagaId ?? 0),
  );
  const episodesQuery = useQuery(
    allQueriesOptions.serie.episodesByArc(selectedArcId ?? 0),
  );

  const selectedSaga = sagasQuery.data?.sagas.find(
    saga => saga.id === selectedSagaId,
  );
  const selectedArc = arcsQuery.data?.arcs.find(
    arc => arc.id === selectedArcId,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {t('serie.title')}
      </Heading>
      <Text as="p" size="2" color="gray" mb="6" className="text-[#f4ede1]/75">
        {t('serie.subtitle')}
      </Text>

      {sagasQuery.isPending ? (
        <LoadingState label={t('serie.loading')} />
      ) : null}

      {sagasQuery.isError ? (
        <Callout.Root color="red" variant="soft" mb="4">
          <Callout.Text>
            {sagasQuery.error instanceof Error
              ? sagasQuery.error.message
              : t('serie.error')}
          </Callout.Text>
        </Callout.Root>
      ) : null}

      {sagasQuery.data ? (
        <Grid columns={{ initial: '1', lg: '3' }} gap="6">
          <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
            <Heading as="h2" size="4" mb="4" className="text-[#f2d9a8]">
              {t('serie.sagas_heading', { count: sagasQuery.data.total })}
            </Heading>
            <ul className="space-y-2">
              {sagasQuery.data.sagas.map(saga => (
                <li key={saga.id}>
                  <Button
                    type="button"
                    variant={selectedSagaId === saga.id ? 'soft' : 'ghost'}
                    color={selectedSagaId === saga.id ? 'orange' : 'gray'}
                    highContrast={selectedSagaId === saga.id}
                    className="h-auto w-full justify-start px-3 py-2 text-left"
                    onClick={() => {
                      setSelectedSagaId(saga.id);
                      setSelectedArcId(null);
                    }}
                  >
                    <Text as="span" size="2" weight="medium">
                      {saga.name}
                    </Text>
                    <Text as="p" size="1" color="gray" className="mt-1">
                      {t('serie.saga_meta', {
                        arcs: saga.arcNames.length,
                        episodes: saga.totalEpisodes,
                      })}
                    </Text>
                  </Button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
            <Heading as="h2" size="4" mb="4" className="text-[#f2d9a8]">
              {selectedSaga
                ? t('serie.arcs_heading', { saga: selectedSaga.name })
                : t('serie.arcs_placeholder')}
            </Heading>

            {!selectedSagaId ? (
              <Text size="2" color="gray">
                {t('serie.select_saga')}
              </Text>
            ) : null}

            {selectedSagaId && arcsQuery.isPending ? (
              <LoadingState label={t('serie.loading')} />
            ) : null}

            {selectedSagaId && arcsQuery.data ? (
              <ul className="space-y-2">
                {arcsQuery.data.arcs.map(arc => (
                  <li key={arc.id}>
                    <Button
                      type="button"
                      variant={selectedArcId === arc.id ? 'soft' : 'ghost'}
                      color={selectedArcId === arc.id ? 'orange' : 'gray'}
                      highContrast={selectedArcId === arc.id}
                      className="h-auto w-full justify-start px-3 py-2 text-left"
                      onClick={() => setSelectedArcId(arc.id)}
                    >
                      <FlexArcTitle arc={arc} />
                      <Text as="p" size="1" color="gray" className="mt-1">
                        {t('serie.arc_meta', {
                          episodes: arc.totalEpisodes,
                        })}
                      </Text>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>

          <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
            <Heading as="h2" size="4" mb="4" className="text-[#f2d9a8]">
              {selectedArc
                ? t('serie.episodes_heading', { arc: selectedArc.name })
                : t('serie.episodes_placeholder')}
            </Heading>

            {!selectedArcId ? (
              <Text size="2" color="gray">
                {t('serie.select_arc')}
              </Text>
            ) : null}

            {selectedArcId && episodesQuery.isPending ? (
              <LoadingState label={t('serie.loading')} />
            ) : null}

            {selectedArcId && episodesQuery.data ? (
              <ul className="max-h-128 space-y-3 overflow-y-auto pr-1">
                {episodesQuery.data.episodes.map(episode => (
                  <li key={episode.id}>
                    <Card className="border border-white/10 bg-[#05070d]/40 p-3">
                      <Text as="p" size="1" color="gray" mb="1">
                        {t('serie.episode_number', { number: episode.id })}
                      </Text>
                      <Text
                        as="p"
                        size="2"
                        weight="medium"
                        className="text-[#f4ede1]"
                      >
                        {episode.name}
                      </Text>
                      <Text
                        as="p"
                        size="1"
                        color="gray"
                        className="mt-2 line-clamp-2"
                      >
                        {episode.description}
                      </Text>
                      <Text as="p" size="1" className="mt-2 text-[#f2d9a8]/90">
                        {t('serie.episode_xp', { xp: episode.experience })}
                      </Text>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : null}

            {selectedArcId &&
            episodesQuery.data &&
            episodesQuery.data.total === 0 ? (
              <Text size="2" color="gray">
                {t('serie.no_episodes')}
              </Text>
            ) : null}
          </Card>
        </Grid>
      ) : null}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <Spinner size="3" />
      <Text align="center" color="gray">
        {label}
      </Text>
    </div>
  );
}

function FlexArcTitle({ arc }: { arc: { name: string; isFiller: boolean } }) {
  const { t } = useTranslation();

  return (
    <span className="flex flex-wrap items-center gap-2">
      <Text as="span" size="2" weight="medium">
        {arc.name}
      </Text>
      {arc.isFiller ? (
        <Badge color="orange" variant="soft" size="1">
          {t('serie.filler')}
        </Badge>
      ) : null}
    </span>
  );
}
