import { Grid, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorFallback } from '@/components/error-boundary/query-error-fallback';
import { useAuthSession } from '@/features/auth/api/use-auth';
import { ProfileIdentityRow } from '@/features/profile/ui/profile-identity-row.component';
import { ProfilePostsTabs } from '@/features/profile/ui/profile-posts-tabs.component';
import { ProfileProgressCard } from '@/features/profile/ui/profile-progress-card.component';
import {
  ProfileRankingSidebar,
  ProfileRankingSidebarSkeleton,
} from '@/features/profile/ui/profile-ranking-sidebar.component';
import {
  ProfileStatsCard,
  ProfileStatsCardSkeleton,
} from '@/features/profile/ui/profile-stats-card.component';

export default function ProfilePageContent() {
  const { t } = useTranslation();
  const { user } = useAuthSession();

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {t('profile.title')}
      </Heading>
      <Text as="p" size="2" color="gray" mb="6" className="text-[#f4ede1]/75">
        {t('profile.subtitle')}
      </Text>

      <Grid columns={{ initial: '1', lg: '3' }} gap="6">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ProfileIdentityRow user={user} />
          <ProfileProgressCard user={user} />
          <ErrorBoundary FallbackComponent={QueryErrorFallback}>
            <Suspense fallback={<ProfileStatsCardSkeleton />}>
              <ProfileStatsCard userId={user._id} />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary FallbackComponent={QueryErrorFallback}>
            <ProfilePostsTabs userId={user._id} privacy={user.privacy} />
          </ErrorBoundary>
        </div>

        <aside className="flex flex-col gap-6">
          <ErrorBoundary FallbackComponent={QueryErrorFallback}>
            <Suspense fallback={<ProfileRankingSidebarSkeleton />}>
              <ProfileRankingSidebar currentUserId={user._id} />
            </Suspense>
          </ErrorBoundary>
        </aside>
      </Grid>
    </div>
  );
}
