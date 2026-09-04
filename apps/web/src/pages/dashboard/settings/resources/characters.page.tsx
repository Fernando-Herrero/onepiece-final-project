import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsResourcesCharactersPageContent from '@/features/settings/settings-resources-characters.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsResourcesCharactersPage() {
  return <SettingsResourcesCharactersPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsResourcesCharactersPage);
