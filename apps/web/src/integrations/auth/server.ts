import { SESSION_COOKIE_NAME } from '@logpose/contracts/features/auth/constants';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { getDefaultI18nProps } from '@/integrations/i18n/server';

const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function fetchSessionUser(context: GetServerSidePropsContext) {
  const cookie = context.req.headers.cookie;

  if (!cookie?.includes(SESSION_COOKIE_NAME)) {
    return null;
  }

  try {
    const response = await fetch(`${API_INTERNAL_URL}/api/auth/me`, {
      headers: { cookie },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function getDashboardPageProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Record<string, unknown>>> {
  const user = await fetchSessionUser(context);

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: await getDefaultI18nProps(context),
  };
}

export async function getGuestAuthPageProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Record<string, unknown>>> {
  const user = await fetchSessionUser(context);

  if (user) {
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
