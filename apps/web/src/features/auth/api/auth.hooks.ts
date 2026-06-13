import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { authKeys } from '@/features/auth/api/auth.keys';
import {
  authQueryOptions,
  usersQueryOptions,
} from '@/features/auth/api/query-options';
import {
  clearAuthToken,
  setAuthToken,
} from '@/features/auth/auth.storage';
import type { RegisterFormValues } from '@/features/auth/register-form.schema';
import { client } from '@/integrations/orpc/orpc.client';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error';
}

export function useMeSuspenseQuery() {
  return useSuspenseQuery(authQueryOptions.me());
}

export function useUsersListSuspenseQuery() {
  return useSuspenseQuery(usersQueryOptions.list());
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      client.auth.login(input),
    onSuccess: data => {
      setAuthToken(data.token);
      queryClient.setQueryData(authKeys.me(), data.user);
      void router.push('/');
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterFormValues) => {
      const { confirmPassword: _confirmPassword, ...payload } = input;
      return client.auth.register(payload);
    },
    onSuccess: data => {
      setAuthToken(data.token);
      queryClient.setQueryData(authKeys.me(), data.user);
      void router.push('/');
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => client.auth.logout(),
    onSettled: () => {
      clearAuthToken();
      queryClient.removeQueries({ queryKey: authKeys.all });
      void router.push('/login');
    },
  });
}

export { getErrorMessage };
