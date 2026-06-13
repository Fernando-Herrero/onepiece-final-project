import { useTranslation } from 'next-i18next/pages';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { HomeSkeleton } from '@/components/skeleton/auth-skeleton';
import { HomeErrorFallback } from '@/features/auth/ui/home-error-fallback';
import {
  HomeGuestLinks,
  HomeSession,
} from '@/features/auth/ui/home-session';
import { HomeUsersStats } from '@/features/auth/ui/home-users-stats';
import { useHasAuthToken } from '@/features/auth/use-has-auth-token';

export function HomePageContent() {
  const { t } = useTranslation();
  const hasToken = useHasAuthToken();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">{t('home.title')}</h1>

      <ErrorBoundary FallbackComponent={HomeErrorFallback}>
        {hasToken ? (
          <Suspense fallback={<HomeSkeleton />}>
            <HomeSession />
          </Suspense>
        ) : (
          <HomeGuestLinks />
        )}

        <Suspense fallback={<p className="text-sm">{t('home.checking_api')}</p>}>
          <HomeUsersStats />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
