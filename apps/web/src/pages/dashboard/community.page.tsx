import type { GetServerSideProps } from 'next';

import CommunityPageContent from '@/features/community/community.page-content';
import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardCommunityPage() {
  return <CommunityPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardCommunityPage);
