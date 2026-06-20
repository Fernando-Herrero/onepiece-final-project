import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { SESSION_COOKIE_NAME } from '@/features/auth/auth.storage';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export function getSessionTokenFromContext(context: GetServerSidePropsContext) {
  return context.req.cookies[SESSION_COOKIE_NAME];
}

export function requireDashboardSession(
  context: GetServerSidePropsContext,
): GetServerSidePropsResult<never> | null {
  if (!getSessionTokenFromContext(context)) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return null;
}

export async function getDashboardPageProps(
  context: GetServerSidePropsContext,
) {
  const denied = requireDashboardSession(context);

  if (denied) {
    return denied;
  }

  return {
    props: await getDefaultI18nProps(context),
  };
}

export async function getGuestAuthPageProps(
  context: GetServerSidePropsContext,
) {
  if (getSessionTokenFromContext(context)) {
    return {
      redirect: {
        destination: '/dashboard/profile',
        permanent: false,
      },
    };
  }

  return {
    props: await getDefaultI18nProps(context),
  };
}
