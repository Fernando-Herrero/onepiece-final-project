import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import {
  PROFILE_POSTS_PRIVATE_MESSAGE_KEY,
  PROFILE_POSTS_TAB_CONFIG,
} from '@/features/profile/profile.constants';
import type {
  ProfilePostsTab,
  ProfilePrivacy,
} from '@/features/profile/profile.types';

export function useProfilePostsTabs(privacy: ProfilePrivacy) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ProfilePostsTab>('posts');

  const tabs = PROFILE_POSTS_TAB_CONFIG.map(tab => ({
    key: tab.key,
    label: t(tab.labelKey),
    visible: privacy[tab.privacyKey],
  }));

  const activeTabConfig = tabs.find(tab => tab.key === activeTab);
  const isActiveTabPrivate =
    activeTabConfig !== undefined && !activeTabConfig.visible;
  const privateMessageKey = PROFILE_POSTS_PRIVATE_MESSAGE_KEY[activeTab];

  return {
    activeTab,
    setActiveTab,
    tabs,
    isActiveTabPrivate,
    privateMessageKey,
  };
}
