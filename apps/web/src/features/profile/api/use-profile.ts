import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';

import { authKeys } from '@/features/auth/api/auth.keys';
import { profileKeys } from '@/features/profile/api/profile.keys';
import type {
  ProfilePostsTab,
  ProfileUser,
  UpdateProfileBody,
} from '@/features/profile/profile.types';
import { client } from '@/integrations/orpc/orpc.client';
import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

export function useProfileUser(userId: string) {
  return useSuspenseQuery(allQueriesOptions.profile.byId(userId));
}

export function useProfileStats(userId: string) {
  return useSuspenseQuery(allQueriesOptions.profile.stats(userId));
}

export function useProfileRanking() {
  return useSuspenseQuery(allQueriesOptions.profile.ranking());
}

export function useProfileFollowers(userId: string) {
  return useSuspenseQuery(allQueriesOptions.profile.followers(userId));
}

export function useProfileFollowing(userId: string) {
  return useSuspenseQuery(allQueriesOptions.profile.following(userId));
}

export function useProfilePosts(userId: string, tab: ProfilePostsTab) {
  return useSuspenseQuery(allQueriesOptions.profile.postsTab(userId, tab));
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

export function useFollowUserMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (targetUserId: string) =>
      client.users.follow({ params: { id: targetUserId } }),
    onSuccess: (_result, targetUserId) => {
      queryClient.setQueryData(authKeys.me(), (old: ProfileUser | undefined) => {
        if (!old || old.following.includes(targetUserId)) {
          return old;
        }

        return {
          ...old,
          following: [...old.following, targetUserId],
        };
      });

      queryClient.setQueryData(
        profileKeys.byId(targetUserId),
        (old: ProfileUser | undefined) => {
          if (!old) {
            return old;
          }

          const viewerId = queryClient.getQueryData<ProfileUser>(authKeys.me())?._id;

          if (!viewerId || old.followers.includes(viewerId)) {
            return old;
          }

          return {
            ...old,
            followers: [...old.followers, viewerId],
          };
        },
      );

      const viewerId = queryClient.getQueryData<ProfileUser>(authKeys.me())?._id;

      void queryClient.invalidateQueries({
        queryKey: profileKeys.followers(targetUserId),
      });
      if (viewerId) {
        void queryClient.invalidateQueries({
          queryKey: profileKeys.following(viewerId),
        });
      }

      toast.success(t('profile.follow_success'));
    },
    onError: () => {
      toast.error(t('profile.follow_error'));
    },
  });
}

export function useUnfollowUserMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (targetUserId: string) =>
      client.users.unfollow({ params: { id: targetUserId } }),
    onSuccess: (_result, targetUserId) => {
      queryClient.setQueryData(authKeys.me(), (old: ProfileUser | undefined) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          following: old.following.filter(id => id !== targetUserId),
        };
      });

      queryClient.setQueryData(
        profileKeys.byId(targetUserId),
        (old: ProfileUser | undefined) => {
          if (!old) {
            return old;
          }

          const viewerId = queryClient.getQueryData<ProfileUser>(authKeys.me())?._id;

          if (!viewerId) {
            return old;
          }

          return {
            ...old,
            followers: old.followers.filter(id => id !== viewerId),
          };
        },
      );

      const viewerId = queryClient.getQueryData<ProfileUser>(authKeys.me())?._id;

      void queryClient.invalidateQueries({
        queryKey: profileKeys.followers(targetUserId),
      });
      if (viewerId) {
        void queryClient.invalidateQueries({
          queryKey: profileKeys.following(viewerId),
        });
      }

      toast.success(t('profile.unfollow_success'));
    },
    onError: () => {
      toast.error(t('profile.unfollow_error'));
    },
  });
}
