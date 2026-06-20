import { Flex } from '@radix-ui/themes';
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
        <Link
          href="/dashboard/profile"
          className="font-one-piece text-lg text-[#f2d9a8]"
        >
          LP
        </Link>
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

      <div className="px-2">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex w-full items-center justify-center rounded-lg py-2 text-[#f2d9a8]/80 transition-colors hover:bg-[#f2d9a8]/10"
          aria-label={t('dashboard.nav.expand')}
        >
          »
        </button>
      </div>
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
    <Link
      href={item.href}
      title={t(item.labelKey)}
      className={`flex items-center justify-center rounded-lg py-2 text-lg transition-colors ${
        active ? 'bg-[#f2d9a8]/15 ring-1 ring-[#f2d9a8]/30' : 'hover:bg-white/5'
      }`}
    >
      <span aria-hidden>{item.icon}</span>
    </Link>
  );
}
