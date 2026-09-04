import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsPremiumPageContent from '@/features/settings/settings-premium.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsPremiumPage() {
  return <SettingsPremiumPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsPremiumPage);
