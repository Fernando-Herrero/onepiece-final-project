import type { GetServerSideProps } from 'next';

import { DashboardPlaceholderPageContent } from '@/features/dashboard/page-content/placeholder.page-content';
import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardNotificationsPage() {
  return (
    <DashboardPlaceholderPageContent
      titleKey="dashboard.pages.notifications.title"
      bodyKey="dashboard.pages.notifications.body"
    />
  );
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardNotificationsPage);
