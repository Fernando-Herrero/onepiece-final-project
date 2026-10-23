import { Button, Dialog, Flex } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';

import { AvatarPickerComponent } from '@/features/avatar/ui/avatar-picker.component';
import { useUpdateProfileMutation } from '@/features/profile/api/use-profile';

type ProfileAvatarPickerProps = {
  userId: string;
  currentAvatar: string;
  lastWatchedEpisode: number;
  onClose: () => void;
};

// Dialog.Content lo desmonta al cerrar: cada apertura empieza en currentAvatar.
export function ProfileAvatarPicker({
  userId,
  currentAvatar,
  lastWatchedEpisode,
  onClose,
}: ProfileAvatarPickerProps) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfileMutation();
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  async function handleSave() {
    if (selectedAvatar === currentAvatar) {
      onClose();
      return;
    }

    try {
      await updateProfile.mutateAsync({
        userId,
        body: { avatar: selectedAvatar },
      });
      toast.success(t('avatar.save_success'));
      onClose();
    } catch {
      toast.error(t('avatar.save_error'));
    }
  }

  return (
    <Flex direction="column" align="center" gap="4">
      <Dialog.Title className="sr-only">
        {t('avatar.change_title')}
      </Dialog.Title>
      <AvatarPickerComponent
        value={selectedAvatar}
        lastWatchedEpisode={lastWatchedEpisode}
        onChange={setSelectedAvatar}
      />

      <Flex gap="2" justify="end" className="w-full">
        <Dialog.Close>
          <Button
            type="button"
            variant="soft"
            color="gray"
            disabled={updateProfile.isPending}
          >
            {t('profile.cancel')}
          </Button>
        </Dialog.Close>
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
  );
}
