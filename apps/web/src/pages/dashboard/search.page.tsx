import type { GetServerSideProps } from 'next';

import { DashboardPlaceholderPageContent } from '@/features/dashboard/page-content/placeholder.page-content';
import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSearchPage() {
  return (
    <DashboardPlaceholderPageContent
      titleKey="dashboard.pages.search.title"
      bodyKey="dashboard.pages.search.body"
    />
  );
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSearchPage);
