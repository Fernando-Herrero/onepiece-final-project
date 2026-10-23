import { Avatar, Box, Button, Dialog, Tooltip } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import {
  DEFAULT_AVATAR_SRC,
  resolveAvatarSrc,
} from '@/features/avatar/avatar.constants';
import type { ProfileUser } from '@/features/profile/profile.types';
import { ProfileAvatarPicker } from '@/features/profile/ui/profile-avatar-picker.component';

const avatarFallback = (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={DEFAULT_AVATAR_SRC} alt="" className="size-full object-cover" />
);

type ProfileAvatarProps = {
  user: ProfileUser;
  isOwner: boolean;
};

export function ProfileAvatar({ user, isOwner }: ProfileAvatarProps) {
  const { t } = useTranslation();
  const [loadError, setLoadError] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const resolvedAvatar = resolveAvatarSrc(user.avatar);

  const avatar = (
    <Avatar
      src={loadError ? DEFAULT_AVATAR_SRC : resolvedAvatar}
      fallback={avatarFallback}
      size="6"
      radius="full"
      className="border-page border-4"
      onLoadingStatusChange={status => {
        if (status === 'error') {
          setLoadError(true);
        }
      }}
    />
  );

  return (
    <Box position="relative" className="z-50 -mt-10 w-fit">
      {isOwner ? (
        <Dialog.Root open={pickerOpen} onOpenChange={setPickerOpen}>
          <Tooltip content={t('profile.change_avatar')}>
            <Dialog.Trigger>
              <Button
                type="button"
                variant="ghost"
                color="gray"
                aria-label={t('profile.change_avatar')}
                className="h-auto cursor-pointer rounded-full p-0 hover:bg-transparent active:bg-transparent"
              >
                {avatar}
              </Button>
            </Dialog.Trigger>
          </Tooltip>
          <Dialog.Content maxWidth="450px" aria-describedby={undefined}>
            <ProfileAvatarPicker
              userId={user._id}
              currentAvatar={resolvedAvatar}
              lastWatchedEpisode={user.lastWatchedEpisode}
              onClose={() => setPickerOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Root>
      ) : (
        avatar
      )}
      <Box
        position="absolute"
        className={`border-page right-0.5 bottom-0.5 size-4 rounded-full border-[3px] shadow-[0_0_0_1px_--alpha(var(--color-highlight)/35%)] ${
          user.isActive ? 'bg-green-400' : 'bg-red-400'
        }`}
        aria-label={
          user.isActive
            ? t('profile.status_online')
            : t('profile.status_offline')
        }
      />
    </Box>
  );
}
