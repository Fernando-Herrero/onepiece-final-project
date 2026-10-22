import { Flex, IconButton, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';

import { Icon } from '@/components/icons/icon';
import { DASHBOARD_TOPBAR_NAV_ITEMS } from '@/features/dashboard/dashboard-navigation';
import { DashboardAccountMenu } from '@/features/dashboard/ui/dashboard-account-menu.component';
import { DashboardSearchBar } from '@/features/dashboard/ui/dashboard-search-bar.component';

type DashboardTopBarProps = {
  sectionLabel: string;
};

const TOPBAR_ICON_ITEMS = DASHBOARD_TOPBAR_NAV_ITEMS.filter(
  item => item.id !== 'search',
);

export function DashboardTopBar({ sectionLabel }: DashboardTopBarProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Flex
      asChild
      align="center"
      justify={{ initial: 'end', md: 'between' }}
      px="4"
      className="border-highlight/15 bg-deep h-14 shrink-0 border-b backdrop-blur-md"
    >
      <header>
        <Text
          size="2"
          weight="medium"
          className="text-foreground/90 hidden md:block"
        >
          LogPose / {sectionLabel}
        </Text>

        <Flex align="center" gap="3">
          <DashboardSearchBar />

          {TOPBAR_ICON_ITEMS.map(item => {
            const active = router.pathname.startsWith(item.href);
            const NavIcon = Icon[item.icon];

            return (
              <IconButton
                key={item.id}
                asChild
                variant={active ? 'soft' : 'ghost'}
                color={active ? 'orange' : 'gray'}
                highContrast={active}
                className="m-0! box-border size-9 p-0"
                aria-label={t(item.labelKey)}
              >
                <Link href={item.href}>
                  <NavIcon aria-hidden />
                </Link>
              </IconButton>
            );
          })}

          <DashboardAccountMenu />
        </Flex>
      </header>
    </Flex>
  );
}
