import type { DashboardNavIcon } from '@/components/icons/icon';

export type DashboardNavLabelKey =
  | 'dashboard.nav.profile'
  | 'dashboard.nav.community'
  | 'dashboard.nav.serie'
  | 'dashboard.nav.cards'
  | 'dashboard.nav.search'
  | 'dashboard.nav.notifications'
  | 'dashboard.nav.settings'
  | 'dashboard.nav.admin'
  | 'dashboard.nav.user_profile';

export type DashboardNavItem = {
  id: string;
  labelKey: Exclude<DashboardNavLabelKey, 'dashboard.nav.user_profile'>;
  href: string;
  icon: DashboardNavIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: 'profile',
    labelKey: 'dashboard.nav.profile',
    href: '/dashboard/profile',
    icon: 'User',
  },
  {
    id: 'community',
    labelKey: 'dashboard.nav.community',
    href: '/dashboard/community',
    icon: 'Community',
  },
  {
    id: 'serie',
    labelKey: 'dashboard.nav.serie',
    href: '/dashboard/serie',
    icon: 'Serie',
  },
  {
    id: 'cards',
    labelKey: 'dashboard.nav.cards',
    href: '/dashboard/cards',
    icon: 'Cards',
  },
  {
    id: 'search',
    labelKey: 'dashboard.nav.search',
    href: '/dashboard/search',
    icon: 'Search',
  },
  {
    id: 'notifications',
    labelKey: 'dashboard.nav.notifications',
    href: '/dashboard/notifications',
    icon: 'Bell',
  },
  {
    id: 'settings',
    labelKey: 'dashboard.nav.settings',
    href: '/dashboard/settings',
    icon: 'Settings',
  },
];

export const DASHBOARD_ADMIN_NAV_ITEM = {
  id: 'admin',
  labelKey: 'dashboard.nav.admin',
  href: '/dashboard/admin',
  icon: 'Admin',
} as const satisfies DashboardNavItem;

export const DASHBOARD_MAIN_NAV_ITEMS = DASHBOARD_NAV_ITEMS.filter(
  item =>
    item.id === 'profile' ||
    item.id === 'community' ||
    item.id === 'serie' ||
    item.id === 'cards',
);

export function getDashboardNavItems(isAdmin: boolean): DashboardNavItem[] {
  return isAdmin
    ? [...DASHBOARD_MAIN_NAV_ITEMS, DASHBOARD_ADMIN_NAV_ITEM]
    : DASHBOARD_MAIN_NAV_ITEMS;
}

export const DASHBOARD_TOPBAR_NAV_ITEMS = DASHBOARD_NAV_ITEMS.filter(
  item => item.id === 'search' || item.id === 'notifications',
);

export const DASHBOARD_SETTINGS_NAV_ITEM = DASHBOARD_NAV_ITEMS.find(
  item => item.id === 'settings',
)!;

export function getDashboardActiveTab(pathname: string) {
  if (pathname.startsWith('/dashboard/admin')) {
    return 'admin';
  }

  const match = DASHBOARD_NAV_ITEMS.find(item =>
    pathname.startsWith(item.href),
  );
  return match?.id ?? 'profile';
}

export function getDashboardSectionLabelKey(
  pathname: string,
): DashboardNavLabelKey {
  if (pathname.startsWith('/dashboard/admin')) {
    return 'dashboard.nav.admin';
  }

  if (pathname.startsWith('/dashboard/users/')) {
    return 'dashboard.nav.user_profile';
  }

  const match = DASHBOARD_NAV_ITEMS.find(item =>
    pathname.startsWith(item.href),
  );
  return match?.labelKey ?? 'dashboard.nav.profile';
}
