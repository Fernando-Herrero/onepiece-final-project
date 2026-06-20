import type { GetServerSideProps } from 'next';

import LoginPageContent from '@/features/auth/login.page-content';
import { getGuestAuthPageProps } from '@/integrations/auth/server';

export default function LoginPage() {
  return <LoginPageContent />;
}

export const getServerSideProps: GetServerSideProps = getGuestAuthPageProps;
