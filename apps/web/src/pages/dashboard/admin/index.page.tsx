import type { GetServerSideProps } from 'next';

import { DashboardPlaceholderPageContent } from '@/features/dashboard/page-content/placeholder.page-content';
import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getAdminDashboardPageProps } from '@/integrations/auth/server';

function AdminDashboardPage() {
  return (
    <DashboardPlaceholderPageContent
      titleKey="dashboard.pages.admin.title"
      bodyKey="dashboard.pages.admin.body"
    />
  );
}

export const getServerSideProps: GetServerSideProps =
  getAdminDashboardPageProps;

export default withDashboardLayout(AdminDashboardPage);
