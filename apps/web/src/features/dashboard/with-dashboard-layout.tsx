import type { ReactElement, ReactNode } from 'react';

import { DashboardLayout } from '@/features/dashboard/ui/dashboard-layout.component';

export function withDashboardLayout<P>(Page: {
  (props: P): ReactElement;
  getLayout?: (page: ReactElement) => ReactNode;
}) {
  Page.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
  };

  return Page;
}
