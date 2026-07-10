import { Button, Flex, IconButton, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import { Icon } from '@/components/icons/icon';
import {
  DASHBOARD_MAIN_NAV_ITEMS,
  DASHBOARD_SETTINGS_NAV_ITEM,
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
        px="4"
        className="h-14 shrink-0 border-b border-[#f2d9a8]/15"
      >
        <Link
          href="/dashboard/profile"
          className="font-one-piece text-lg text-[#f2d9a8] no-underline hover:text-[#f2d9a8]"
        >
          LOGPOSE
        </Link>
      </Flex>

      <nav className="flex flex-1 flex-col gap-2 px-3 py-4">
        {DASHBOARD_MAIN_NAV_ITEMS.map(item => (
          <NavSidebarLink
            key={item.id}
            item={item}
            active={activeTab === item.id}
          />
        ))}
      </nav>

      <Flex
        direction="column"
        gap="2"
        px="3"
        py="3"
        className="border-t border-[#f2d9a8]/15"
      >
        <NavSidebarLink
          item={DASHBOARD_SETTINGS_NAV_ITEM}
          active={activeTab === DASHBOARD_SETTINGS_NAV_ITEM.id}
        />
        <Flex justify="end">
          <IconButton
            type="button"
            variant="ghost"
            color="orange"
            highContrast
            className="m-0!"
            aria-label={t('dashboard.nav.collapse')}
            onClick={onToggleExpanded}
          >
            <Icon.CaretLeft />
          </IconButton>
        </Flex>
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
  const NavIcon = Icon[item.icon];

  return (
    <Button
      asChild
      variant={active ? 'soft' : 'ghost'}
      color={active ? 'orange' : 'gray'}
      highContrast={active}
      className="box-border h-auto w-full justify-start gap-3 px-3 py-2"
    >
      <Link href={item.href}>
        <NavIcon aria-hidden />
        <Text as="span" size="2" weight="medium">
          {t(item.labelKey)}
        </Text>
      </Link>
    </Button>
  );
}
