/**
 * Helpers de auth para `getServerSideProps` en páginas del dashboard.
 * Valida la sesión contra la API Nest en SSR, rellena TanStack Query y aplica redirects.
 */
import { userPublicSchema } from '@logpose/contracts/common/user.schemas';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type * as z from 'zod/v4';

import { authKeys } from '@/features/auth/api/auth.keys';
import { getAuthenticatedHomePath } from '@/features/auth/auth-routes';
import {
  getDashboardI18nProps,
  getDefaultI18nProps,
} from '@/integrations/i18n/server';

/** URL directa a la API en SSR (no pasa por el proxy de Next en dev). */
const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

type SessionUser = z.infer<typeof userPublicSchema>;

/** Llama a `/api/auth/me` reenviando las cookies del request; devuelve null si no hay sesión válida. */
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

/** Precarga `authKeys.me()` en el QueryClient y serializa el estado para hidratar el cliente. */
async function buildAuthenticatedPageProps(
  context: GetServerSidePropsContext,
  user: SessionUser,
) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(authKeys.me(), user);
  return {
    ...(await getDashboardI18nProps(context)),
    dehydratedState: dehydrate(queryClient),
  };
}

type SessionRedirect = {
  redirect: { destination: string; permanent: false };
};

/** Exige sesión: devuelve el usuario o un redirect a `/login`. */
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

/** GSSP para rutas protegidas del dashboard (`/dashboard/*`). Redirige a login si no hay sesión. */
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

/** GSSP para login/register: si ya hay sesión, redirige al home según rol. */
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

/** GSSP para rutas admin: exige sesión y rol `admin`; si no, redirige a perfil. */
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
