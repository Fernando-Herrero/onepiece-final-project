import { Button, Flex, IconButton, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import {
  DASHBOARD_NAV_ITEMS,
  type DashboardNavItem,
} from '@/features/dashboard/dashboard-navigation';

type DashboardNavSidebarProps = {
  activeTab: string;
  onToggleExpanded: () => void;
};

export function DashboardNavSidebar({
  activeTab,
  onToggleExpanded,
}: DashboardNavSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-[#f2d9a8]/15 bg-[#05070d] text-[#f4ede1]">
      <Flex
        align="center"
        gap="3"
        px="4"
        py="4"
        className="border-b border-[#f2d9a8]/10"
      >
        <Button asChild variant="ghost" highContrast className="-m-0.5 font-one-piece text-xl text-[#f2d9a8]">
          <Link href="/dashboard/profile">LogPose</Link>
        </Button>
      </Flex>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {DASHBOARD_NAV_ITEMS.map(item => (
          <NavSidebarLink
            key={item.id}
            item={item}
            active={activeTab === item.id}
          />
        ))}
      </nav>

      <Flex
        align="center"
        justify="end"
        px="3"
        py="3"
        className="border-t border-[#f2d9a8]/10"
      >
        <IconButton
          type="button"
          variant="ghost"
          color="orange"
          highContrast
          className="-m-0.5"
          aria-label={t('dashboard.nav.collapse')}
          onClick={onToggleExpanded}
        >
          «
        </IconButton>
      </Flex>
    </aside>
  );
}

function NavSidebarLink({
  item,
  active,
}: {
  item: DashboardNavItem;
  active: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Button
      asChild
      variant={active ? 'soft' : 'ghost'}
      color={active ? 'orange' : 'gray'}
      highContrast={active}
      className="h-auto w-full justify-start gap-3 px-3 py-2"
    >
      <Link href={item.href}>
        <span aria-hidden>{item.icon}</span>
        <Text as="span" size="2" weight="medium">
          {t(item.labelKey)}
        </Text>
      </Link>
    </Button>
  );
}
