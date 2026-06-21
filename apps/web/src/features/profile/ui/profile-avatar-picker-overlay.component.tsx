import type { SerieProgress } from '@logpose/contracts/common/avatar.schemas';
import { Button, Card, Flex, IconButton } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';

import { AvatarPickerComponent } from '@/features/avatar/ui/avatar-picker.component';
import { useUpdateProfileMutation } from '@/features/profile/api/use-update-profile';

type ProfileAvatarPickerOverlayProps = {
  userId: string;
  currentAvatar: string;
  serieProgress: SerieProgress;
  onClose: () => void;
  onSaved: () => void;
};

export function ProfileAvatarPickerOverlay({
  userId,
  currentAvatar,
  serieProgress,
  onClose,
  onSaved,
}: ProfileAvatarPickerOverlayProps) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfileMutation();
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  function handleClose() {
    setSelectedAvatar(currentAvatar);
    onClose();
  }

  async function handleSave() {
    if (selectedAvatar === currentAvatar) {
      handleClose();
      return;
    }

    try {
      await updateProfile.mutateAsync({
        userId,
        body: { avatar: selectedAvatar },
      });
      toast.success(t('avatar.save_success'));
      onSaved();
    } catch {
      toast.error(t('avatar.save_error'));
    }
  }

  return (
    <Flex
      align="center"
      justify="center"
      className="fixed inset-0 z-50 bg-[#05070d]/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('avatar.change_title')}
    >
      <Card className="relative max-h-[90vh] w-full max-w-md overflow-y-auto border border-[#f2d9a8]/15 bg-[#0b1120]/95 p-6">
        <IconButton
          type="button"
          variant="ghost"
          color="gray"
          size="2"
          aria-label={t('profile.cancel')}
          className="absolute top-3 right-3"
          onClick={handleClose}
        >
          ✕
        </IconButton>

        <Flex direction="column" align="center" gap="4">
          <AvatarPickerComponent
            value={selectedAvatar}
            serieProgress={serieProgress}
            onChange={setSelectedAvatar}
          />

          <Flex gap="2" justify="end" className="w-full">
            <Button
              type="button"
              variant="soft"
              color="gray"
              disabled={updateProfile.isPending}
              onClick={handleClose}
            >
              {t('profile.cancel')}
            </Button>
            <Button
              type="button"
              color="orange"
              disabled={updateProfile.isPending}
              onClick={() => void handleSave()}
            >
              {updateProfile.isPending ? t('avatar.saving') : t('avatar.save')}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
