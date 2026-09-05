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

/**
 * La privacidad de actividad solo protege de visitantes externos: el dueño
 * del perfil y los admin siempre ven todas las pestañas, igual que ya hace
 * la API en `assertVisibleUser`.
 */
export function useProfilePostsTabs(
  privacy: ProfilePrivacy,
  isOwner: boolean,
  isAdmin: boolean,
) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ProfilePostsTab>('posts');

  const bypassPrivacy = isOwner || isAdmin;
  const tabs = PROFILE_POSTS_TAB_CONFIG.map(tab => ({
    key: tab.key,
    label: t(tab.labelKey),
    visible: bypassPrivacy || privacy[tab.privacyKey],
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
