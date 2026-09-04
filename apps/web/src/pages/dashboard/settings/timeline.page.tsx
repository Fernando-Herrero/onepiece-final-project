import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import SettingsTimelinePageContent from '@/features/settings/settings-timeline.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSettingsTimelinePage() {
  return <SettingsTimelinePageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSettingsTimelinePage);
