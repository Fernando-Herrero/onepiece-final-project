import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsNotificationsPageContent from '@/features/settings/settings-notifications.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsNotificationsPage() {
  return <SettingsNotificationsPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsNotificationsPage);
