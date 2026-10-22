import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  SegmentedControl,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { Suspense, useEffect, useRef } from 'react';

import { useAuthSession } from '@/features/auth/api/use-auth';
import { useDeletePostMutation } from '@/features/posts/api/use-posts';
import { PostCard } from '@/features/posts/ui/post-card.component';
import { PostFeedSkeleton } from '@/features/posts/ui/post-card-skeleton.component';
import { useProfilePosts } from '@/features/profile/api/use-profile';
import {
  PROFILE_POSTS_EMPTY_MESSAGE_KEY,
  PROFILE_POSTS_PRIVATE_MESSAGE_KEY_OTHER,
} from '@/features/profile/profile.constants';
import type {
  ProfilePostsTab,
  ProfilePrivacy,
} from '@/features/profile/profile.types';
import { useProfilePostsTabs } from '@/features/profile/use-profile-posts-tabs';

type ProfilePostsTabsProps = {
  userId: string;
  privacy: ProfilePrivacy;
  isOwner?: boolean;
};

function ProfilePostList({
  userId,
  tab,
}: {
  userId: string;
  tab: ProfilePostsTab;
}) {
  const { t } = useTranslation();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useProfilePosts(userId, tab);
  const posts = data.pages.flatMap(page => page.posts);
  const deletePost = useDeletePostMutation();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // isFetching y no isFetchingNextPage: pedir página cancela una revalidación
  // en curso. Rehacerlo al terminar cada petición relanza la notificación
  // inicial del observer: si el centinela sigue a la vista, encadena la siguiente.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetching || isFetchNextPageError) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        void fetchNextPage();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, isFetchNextPageError]);

  if (posts.length === 0) {
    return (
      <Text
        as="p"
        size="2"
        align="center"
        className="text-foreground/50 py-8 italic"
      >
        {t(PROFILE_POSTS_EMPTY_MESSAGE_KEY[tab])}
      </Text>
    );
  }

  return (
    <Flex
      direction="column"
      gap="2"
      className={
        posts.length > 1
          ? 'max-h-[min(480px,55vh)] min-h-0 overflow-y-auto overscroll-y-contain'
          : undefined
      }
    >
      {posts.map(post => (
        <Box key={post._id} className="shrink-0">
          <PostCard
            post={post}
            onDeletePost={postId => deletePost.mutate(postId)}
            isDeleting={
              deletePost.isPending && deletePost.variables === post._id
            }
          />
        </Box>
      ))}
      {hasNextPage ? (
        <Box ref={sentinelRef} className="shrink-0">
          {isFetchingNextPage ? (
            <PostFeedSkeleton count={1} />
          ) : isFetchNextPageError ? (
            <Flex justify="center" py="2">
              <Button
                type="button"
                variant="soft"
                color="gray"
                highContrast
                className="cursor-pointer"
                onClick={() => void fetchNextPage()}
              >
                {t('errors.retry')}
              </Button>
            </Flex>
          ) : null}
        </Box>
      ) : null}
    </Flex>
  );
}

export function ProfilePostsTabs({
  userId,
  privacy,
  isOwner = true,
}: ProfilePostsTabsProps) {
  const { t } = useTranslation();
  const { isAdmin } = useAuthSession();
  const {
    activeTab,
    setActiveTab,
    tabs,
    isActiveTabPrivate,
    privateMessageKey,
  } = useProfilePostsTabs(privacy, isOwner, isAdmin);

  const privateMessage = isOwner
    ? privateMessageKey
    : PROFILE_POSTS_PRIVATE_MESSAGE_KEY_OTHER[activeTab];

  const activeTabIndex = tabs.findIndex(tab => tab.key === activeTab);
  const isFirstTab = activeTabIndex === 0;
  const isLastTab = activeTabIndex === tabs.length - 1;

  const tabsScrollMaskClass = isFirstTab
    ? 'mask-[linear-gradient(to_right,black_85%,transparent_100%)]'
    : isLastTab
      ? 'mask-[linear-gradient(to_left,black_85%,transparent_100%)]'
      : 'mask-[linear-gradient(to_right,transparent_0%,black_12%,black_88%,transparent_100%)]';

  return (
    <Card className="card p-4">
      <Flex align="start" justify="between" gap="3" mb="4" wrap="wrap">
        <Heading as="h2" size="3" className="text-highlight">
          {t('profile.activity_title')}
        </Heading>
        {isOwner ? (
          <Link
            href="/dashboard/settings/privacy"
            className="text-highlight/75 hover:text-highlight text-xs underline-offset-2 transition hover:underline"
          >
            {t('profile.activity_manage_visibility')}
          </Link>
        ) : null}
      </Flex>
      <Box
        className={`relative mb-4 min-w-0 scrollbar-none overflow-x-auto pb-1 [-ms-overflow-style:none] md:overflow-x-visible md:mask-none [&::-webkit-scrollbar]:hidden ${tabsScrollMaskClass}`}
      >
        <SegmentedControl.Root
          size="2"
          value={activeTab}
          onValueChange={value => {
            if (!value) {
              return;
            }

            const selectedTab = tabs.find(tab => tab.key === value);
            if (selectedTab?.visible) {
              setActiveTab(value as ProfilePostsTab);
            }
          }}
          className="profile-posts-segmented border-highlight/15 w-max min-w-full border [&_.rt-SegmentedControlItem]:shrink-0 [&_.rt-SegmentedControlItem]:whitespace-nowrap"
        >
          {tabs.map(tab => (
            <SegmentedControl.Item
              key={tab.key}
              value={tab.key}
              className={
                !tab.visible ? 'pointer-events-none opacity-50' : undefined
              }
            >
              {tab.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </Box>

      {isActiveTabPrivate ? (
        <Flex direction="column" align="center" gap="2" className="py-8">
          <Text as="p" size="2" align="center" className="text-foreground/50">
            {t(privateMessage)}
          </Text>
          {isOwner ? (
            <Link
              href="/dashboard/settings"
              className="text-highlight/80 hover:text-highlight text-sm underline-offset-2 hover:underline"
            >
              {t('profile.activity_private_settings_link')}
            </Link>
          ) : null}
        </Flex>
      ) : (
        <Suspense key={activeTab} fallback={<PostFeedSkeleton count={2} />}>
          <ProfilePostList userId={userId} tab={activeTab} />
        </Suspense>
      )}
    </Card>
  );
}
