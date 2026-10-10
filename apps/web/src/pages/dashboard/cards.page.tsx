import type { GetServerSideProps } from 'next';

import { DashboardPlaceholderPageContent } from '@/features/dashboard/page-content/placeholder.page-content';
import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardCardsPage() {
  return (
    <DashboardPlaceholderPageContent
      titleKey="dashboard.pages.cards.title"
      bodyKey="dashboard.pages.cards.body"
    />
  );
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardCardsPage);
