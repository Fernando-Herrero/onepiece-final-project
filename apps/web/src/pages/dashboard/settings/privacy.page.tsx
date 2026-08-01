import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsPrivacyPageContent from '@/features/settings/settings-privacy.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsPrivacyPage() {
  return <SettingsPrivacyPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsPrivacyPage);
