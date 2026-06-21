import type { updateUserSchema } from '@logpose/contracts/common/user.schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod/v4';

import { authKeys } from '@/features/auth/api/auth.keys';
import { client } from '@/integrations/orpc/orpc.client';

export type UpdateProfileBody = Pick<
  z.infer<typeof updateUserSchema>,
  'displayName' | 'bio' | 'coverImage' | 'avatar' | 'address' | 'phoneNumber'
>;

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; body: UpdateProfileBody }) =>
      client.users.update({
        params: { id: input.userId },
        body: input.body,
      }),
    onSuccess: user => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}
