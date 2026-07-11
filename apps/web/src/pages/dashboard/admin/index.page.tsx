import { Heading, Section, Text } from '@radix-ui/themes';
import type { GetServerSideProps } from 'next';

import { withDashboardLayout } from '@/features/dashboard/with-dashboard-layout';
import { getAdminDashboardPageProps } from '@/integrations/auth/server';

function AdminDashboardPage() {
  return (
    <Section className="p-6">
      <Heading size="6">Admin</Heading>
      <Text color="gray">Panel de moderación — smoke test.</Text>
    </Section>
  );
}

export const getServerSideProps: GetServerSideProps =
  getAdminDashboardPageProps;

export default withDashboardLayout(AdminDashboardPage);
