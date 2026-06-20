import { Flex } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import type { PropsWithChildren } from 'react';

import {
  getDashboardActiveTab,
  getDashboardSectionLabelKey,
} from '@/features/dashboard/dashboard-navigation';
import { DashboardNavRail } from '@/features/dashboard/ui/dashboard-nav-rail.component';
import { DashboardNavSidebar } from '@/features/dashboard/ui/dashboard-nav-sidebar.component';
import { DashboardTopBar } from '@/features/dashboard/ui/dashboard-top-bar.component';
import { useNavExpanded } from '@/features/dashboard/use-nav-expanded';

export function DashboardLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const { t } = useTranslation();
  const { navExpanded, toggleNavExpanded } = useNavExpanded();

  const activeTab = getDashboardActiveTab(router.pathname);
  const sectionLabel = t(getDashboardSectionLabelKey(router.pathname));

  return (
    <Flex direction="row" className="h-dvh min-h-0 bg-[#0b1120]">
      <div
        className={`shrink-0 overflow-hidden transition-[width] duration-200 ${
          navExpanded ? 'w-[220px]' : 'w-14'
        }`}
      >
        {navExpanded ? (
          <DashboardNavSidebar
            activeTab={activeTab}
            onToggleExpanded={toggleNavExpanded}
          />
        ) : (
          <DashboardNavRail
            activeTab={activeTab}
            onToggleExpanded={toggleNavExpanded}
          />
        )}
      </div>

      <Flex direction="column" className="min-w-0 flex-1 overflow-hidden">
        <DashboardTopBar sectionLabel={sectionLabel} />
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </Flex>
    </Flex>
  );
}
