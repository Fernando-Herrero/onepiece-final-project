import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsAccessibilityPageContent from '@/features/settings/settings-accessibility.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsAccessibilityPage() {
  return <SettingsAccessibilityPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsAccessibilityPage);
