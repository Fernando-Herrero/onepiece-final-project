import { Flex, Text } from '@radix-ui/themes';
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
        <Link href="/dashboard/profile" className="font-one-piece text-xl text-[#f2d9a8]">
          LogPose
        </Link>
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

      <div className="border-t border-[#f2d9a8]/10 px-3 py-3">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex w-full items-center justify-end rounded-lg px-2 py-2 text-sm text-[#f2d9a8]/80 transition-colors hover:bg-[#f2d9a8]/10"
        >
          {t('dashboard.nav.collapse')} «
        </button>
      </div>
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
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
        active
          ? 'bg-[#f2d9a8]/15 text-[#f2d9a8]'
          : 'text-[#f4ede1]/85 hover:bg-white/5'
      }`}
    >
      <span aria-hidden>{item.icon}</span>
      <Text as="span" size="2" weight="medium">
        {t(item.labelKey)}
      </Text>
    </Link>
  );
}
