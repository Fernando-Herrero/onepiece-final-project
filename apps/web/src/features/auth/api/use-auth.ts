import { userPublicSchema } from '@logpose/contracts/common/user.schemas';
import { type InferClientErrorUnion, isDefinedError } from '@orpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type * as z from 'zod/v4';

import { authKeys } from '@/features/auth/api/auth.keys';
import { getAuthenticatedHomePath } from '@/features/auth/auth-routes';
import type { RegisterFormValues } from '@/features/auth/register-form.schema';
import { client } from '@/integrations/orpc/orpc.client';
import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

type AuthClientError = InferClientErrorUnion<typeof client.auth>;
type AuthUser = z.infer<typeof userPublicSchema>;

function getAuthErrorMessage(error: unknown, t: TFunction): string {
  const typedError = error as AuthClientError;

  if (isDefinedError(typedError)) {
    switch (typedError.code) {
      case 'DUPLICATE_ACCOUNT':
        return t('auth.errors.DUPLICATE_ACCOUNT');
      case 'ALREADY_AUTHENTICATED':
        return t('auth.errors.ALREADY_AUTHENTICATED');
      case 'INVALID_CREDENTIALS':
        return t('auth.errors.INVALID_CREDENTIALS');
      case 'UNAUTHORIZED':
        return t('auth.errors.UNAUTHORIZED');
      case 'ACCOUNT_INACTIVE':
        return t('auth.errors.ACCOUNT_INACTIVE');
      case 'USER_NOT_FOUND':
        return t('auth.errors.USER_NOT_FOUND');
      case 'INVALID_CURRENT_PASSWORD':
        return t('auth.errors.INVALID_CURRENT_PASSWORD');
    }
  }

  return t('auth.generic_error');
}

export function useMeQuery() {
  const router = useRouter();

  return useQuery({
    ...allQueriesOptions.auth.me(),
    enabled: router.pathname.startsWith('/dashboard'),
  });
}

function useAuthSubmitFlow() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isRedirecting) {
      return;
    }

    // `mutation.isPending` vuelve a `false` en cuanto responde el login/register,
    // pero el `router.push()` a /dashboard tarda un poco más (SSR de la página
    // destino) y el botón parecía "colgado" en ese hueco. Mantenemos el estado
    // de carga hasta que la navegación termine — incluyendo `routeChangeError`,
    // por si se aborta a medio camino (p. ej. el usuario navega a otro sitio o
    // el SSR de destino falla), para no dejar el botón en pending para siempre.
    const finish = () => setIsRedirecting(false);

    router.events.on('routeChangeComplete', finish);
    router.events.on('routeChangeError', finish);

    return () => {
      router.events.off('routeChangeComplete', finish);
      router.events.off('routeChangeError', finish);
    };
  }, [isRedirecting, router.events]);

  const onSuccess = (data: { user: AuthUser }) => {
    queryClient.setQueryData(authKeys.me(), data.user);
    setIsRedirecting(true);
    void router.push(getAuthenticatedHomePath(data.user));
  };

  return { onSuccess, isRedirecting };
}

export function useLoginMutation() {
  const { onSuccess, isRedirecting } = useAuthSubmitFlow();

  const mutation = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      client.auth.login(input),
    onSuccess,
  });

  return { ...mutation, isRedirecting };
}

export function useRegisterMutation() {
  const { onSuccess, isRedirecting } = useAuthSubmitFlow();

  const mutation = useMutation({
    mutationFn: (input: RegisterFormValues) => {
      const { confirmPassword: _confirmPassword, ...payload } = input;
      return client.auth.register(payload);
    },
    onSuccess,
  });

  return { ...mutation, isRedirecting };
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => client.auth.logout(),
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: authKeys.all });
      await router.push('/login');
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

export { getAuthErrorMessage };

const SESSION_INVALID_ERROR_CODES = new Set([
  'UNAUTHORIZED',
  'ACCOUNT_INACTIVE',
  'USER_NOT_FOUND',
]);

function isSessionInvalidError(error: unknown): boolean {
  const typedError = error as AuthClientError;

  return (
    isDefinedError(typedError) &&
    SESSION_INVALID_ERROR_CODES.has(typedError.code)
  );
}

export function useAuthSession() {
  const meQuery = useMeQuery();
  const user = meQuery.data;
  const isAdmin = user?.role === 'admin';

  return {
    user,
    isAdmin,
    isLoading: meQuery.isPending,
    isAuthenticated: !!user,
    isSessionInvalid: meQuery.isError && isSessionInvalidError(meQuery.error),
    error: meQuery.isError ? meQuery.error : null,
  };
}
