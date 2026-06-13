import { useTranslation } from 'next-i18next/pages';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { SessionSkeletonComponent } from '@/features/auth/ui/auth-skeleton.component';
import { SessionActiveComponent } from '@/features/auth/ui/session-active.component';
import { useHasAuthToken } from '@/features/auth/use-has-auth-token';
import { GuestLinksComponent } from '@/features/home/ui/guest-links.component';
import { HomeErrorFallbackComponent } from '@/features/home/ui/home-error-fallback.component';
import { UsersStatsComponent } from '@/features/users/ui/users-stats.component';

export default function HomePageContent() {
  const { t } = useTranslation();
  const hasToken = useHasAuthToken();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">{t('home.title')}</h1>

      <ErrorBoundary FallbackComponent={HomeErrorFallbackComponent}>
        {hasToken ? (
          <Suspense fallback={<SessionSkeletonComponent />}>
            <SessionActiveComponent />
          </Suspense>
        ) : (
          <GuestLinksComponent />
        )}

        <Suspense
          fallback={<p className="text-sm">{t('home.checking_api')}</p>}
        >
          <UsersStatsComponent />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
