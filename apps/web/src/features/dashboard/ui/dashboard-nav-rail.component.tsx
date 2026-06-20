import { Box, Button, Flex, IconButton, Tooltip } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import {
  DASHBOARD_NAV_ITEMS,
  type DashboardNavItem,
} from '@/features/dashboard/dashboard-navigation';

type DashboardNavRailProps = {
  activeTab: string;
  onToggleExpanded: () => void;
};

export function DashboardNavRail({
  activeTab,
  onToggleExpanded,
}: DashboardNavRailProps) {
  const { t } = useTranslation();

  return (
    <aside className="flex h-full w-14 shrink-0 flex-col border-r border-[#f2d9a8]/15 bg-[#05070d] py-3 text-[#f4ede1]">
      <Flex justify="center" pb="3" className="border-b border-[#f2d9a8]/10">
        <Button asChild variant="ghost" highContrast className="-m-0.5 font-one-piece text-lg text-[#f2d9a8]">
          <Link href="/dashboard/profile">LP</Link>
        </Button>
      </Flex>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
        {DASHBOARD_NAV_ITEMS.map(item => (
          <NavRailLink
            key={item.id}
            item={item}
            active={activeTab === item.id}
          />
        ))}
      </nav>

      <Box px="2">
        <Tooltip content={t('dashboard.nav.expand')}>
          <IconButton
            type="button"
            variant="ghost"
            color="orange"
            highContrast
            className="w-full"
            aria-label={t('dashboard.nav.expand')}
            onClick={onToggleExpanded}
          >
            »
          </IconButton>
        </Tooltip>
      </Box>
    </aside>
  );
}

function NavRailLink({
  item,
  active,
}: {
  item: DashboardNavItem;
  active: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Tooltip content={t(item.labelKey)}>
      <Button
        asChild
        variant={active ? 'soft' : 'ghost'}
        color={active ? 'orange' : 'gray'}
        highContrast={active}
        className="w-full text-lg"
      >
        <Link href={item.href}>
          <span aria-hidden>{item.icon}</span>
        </Link>
      </Button>
    </Tooltip>
  );
}
