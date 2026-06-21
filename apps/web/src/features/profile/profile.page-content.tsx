import { Heading, Skeleton, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorFallback } from '@/components/error-boundary/query-error-fallback';
import { useAuthSession } from '@/features/auth/api/use-auth';
import { useProfileUser } from '@/features/profile/api/use-profile';
import type { ProfileUser } from '@/features/profile/profile.types';
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

type ProfilePageContentProps = {
  userId?: string;
};

type ProfilePageBodyProps = {
  user: ProfileUser;
  isOwner: boolean;
  isFollowing: boolean;
};

function ProfilePageBody({ user, isOwner, isFollowing }: ProfilePageBodyProps) {
  const { t } = useTranslation();
  const showRanking = isOwner;

  return (
    <div className="mx-auto max-w-6xl">
      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {isOwner
          ? t('profile.title')
          : t('profile.user_profile_title', { username: user.username })}
      </Heading>
      <Text as="p" size="2" color="gray" mb="6" className="text-[#f4ede1]/75">
        {isOwner ? t('profile.subtitle') : t('profile.user_profile_subtitle')}
      </Text>

      <div
        className={`motion-safe:animate-[profile-fade-up_0.5s_ease-out_both] grid gap-6 ${
          showRanking ? 'md:grid-cols-3' : ''
        }`}
      >
        <div
          className={`flex flex-col gap-6 ${showRanking ? 'md:col-span-2' : ''}`}
        >
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <ProfileIdentityCard
              user={user}
              isOwner={isOwner}
              isFollowing={isFollowing}
            />
            <div className="grid grid-rows-2 gap-6 sm:grid-cols-2 sm:grid-rows-1 lg:grid-cols-1 lg:grid-rows-2">
              <ProfileFollowCountsCard
                followersCount={user.followers.length}
                followingCount={user.following.length}
              />
              <ProfileCollectionTeaser
                unlockedCards={user.unlockedCards}
                isOwner={isOwner}
              />
            </div>
          </div>

          <ProfileProgressCard user={user} isOwner={isOwner} />

          <ErrorBoundary FallbackComponent={QueryErrorFallback}>
            <Suspense fallback={<ProfileStatsCardSkeleton />}>
              <ProfileStatsCard userId={user._id} />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary FallbackComponent={QueryErrorFallback}>
            <ProfilePostsTabs
              userId={user._id}
              privacy={user.privacy}
              isOwner={isOwner}
            />
          </ErrorBoundary>
        </div>

        {showRanking ? (
          <aside className="flex flex-col gap-6">
            <ErrorBoundary FallbackComponent={QueryErrorFallback}>
              <Suspense fallback={<ProfileRankingSidebarSkeleton />}>
                <ProfileRankingSidebar currentUserId={user._id} />
              </Suspense>
            </ErrorBoundary>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function ProfilePageContentRemote({ userId }: { userId: string }) {
  const { user: sessionUser } = useAuthSession();
  const { data: profileUser } = useProfileUser(userId);
  const isOwner = sessionUser?._id === profileUser._id;
  const isFollowing =
    !isOwner && sessionUser
      ? sessionUser.following.includes(profileUser._id)
      : false;

  return (
    <ProfilePageBody
      user={profileUser}
      isOwner={isOwner}
      isFollowing={isFollowing}
    />
  );
}

function ProfilePageContentSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton height="32px" width="240px" mb="2" />
      <Skeleton height="16px" width="320px" mb="6" />
      <Skeleton height="320px" />
    </div>
  );
}

export default function ProfilePageContent({ userId }: ProfilePageContentProps) {
  const { user: sessionUser } = useAuthSession();

  if (userId) {
    return (
      <ErrorBoundary FallbackComponent={QueryErrorFallback}>
        <Suspense fallback={<ProfilePageContentSkeleton />}>
          <ProfilePageContentRemote userId={userId} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (!sessionUser) {
    return null;
  }

  return (
    <ProfilePageBody user={sessionUser} isOwner isFollowing={false} />
  );
}
