import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsAccountPageContent from '@/features/settings/settings-account.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsAccountPage() {
  return <SettingsAccountPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsAccountPage);
