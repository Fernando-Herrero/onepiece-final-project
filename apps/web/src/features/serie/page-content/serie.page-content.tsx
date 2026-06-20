import { Badge, Heading, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';
import { Reveal } from '@/features/landing/ui/reveal.component';
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
  const selectedArc = arcsQuery.data?.arcs.find(arc => arc.id === selectedArcId);

  return (
    <LandingPublicLayout title={t('serie.meta_title')}>
      <Reveal>
        <Heading
          as="h1"
          size="7"
          mb="2"
          align="center"
          className="font-one-piece tracking-wide text-[#f2d9a8]"
        >
          {t('serie.title')}
        </Heading>
        <Text
          as="p"
          size="3"
          color="gray"
          align="center"
          mb="8"
          className="mx-auto max-w-2xl text-[#f4ede1]/75"
        >
          {t('serie.subtitle')}
        </Text>
      </Reveal>

      {sagasQuery.isPending ? (
        <Text align="center" color="gray">
          {t('serie.loading')}
        </Text>
      ) : null}

      {sagasQuery.isError ? (
        <Text align="center" color="red">
          {sagasQuery.error instanceof Error
            ? sagasQuery.error.message
            : t('serie.error')}
        </Text>
      ) : null}

      {sagasQuery.data ? (
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.4fr)]">
          <Reveal delay={0.05}>
            <section className="rounded-xl border border-white/10 bg-white/5 p-4">
              <Heading as="h2" size="4" mb="4" className="text-[#f2d9a8]">
                {t('serie.sagas_heading', { count: sagasQuery.data.total })}
              </Heading>
              <ul className="space-y-2">
                {sagasQuery.data.sagas.map(saga => (
                  <li key={saga.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSagaId(saga.id);
                        setSelectedArcId(null);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                        selectedSagaId === saga.id
                          ? 'bg-[#f2d9a8]/15 text-[#f2d9a8]'
                          : 'text-[#f4ede1]/85 hover:bg-white/5'
                      }`}
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
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal delay={0.1}>
            <section className="rounded-xl border border-white/10 bg-white/5 p-4">
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
                <Text size="2" color="gray">
                  {t('serie.loading')}
                </Text>
              ) : null}

              {selectedSagaId && arcsQuery.data ? (
                <ul className="space-y-2">
                  {arcsQuery.data.arcs.map(arc => (
                    <li key={arc.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedArcId(arc.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                          selectedArcId === arc.id
                            ? 'bg-[#f2d9a8]/15 text-[#f2d9a8]'
                            : 'text-[#f4ede1]/85 hover:bg-white/5'
                        }`}
                      >
                        <FlexArcTitle arc={arc} />
                        <Text as="p" size="1" color="gray" className="mt-1">
                          {t('serie.arc_meta', {
                            episodes: arc.totalEpisodes,
                          })}
                        </Text>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </Reveal>

          <Reveal delay={0.15}>
            <section className="rounded-xl border border-white/10 bg-white/5 p-4">
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
                <Text size="2" color="gray">
                  {t('serie.loading')}
                </Text>
              ) : null}

              {selectedArcId && episodesQuery.data ? (
                <ul className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                  {episodesQuery.data.episodes.map(episode => (
                    <li
                      key={episode.id}
                      className="rounded-lg border border-white/10 bg-[#05070d]/40 p-3"
                    >
                      <Text as="p" size="1" color="gray" mb="1">
                        {t('serie.episode_number', { number: episode.id })}
                      </Text>
                      <Text as="p" size="2" weight="medium" className="text-[#f4ede1]">
                        {episode.name}
                      </Text>
                      <Text as="p" size="1" color="gray" className="mt-2 line-clamp-2">
                        {episode.description}
                      </Text>
                      <Text as="p" size="1" className="mt-2 text-[#f2d9a8]/90">
                        {t('serie.episode_xp', { xp: episode.experience })}
                      </Text>
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
            </section>
          </Reveal>
        </div>
      ) : null}
    </LandingPublicLayout>
  );
}

function FlexArcTitle({
  arc,
}: {
  arc: { name: string; isFiller: boolean };
}) {
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
