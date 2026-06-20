import type { GetServerSideProps } from 'next';

import { DashboardPlaceholderPageContent } from '@/features/dashboard/page-content/placeholder.page-content';
import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardCommunityPage() {
  return (
    <DashboardPlaceholderPageContent
      titleKey="dashboard.pages.community.title"
      bodyKey="dashboard.pages.community.body"
    />
  );
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardCommunityPage);
