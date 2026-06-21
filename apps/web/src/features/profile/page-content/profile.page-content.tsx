import { Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorFallback } from '@/components/error-boundary/query-error-fallback';
import { useAuthSession } from '@/features/auth/api/use-auth';
import { ProfileCollectionTeaser } from '@/features/profile/ui/profile-collection-teaser.component';
import { ProfileFollowCountsCard } from '@/features/profile/ui/profile-follow-counts-card.component';
import { ProfileIdentityCard } from '@/features/profile/ui/profile-identity-card.component';
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

      <div className="motion-safe:animate-[profile-fade-up_0.5s_ease-out_both] grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <ProfileIdentityCard user={user} />
            <div className="grid grid-rows-2 gap-6 sm:grid-cols-2 sm:grid-rows-1 lg:grid-cols-1 lg:grid-rows-2">
              <ProfileFollowCountsCard
                followersCount={user.followers.length}
                followingCount={user.following.length}
              />
              <ProfileCollectionTeaser unlockedCards={user.unlockedCards} />
            </div>
          </div>

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
      </div>
    </div>
  );
}
