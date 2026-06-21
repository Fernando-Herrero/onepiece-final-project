import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  type UpdateProfileBody,
  useUpdateProfileMutation,
} from '@/features/profile/api/use-update-profile';

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
