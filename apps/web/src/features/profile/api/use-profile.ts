import type { updateUserSchema } from '@logpose/contracts/common/user.schemas';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/v4';

import { authKeys } from '@/features/auth/api/auth.keys';
import { client } from '@/integrations/orpc/orpc.client';
import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

export type UpdateProfileBody = Pick<
  z.infer<typeof updateUserSchema>,
  'displayName' | 'bio' | 'coverImage' | 'avatar' | 'address' | 'phoneNumber'
>;

export function useProfileStats(userId: string) {
  return useSuspenseQuery(allQueriesOptions.profile.stats(userId));
}

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

export function useSaveProfileField(userId: string) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfileMutation();
  const [savingField, setSavingField] = useState<string | null>(null);

  async function save(
    body: UpdateProfileBody,
    fieldKey: string,
    onSuccess?: () => void,
  ) {
    setSavingField(fieldKey);
    try {
      await updateProfile.mutateAsync({ userId, body });
      toast.success(t('profile.save_success'));
      onSuccess?.();
    } catch {
      toast.error(t('profile.save_error'));
    } finally {
      setSavingField(null);
    }
  }

  function isSaving(fieldKey: string) {
    return savingField === fieldKey;
  }

  return { save, isSaving };
}
