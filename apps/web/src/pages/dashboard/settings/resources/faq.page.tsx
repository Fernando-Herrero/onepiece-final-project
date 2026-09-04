import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsResourcesFaqPageContent from '@/features/settings/settings-resources-faq.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsResourcesFaqPage() {
  return <SettingsResourcesFaqPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsResourcesFaqPage);
