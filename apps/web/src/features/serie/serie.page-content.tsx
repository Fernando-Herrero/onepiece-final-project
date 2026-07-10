import {
  Box,
  Callout,
  Card,
  Flex,
  Heading,
  Progress,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { gsap } from 'gsap';
import Image from 'next/image';
import { useTranslation } from 'next-i18next/pages';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorFallback } from '@/components/error-boundary/query-error-fallback';
import { useMeQuery } from '@/features/auth/api/use-auth';
import { isMotionDisabled } from '@/features/landing/motion/landing-motion';
import { useSuspenseSerieSagas } from '@/features/serie/api/use-serie';
import {
  DEFAULT_SERIE_PROGRESS,
  SERIE_TOTAL_XP,
} from '@/features/serie/serie.constants';
import { getSerieXpPercent } from '@/features/serie/serie.selectors';
import type { SerieProgress } from '@/features/serie/serie.types';
import { SerieSagaBlock } from '@/features/serie/ui/serie-saga-block.component';

type SerieSagaListProps = {
  progress: SerieProgress;
  openSagaIds: Record<number, boolean>;
  onToggleSaga: (sagaId: number) => void;
  openArcIds: Record<number, boolean>;
  onToggleArc: (arcId: number) => void;
};

function SerieSagaList({
  progress,
  openSagaIds,
  onToggleSaga,
  openArcIds,
  onToggleArc,
}: SerieSagaListProps) {
  const { data } = useSuspenseSerieSagas();

  return (
    <Flex direction="column" gap="3">
      {data.sagas.map(saga => (
        <SerieSagaBlock
          key={saga.id}
          saga={saga}
          isOpen={openSagaIds[saga.id] ?? false}
          onToggle={() => onToggleSaga(saga.id)}
          openArcIds={openArcIds}
          onToggleArc={onToggleArc}
          progress={progress}
        />
      ))}
    </Flex>
  );
}

function SerieSagaListSkeleton() {
  const { t } = useTranslation();

  return (
    <Flex direction="column" align="center" gap="3" py="8">
      <Spinner size="3" />
      <Text align="center" color="gray">
        {t('serie.loading')}
      </Text>
    </Flex>
  );
}

export default function SeriePageContent() {
  const { t } = useTranslation();
  const meQuery = useMeQuery();
  const heroRef = useRef<HTMLDivElement>(null);
  const [openSagaIds, setOpenSagaIds] = useState<Record<number, boolean>>({});
  const [openArcIds, setOpenArcIds] = useState<Record<number, boolean>>({});

  const progress = meQuery.data?.serieProgress ?? DEFAULT_SERIE_PROGRESS;
  const experience = meQuery.data?.experience ?? 0;
  const xpPercent = getSerieXpPercent(experience);

  useEffect(() => {
    if (isMotionDisabled() || !heroRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out' },
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const toggleSaga = (sagaId: number) => {
    setOpenSagaIds(current => ({
      ...current,
      [sagaId]: !current[sagaId],
    }));
  };

  const toggleArc = (arcId: number) => {
    setOpenArcIds(current => ({
      ...current,
      [arcId]: !current[arcId],
    }));
  };

  return (
    <Box className="mx-auto max-w-3xl pb-24 lg:max-w-4xl">
      <Card
        ref={heroRef}
        className="relative mb-8 overflow-hidden rounded-3xl border border-[#f2d9a8]/15 bg-transparent p-0 opacity-0 shadow-none"
      >
        <Box className="absolute inset-0 -z-20">
          <Image
            src="/landing/map/map-1024.webp"
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover opacity-35"
            priority
          />
        </Box>
        <Box
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(90%_80%_at_50%_20%,rgba(242,217,168,0.12)_0%,rgba(5,7,13,0.55)_45%,rgba(5,7,13,0.95)_100%)]"
        />
        <Box className="landing-grain -z-10" aria-hidden="true" />

        <Box className="relative px-6 py-10 md:px-10 md:py-12">
          <Text
            as="p"
            size="1"
            className="font-road-captain mb-3 tracking-[0.35em] text-[#f2d9a8]/70 uppercase"
          >
            {t('serie.hero_eyebrow')}
          </Text>
          <Heading
            as="h1"
            className="font-one-piece text-[clamp(2rem,6vw,3.5rem)] leading-[0.95] tracking-wide text-[#f2d9a8] [text-shadow:0_2px_0_#2a1c12,0_0_36px_rgba(220,150,70,0.28)]"
          >
            {t('serie.title')}
          </Heading>
          <Text
            as="p"
            size="2"
            className="mt-4 max-w-xl leading-relaxed text-[#f4ede1]/80"
          >
            {t('serie.subtitle')}
          </Text>

          <Box className="mt-8 max-w-md">
            <Flex align="center" justify="between" gap="3" mb="2">
              <Text as="p" size="1" className="text-[#f4ede1]/70">
                {t('serie.progress_label')}
              </Text>
              <Text as="p" size="1" weight="medium" className="text-[#f2d9a8]">
                {experience.toLocaleString()} /{' '}
                {SERIE_TOTAL_XP.toLocaleString()} XP
              </Text>
            </Flex>
            <Progress
              value={xpPercent}
              size="2"
              className="profile-xp-progress h-2"
            />
          </Box>

          <Callout.Root
            color="orange"
            variant="surface"
            size="1"
            className="mt-6"
          >
            <Callout.Text>{t('serie.progress_save_hint')}</Callout.Text>
          </Callout.Root>
        </Box>
      </Card>

      <ErrorBoundary FallbackComponent={QueryErrorFallback}>
        <Suspense fallback={<SerieSagaListSkeleton />}>
          <SerieSagaList
            progress={progress}
            openSagaIds={openSagaIds}
            onToggleSaga={toggleSaga}
            openArcIds={openArcIds}
            onToggleArc={toggleArc}
          />
        </Suspense>
      </ErrorBoundary>
    </Box>
  );
}
