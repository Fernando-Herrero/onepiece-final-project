import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import { useRouter } from 'next/router';

import { authKeys } from '@/features/auth/api/auth.keys';
import type { RegisterFormValues } from '@/features/auth/register-form.schema';
import { client } from '@/integrations/orpc/orpc.client';
import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

function getAuthErrorMessage(error: unknown, t: TFunction): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    switch (error.code) {
      case 'DUPLICATE_ACCOUNT':
        return t('auth.errors.DUPLICATE_ACCOUNT');
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
  return useQuery(allQueriesOptions.auth.me());
}

function useAuthSuccess() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return (data: { user: unknown }) => {
    queryClient.setQueryData(authKeys.me(), data.user);
    void router.push('/dashboard/profile');
  };
}

export function useLoginMutation() {
  const onSuccess = useAuthSuccess();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      client.auth.login(input),
    onSuccess,
  });
}

export function useRegisterMutation() {
  const onSuccess = useAuthSuccess();

  return useMutation({
    mutationFn: (input: RegisterFormValues) => {
      const { confirmPassword: _confirmPassword, ...payload } = input;
      return client.auth.register(payload);
    },
    onSuccess,
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => client.auth.logout(),
    onSettled: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      void router.push('/login');
    },
  });
}

export { getAuthErrorMessage };
