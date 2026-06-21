import { Button, Flex, IconButton, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';

import {
  useAuthSession,
  useLogoutMutation,
} from '@/features/auth/api/use-auth';
import { DASHBOARD_TOPBAR_NAV_ITEMS } from '@/features/dashboard/dashboard-navigation';
import { LandingLocaleToggleComponent } from '@/features/landing/ui/landing-locale-toggle.component';

type DashboardTopBarProps = {
  sectionLabel: string;
};

export function DashboardTopBar({ sectionLabel }: DashboardTopBarProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const logout = useLogoutMutation();
  const { user } = useAuthSession();

  return (
    <Flex
      asChild
      align="center"
      justify="between"
      px="4"
      className="h-14 shrink-0 border-b border-[#f2d9a8]/15 bg-[#05070d] backdrop-blur-md"
    >
      <header>
        <Text size="2" weight="medium" className="text-[#f4ede1]/90">
          LogPose / {sectionLabel}
        </Text>

        <Flex align="center" gap="3">
          {DASHBOARD_TOPBAR_NAV_ITEMS.map(item => {
            const active = router.pathname.startsWith(item.href);

            return (
              <IconButton
                key={item.id}
                asChild
                variant={active ? 'soft' : 'ghost'}
                color={active ? 'orange' : 'gray'}
                highContrast={active}
                className="m-0! box-border size-9 p-0 text-lg"
                aria-label={t(item.labelKey)}
              >
                <Link href={item.href}>
                  <span aria-hidden>{item.icon}</span>
                </Link>
              </IconButton>
            );
          })}

          <LandingLocaleToggleComponent compactLabel />

          {user ? (
            <Text size="2" className="hidden text-[#f4ede1]/75 sm:inline">
              {user.username}
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
    </Flex>
  );
}
