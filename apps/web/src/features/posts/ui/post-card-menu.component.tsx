import { DotsThreeIcon } from '@phosphor-icons/react';
import { DropdownMenu, IconButton } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import { useAuthSession } from '@/features/auth/api/use-auth';
import type { PostPublic } from '@/features/posts/posts.types';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/features/profile/api/use-profile';

type PostCardMenuProps = {
  post: PostPublic;
  onDeletePost?: (postId: string) => void;
};

export function PostCardMenu({ post, onDeletePost }: PostCardMenuProps) {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuthSession();
  const followUser = useFollowUserMutation();
  const unfollowUser = useUnfollowUserMutation();

  if (!user) {
    return null;
  }

  const authorId = post.userId._id;
  const isOwner = user._id === authorId;
  const isFollowing = user.following.includes(authorId);
  const canDelete = isOwner || isAdmin;
  const isBusy = followUser.isPending || unfollowUser.isPending;

  function handleDelete() {
    if (post._id.startsWith('optimistic-') || !onDeletePost) {
      return;
    }

    onDeletePost(post._id);
  }

  function handleFollowToggle() {
    if (isFollowing) {
      unfollowUser.mutate(authorId);
      return;
    }

    followUser.mutate(authorId);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          type="button"
          size="1"
          variant="ghost"
          color="gray"
          highContrast
          aria-label={t('posts.menu_label')}
          disabled={isBusy}
          className="cursor-pointer text-[#f4ede1]/60 hover:text-[#f2d9a8]"
        >
          <DotsThreeIcon size={20} weight="bold" aria-hidden />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" sideOffset={4}>
        {!isOwner ? (
          <>
            <DropdownMenu.Item asChild>
              <Link href={`/dashboard/users/${authorId}`}>
                {t('posts.menu_view_profile')}
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              disabled={isBusy}
              onSelect={() => handleFollowToggle()}
            >
              {isFollowing ? t('posts.menu_unfollow') : t('posts.menu_follow')}
            </DropdownMenu.Item>
          </>
        ) : null}
        {canDelete && onDeletePost ? (
          <DropdownMenu.Item
            color="red"
            disabled={isBusy || post._id.startsWith('optimistic-')}
            onSelect={() => handleDelete()}
          >
            {t('posts.menu_delete')}
          </DropdownMenu.Item>
        ) : null}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
