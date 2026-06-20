import type { GetServerSideProps } from 'next';

import { DashboardPlaceholderPageContent } from '@/features/dashboard/page-content/placeholder.page-content';
import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsPage() {
  return (
    <DashboardPlaceholderPageContent
      titleKey="dashboard.pages.settings.title"
      bodyKey="dashboard.pages.settings.body"
    />
  );
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsPage);
