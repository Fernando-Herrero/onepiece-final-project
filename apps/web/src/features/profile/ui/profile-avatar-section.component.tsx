import type { SerieProgress } from '@logpose/contracts/common/avatar.schemas';
import { Button, Card, Flex, Heading } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';

import { AvatarPickerComponent } from '@/features/avatar/ui/avatar-picker.component';
import { useUpdateProfileMutation } from '@/features/profile/api/use-update-profile';

type ProfileAvatarSectionProps = {
  userId: string;
  currentAvatar?: string;
  serieProgress: SerieProgress;
};

export function ProfileAvatarSection({
  userId,
  currentAvatar = '',
  serieProgress,
}: ProfileAvatarSectionProps) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfileMutation();
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  const hasChanges =
    selectedAvatar.length > 0 && selectedAvatar !== currentAvatar;

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-5">
      <Flex direction="column" gap="4">
        <Heading as="h2" size="3" className="text-[#f2d9a8]">
          {t('avatar.change_title')}
        </Heading>

        <AvatarPickerComponent
          value={selectedAvatar}
          onChange={setSelectedAvatar}
          serieProgress={serieProgress}
        />

        <Button
          color="orange"
          disabled={!hasChanges || updateProfile.isPending}
          onClick={() => {
            updateProfile.mutate(
              { userId, avatar: selectedAvatar },
              {
                onSuccess: () => {
                  toast.success(t('avatar.save_success'));
                },
                onError: () => {
                  toast.error(t('avatar.save_error'));
                },
              },
            );
          }}
        >
          {updateProfile.isPending ? t('avatar.saving') : t('avatar.save')}
        </Button>
      </Flex>
    </Card>
  );
}
