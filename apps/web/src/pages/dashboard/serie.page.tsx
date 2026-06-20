import type { GetServerSideProps } from 'next';

import SeriePageContent from '@/features/serie/page-content/serie.page-content';
import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardSeriePage() {
  return <SeriePageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardSeriePage);
