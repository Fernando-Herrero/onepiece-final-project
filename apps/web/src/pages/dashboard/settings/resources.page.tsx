import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsResourcesPageContent from '@/features/settings/settings-resources.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsResourcesPage() {
  return <SettingsResourcesPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsResourcesPage);
