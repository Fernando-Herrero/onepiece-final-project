import { Button } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { useSetFollowingMutation } from '@/features/profile/api/use-profile';

type ProfileFollowButtonProps = {
  userId: string;
  isFollowing: boolean;
};

export function ProfileFollowButton({
  userId,
  isFollowing,
}: ProfileFollowButtonProps) {
  const { t } = useTranslation();
  const setFollowing = useSetFollowingMutation();

  return (
    <Button
      type="button"
      size="2"
      color={isFollowing ? 'gray' : 'orange'}
      variant={isFollowing ? 'soft' : 'solid'}
      disabled={setFollowing.isPending}
      onClick={() =>
        setFollowing.mutate({ targetUserId: userId, following: !isFollowing })
      }
    >
      {setFollowing.isPending
        ? t('profile.saving')
        : isFollowing
          ? t('profile.unfollow_button')
          : t('profile.follow_button')}
    </Button>
  );
}
