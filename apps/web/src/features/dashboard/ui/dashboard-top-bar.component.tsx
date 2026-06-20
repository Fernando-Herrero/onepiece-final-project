import { Button, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { useLogoutMutation, useMeQuery } from '@/features/auth/api/use-auth';

type DashboardTopBarProps = {
  sectionLabel: string;
};

export function DashboardTopBar({ sectionLabel }: DashboardTopBarProps) {
  const { t } = useTranslation();
  const logout = useLogoutMutation();
  const meQuery = useMeQuery();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#f2d9a8]/15 bg-[#0b1120]/95 px-4 backdrop-blur-md">
      <Text size="2" weight="medium" className="text-[#f4ede1]/90">
        LogPose / {sectionLabel}
      </Text>

      <Flex align="center" gap="3">
        {meQuery.data ? (
          <Text size="2" className="hidden text-[#f4ede1]/75 sm:inline">
            {meQuery.data.username}
          </Text>
        ) : null}
        <Button
          variant="outline"
          color="orange"
          size="2"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          {t('dashboard.topbar.logout')}
        </Button>
      </Flex>
    </header>
  );
}
