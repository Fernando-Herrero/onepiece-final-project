import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  getSessionUser,
  useSessionUserWriter,
} from '@/features/auth/api/session-user';
import { profileKeys } from '@/features/profile/api/profile.keys';
import type {
  ProfilePostsTab,
  ProfileUser,
  UpdateProfileBody,
} from '@/features/profile/profile.types';
import { client } from '@/integrations/orpc/orpc.client';
import { getOrpcErrorCode } from '@/integrations/orpc/orpc-error';
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
  return useSuspenseInfiniteQuery(
    allQueriesOptions.profile.postsTab(userId, tab),
  );
}

export function useUpdateProfileMutation() {
  const writeSessionUser = useSessionUserWriter();

  return useMutation({
    mutationFn: (input: { userId: string; body: UpdateProfileBody }) =>
      client.users.update({
        params: { id: input.userId },
        body: input.body,
      }),
    onSuccess: user => writeSessionUser(user),
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

type SetFollowingVariables = { targetUserId: string; following: boolean };

/** `ids` con `id` dentro o fuera según `included`, sin duplicarlo. */
function withId(ids: string[], id: string, included: boolean) {
  const rest = ids.filter(item => item !== id);
  return included ? [...rest, id] : rest;
}

export function useSetFollowingMutation() {
  const queryClient = useQueryClient();
  const writeSessionUser = useSessionUserWriter();
  const { t } = useTranslation();

  function applyFollowing({ targetUserId, following }: SetFollowingVariables) {
    const sessionUser = getSessionUser(queryClient);

    if (sessionUser) {
      writeSessionUser({
        ...sessionUser,
        following: withId(sessionUser.following, targetUserId, following),
      });
      queryClient.setQueryData(
        profileKeys.byId(targetUserId),
        (old: ProfileUser | undefined) =>
          old && {
            ...old,
            followers: withId(old.followers, sessionUser._id, following),
          },
      );
      void queryClient.invalidateQueries({
        queryKey: profileKeys.following(sessionUser._id),
      });
    }

    void queryClient.invalidateQueries({
      queryKey: profileKeys.followers(targetUserId),
    });
  }

  return useMutation({
    mutationFn: ({ targetUserId, following }: SetFollowingVariables) => {
      const input = { params: { id: targetUserId } };
      return following
        ? client.users.follow(input)
        : client.users.unfollow(input);
    },
    onSuccess: (_result, variables) => {
      applyFollowing(variables);
      toast.success(
        t(
          variables.following
            ? 'profile.follow_success'
            : 'profile.unfollow_success',
        ),
      );
    },
    onError: (error, variables) => {
      const code = getOrpcErrorCode(error);

      // Ya estaba en el estado pedido: la sesión iba por detrás y se pone al día.
      if (
        code === (variables.following ? 'ALREADY_FOLLOWING' : 'NOT_FOLLOWING')
      ) {
        applyFollowing(variables);
        return;
      }

      toast.error(t('profile.follow_error'));
    },
  });
}
