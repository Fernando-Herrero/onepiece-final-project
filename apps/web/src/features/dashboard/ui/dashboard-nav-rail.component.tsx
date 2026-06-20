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
    <aside className="flex h-full w-14 shrink-0 flex-col border-r border-[#f2d9a8]/15 bg-[#05070d] text-[#f4ede1]">
      <Flex
        align="center"
        justify="center"
        className="h-14 shrink-0 border-b border-[#f2d9a8]/15"
      >
        <Link
          href="/dashboard/profile"
          className="font-one-piece text-lg text-[#f2d9a8] no-underline hover:text-[#f2d9a8]"
        >
          LP
        </Link>
      </Flex>

      <nav className="flex flex-1 flex-col items-center gap-2 px-2 py-6">
        {DASHBOARD_NAV_ITEMS.map(item => (
          <NavRailLink
            key={item.id}
            item={item}
            active={activeTab === item.id}
          />
        ))}
      </nav>

      <Box px="2">
        <Tooltip side="right" content={t('dashboard.nav.expand')}>
          <IconButton
            type="button"
            variant="ghost"
            color="orange"
            highContrast
            className="m-0! box-border size-9 p-0 text-lg"
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
    <Tooltip side="right" content={t(item.labelKey)}>
      <Button
        asChild
        variant={active ? 'soft' : 'ghost'}
        color={active ? 'orange' : 'gray'}
        highContrast={active}
        className="m-0! box-border size-9 p-0 text-lg"
      >
        <Link href={item.href}>
          <span aria-hidden>{item.icon}</span>
        </Link>
      </Button>
    </Tooltip>
  );
}
