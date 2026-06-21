import {
  Card,
  Flex,
  Heading,
  SegmentedControl,
  Skeleton,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { Suspense } from 'react';

import { useProfilePosts } from '@/features/profile/api/use-profile';
import { useProfilePostsTabs } from '@/features/profile/api/use-profile-posts-tabs';
import { PROFILE_POSTS_EMPTY_MESSAGE_KEY } from '@/features/profile/profile.constants';
import type {
  ProfilePostsTab,
  ProfilePrivacy,
} from '@/features/profile/profile.types';

type ProfilePostsTabsProps = {
  userId: string;
  privacy: ProfilePrivacy;
};

export function ProfilePostListSkeleton() {
  return (
    <Flex direction="column" gap="2">
      {Array.from({ length: 2 }, (_, index) => (
        <Card
          key={index}
          className="border border-[#f2d9a8]/10 bg-[#05070d]/40 p-4"
        >
          <Skeleton height="14px" width="30%" mb="3" />
          <Skeleton height="16px" width="100%" mb="2" />
          <Skeleton height="16px" width="85%" mb="3" />
          <Flex gap="3">
            <Skeleton height="12px" width="48px" />
            <Skeleton height="12px" width="64px" />
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}

function ProfilePostList({
  userId,
  tab,
}: {
  userId: string;
  tab: ProfilePostsTab;
}) {
  const { t, i18n } = useTranslation();
  const { data: posts } = useProfilePosts(userId, tab);

  if (posts.length === 0) {
    return (
      <Text
        as="p"
        size="2"
        align="center"
        className="py-8 text-[#f4ede1]/50 italic"
      >
        {t(PROFILE_POSTS_EMPTY_MESSAGE_KEY[tab])}
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="2" className="max-h-96 overflow-y-auto">
      {posts.map(post => {
        const authorName =
          post.userId.displayName?.trim() || `@${post.userId.username}`;
        const createdAtLabel = post.createdAt
          ? new Date(post.createdAt).toLocaleDateString(i18n.language)
          : null;

        return (
          <Card
            key={post._id}
            className="border border-[#f2d9a8]/10 bg-[#05070d]/40 p-4"
          >
            <Text as="p" size="1" color="gray" mb="1">
              {authorName}
              {createdAtLabel ? ` · ${createdAtLabel}` : ''}
            </Text>
            <Text as="p" size="2" className="text-[#f4ede1]/90">
              {post.text}
            </Text>
            <Flex gap="3" mt="2">
              <Text as="span" size="1" color="gray">
                {t('profile.post_likes_count', { count: post.likesCount })}
              </Text>
              <Text as="span" size="1" color="gray">
                {t('profile.post_comments_count', {
                  count: post.commentsCount,
                })}
              </Text>
            </Flex>
          </Card>
        );
      })}
    </Flex>
  );
}

export function ProfilePostsTabs({ userId, privacy }: ProfilePostsTabsProps) {
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    tabs,
    isActiveTabPrivate,
    privateMessageKey,
  } = useProfilePostsTabs(privacy);

  const tabsScrollMaskClass =
    activeTab === 'comments'
      ? 'mask-[linear-gradient(to_left,black_85%,transparent_100%)]'
      : activeTab === 'posts'
        ? 'mask-[linear-gradient(to_right,black_85%,transparent_100%)]'
        : 'mask-[linear-gradient(to_right,transparent_0%,black_12%,black_88%,transparent_100%)]';

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
      <Flex align="start" justify="between" gap="3" mb="4" wrap="wrap">
        <Heading as="h2" size="3" className="text-[#f2d9a8]">
          {t('profile.activity_title')}
        </Heading>
        <Link
          href="/dashboard/settings"
          className="text-xs text-[#f2d9a8]/75 underline-offset-2 transition hover:text-[#f2d9a8] hover:underline"
        >
          {t('profile.activity_manage_visibility')}
        </Link>
      </Flex>
      <div
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
          className="profile-posts-segmented w-max min-w-full border border-[#f2d9a8]/15 [&_.rt-SegmentedControlItem]:shrink-0 [&_.rt-SegmentedControlItem]:whitespace-nowrap"
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
      </div>

      {isActiveTabPrivate ? (
        <Flex direction="column" align="center" gap="2" className="py-8">
          <Text as="p" size="2" align="center" className="text-[#f4ede1]/50">
            {t(privateMessageKey)}
          </Text>
          <Link
            href="/dashboard/settings"
            className="text-sm text-[#f2d9a8]/80 underline-offset-2 hover:text-[#f2d9a8] hover:underline"
          >
            {t('profile.activity_private_settings_link')}
          </Link>
        </Flex>
      ) : (
        <Suspense key={activeTab} fallback={<ProfilePostListSkeleton />}>
          <ProfilePostList userId={userId} tab={activeTab} />
        </Suspense>
      )}
    </Card>
  );
}
