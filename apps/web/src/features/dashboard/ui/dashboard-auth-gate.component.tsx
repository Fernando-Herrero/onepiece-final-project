import { Flex, Spinner, Text } from '@radix-ui/themes';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { type PropsWithChildren, useEffect } from 'react';

import { authKeys } from '@/features/auth/api/auth.keys';
import { useAuthSession } from '@/features/auth/api/use-auth';

export function DashboardAuthGate({ children }: PropsWithChildren) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { isLoading, isSessionInvalid, error } = useAuthSession();

  useEffect(() => {
    if (!isSessionInvalid) return;

    queryClient.removeQueries({ queryKey: authKeys.all });
    void router.replace('/login');
  }, [isSessionInvalid, queryClient, router]);

  if (isLoading) {
    return (
      <Flex
        align="center"
        justify="center"
        direction="column"
        gap="3"
        className="min-h-dvh flex-1 bg-[#0b1120]"
      >
        <Spinner size="3" />
        <Text size="2" color="gray">
          {t('dashboard.auth.loading')}
        </Text>
      </Flex>
    );
  }

  if (isSessionInvalid) {
    return null;
  }

  if (error) {
    return (
      <Flex
        align="center"
        justify="center"
        direction="column"
        gap="2"
        className="min-h-dvh flex-1 bg-[#0b1120] px-4"
      >
        <Text size="3" weight="medium" className="text-[#f2d9a8]">
          {t('dashboard.auth.error_title')}
        </Text>
        <Text size="2" color="gray" align="center">
          {t('dashboard.auth.error_body')}
        </Text>
      </Flex>
    );
  }

  return children;
}
