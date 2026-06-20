import type { GetServerSideProps } from 'next';

import RegisterPageContent from '@/features/auth/register.page-content';
import { getGuestAuthPageProps } from '@/integrations/auth/server';

export default function RegisterPage() {
  return <RegisterPageContent />;
}

export const getServerSideProps: GetServerSideProps = getGuestAuthPageProps;
