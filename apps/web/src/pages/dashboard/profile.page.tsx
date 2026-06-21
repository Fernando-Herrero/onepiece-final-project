import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import ProfilePageContent from '@/features/profile/profile.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardProfilePage() {
  return <ProfilePageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardProfilePage);
