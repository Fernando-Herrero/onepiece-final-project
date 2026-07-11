import { userPublicSchema } from '@logpose/contracts/common/user.schemas';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type * as z from 'zod/v4';

import { authKeys } from '@/features/auth/api/auth.keys';
import { getAuthenticatedHomePath } from '@/features/auth/auth-routes';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

type SessionUser = z.infer<typeof userPublicSchema>;

async function fetchSessionUser(
  context: GetServerSidePropsContext,
): Promise<SessionUser | null> {
  const cookie = context.req.headers.cookie;

  if (!cookie) {
    return null;
  }

  try {
    const response = await fetch(`${API_INTERNAL_URL}/api/auth/me`, {
      headers: { cookie },
    });

    if (!response.ok) {
      return null;
    }

    const parsed = userPublicSchema.safeParse(await response.json());

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function buildAuthenticatedPageProps(
  context: GetServerSidePropsContext,
  user: SessionUser,
) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(authKeys.me(), user);
  return {
    ...(await getDefaultI18nProps(context)),
    dehydratedState: dehydrate(queryClient),
  };
}

type SessionRedirect = {
  redirect: { destination: string; permanent: false };
};

async function requireSessionUser(
  context: GetServerSidePropsContext,
): Promise<SessionUser | SessionRedirect> {
  const user = await fetchSessionUser(context);

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return user;
}

export async function getDashboardPageProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Record<string, unknown>>> {
  const result = await requireSessionUser(context);

  if ('redirect' in result) {
    return { redirect: result.redirect };
  }

  return {
    props: await buildAuthenticatedPageProps(context, result),
  };
}

export async function getGuestAuthPageProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Record<string, unknown>>> {
  const user = await fetchSessionUser(context);

  if (user) {
    return {
      redirect: {
        destination: getAuthenticatedHomePath(user),
        permanent: false,
      },
    };
  }

  return {
    props: await getDefaultI18nProps(context),
  };
}

export async function getAdminDashboardPageProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Record<string, unknown>>> {
  const result = await requireSessionUser(context);

  if ('redirect' in result) {
    return { redirect: result.redirect };
  }

  if (result.role !== 'admin') {
    return {
      redirect: {
        destination: '/dashboard/profile',
        permanent: false,
      },
    };
  }

  return {
    props: await buildAuthenticatedPageProps(context, result),
  };
}
