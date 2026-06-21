import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authKeys } from '@/features/auth/api/auth.keys';
import { client } from '@/integrations/orpc/orpc.client';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; avatar: string }) =>
      client.users.update({
        params: { id: input.userId },
        body: { avatar: input.avatar },
      }),
    onSuccess: user => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}
