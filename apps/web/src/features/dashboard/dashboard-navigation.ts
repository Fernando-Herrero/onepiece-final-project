export type DashboardNavItem = {
  id: string;
  labelKey:
    | 'dashboard.nav.profile'
    | 'dashboard.nav.community'
    | 'dashboard.nav.serie'
    | 'dashboard.nav.cards'
    | 'dashboard.nav.search'
    | 'dashboard.nav.notifications'
    | 'dashboard.nav.settings';
  href: string;
  icon: string;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: 'profile',
    labelKey: 'dashboard.nav.profile',
    href: '/dashboard/profile',
    icon: '👤',
  },
  {
    id: 'community',
    labelKey: 'dashboard.nav.community',
    href: '/dashboard/community',
    icon: '💬',
  },
  {
    id: 'serie',
    labelKey: 'dashboard.nav.serie',
    href: '/dashboard/serie',
    icon: '📺',
  },
  {
    id: 'cards',
    labelKey: 'dashboard.nav.cards',
    href: '/dashboard/cards',
    icon: '🃏',
  },
  {
    id: 'search',
    labelKey: 'dashboard.nav.search',
    href: '/dashboard/search',
    icon: '🔍',
  },
  {
    id: 'notifications',
    labelKey: 'dashboard.nav.notifications',
    href: '/dashboard/notifications',
    icon: '🔔',
  },
  {
    id: 'settings',
    labelKey: 'dashboard.nav.settings',
    href: '/dashboard/settings',
    icon: '⚙️',
  },
];

export const DASHBOARD_MAIN_NAV_ITEMS = DASHBOARD_NAV_ITEMS.filter(
  item =>
    item.id === 'profile' ||
    item.id === 'community' ||
    item.id === 'serie' ||
    item.id === 'cards',
);

export const DASHBOARD_TOPBAR_NAV_ITEMS = DASHBOARD_NAV_ITEMS.filter(
  item => item.id === 'search' || item.id === 'notifications',
);

export const DASHBOARD_SETTINGS_NAV_ITEM = DASHBOARD_NAV_ITEMS.find(
  item => item.id === 'settings',
)!;

export function getDashboardActiveTab(pathname: string) {
  const match = DASHBOARD_NAV_ITEMS.find(item => pathname.startsWith(item.href));
  return match?.id ?? 'profile';
}

export function getDashboardSectionLabelKey(pathname: string) {
  const match = DASHBOARD_NAV_ITEMS.find(item => pathname.startsWith(item.href));
  return match?.labelKey ?? 'dashboard.nav.profile';
}
