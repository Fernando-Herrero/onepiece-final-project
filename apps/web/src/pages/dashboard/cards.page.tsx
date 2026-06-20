import type { GetServerSideProps } from 'next';

import CardsPageContent from '@/features/cards/page-content/cards.page-content';
import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardCardsPage() {
  return <CardsPageContent />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardCardsPage);
