import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import ProfilePageContent from '@/features/profile/profile.page-content';
import { getDashboardPageProps } from '@/integrations/auth/server';

function DashboardUserProfilePage() {
  const router = useRouter();

  if (!router.isReady || typeof router.query.id !== 'string') {
    return <div className="mx-auto max-w-6xl" aria-busy="true" />;
  }

  return <ProfilePageContent userId={router.query.id} />;
}

export const getServerSideProps: GetServerSideProps = getDashboardPageProps;

export default withDashboardLayout(DashboardUserProfilePage);
