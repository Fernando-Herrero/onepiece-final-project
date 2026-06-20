import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { authKeys } from '@/features/auth/api/auth.keys';
import type { RegisterFormValues } from '@/features/auth/register-form.schema';
import { client } from '@/integrations/orpc/orpc.client';
import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error';
}

export function useMeSuspenseQuery() {
  return useSuspenseQuery(allQueriesOptions.auth.me());
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

export { getErrorMessage };
