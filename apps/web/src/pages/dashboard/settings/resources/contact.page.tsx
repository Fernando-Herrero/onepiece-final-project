import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsResourcesContactPageContent from '@/features/settings/settings-resources-contact.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsResourcesContactPage() {
  return <SettingsResourcesContactPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsResourcesContactPage);
