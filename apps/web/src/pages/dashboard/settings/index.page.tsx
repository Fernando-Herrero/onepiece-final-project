import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsPageContent from '@/features/settings/settings.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsPage() {
  return <SettingsPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsPage);
