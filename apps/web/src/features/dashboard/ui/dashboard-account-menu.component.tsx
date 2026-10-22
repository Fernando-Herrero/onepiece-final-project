import { Avatar, DropdownMenu, Flex, IconButton, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { Icon } from '@/components/icons/icon';
import { VerifiedBadge } from '@/components/verified-badge/verified-badge.component';
import {
  useAuthSession,
  useLogoutMutation,
} from '@/features/auth/api/use-auth';
import {
  DEFAULT_AVATAR_SRC,
  resolveAvatarSrc,
} from '@/features/avatar/avatar.constants';
import { getUserDisplayName } from '@/features/profile/profile.constants';
import { LOCALE_FLAGS, LOCALES } from '@/integrations/next-i18next/constants';
import { useLocale } from '@/integrations/next-i18next/use-locale';

export function DashboardAccountMenu() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthSession();
  const logout = useLogoutMutation();
  const activeLocale = useLocale();
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  if (!user) {
    return null;
  }

  const displayName = getUserDisplayName(user);
  const avatarSrc = avatarLoadError
    ? DEFAULT_AVATAR_SRC
    : resolveAvatarSrc(user.avatar);

  function handleLocaleChange(locale: string) {
    void router.push(router.pathname, router.asPath, { locale, scroll: false });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          type="button"
          variant="ghost"
          color="gray"
          radius="full"
          className="m-0! box-border size-9 p-0"
          aria-label={t('dashboard.topbar.account_menu')}
        >
          <Avatar
            src={avatarSrc}
            fallback={displayName.slice(0, 1).toUpperCase()}
            size="2"
            radius="full"
            className="border-highlight/20 border"
            onLoadingStatusChange={status => {
              if (status === 'error') {
                setAvatarLoadError(true);
              }
            }}
          />
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end" className="min-w-48">
        <DropdownMenu.Label>
          <Flex direction="column" gap="1" className="max-w-48">
            <Flex align="center" gap="1">
              <Text
                size="2"
                weight="medium"
                className="text-foreground truncate"
              >
                {displayName}
              </Text>
              {user.verified ? <VerifiedBadge verified /> : null}
            </Flex>
            <Text size="1" color="gray" className="truncate">
              @{user.username}
            </Text>
          </Flex>
        </DropdownMenu.Label>

        <DropdownMenu.Separator />

        <DropdownMenu.Item asChild>
          <Link href="/dashboard/profile">
            <Flex align="center" gap="2">
              <Icon.User aria-hidden />
              {t('posts.menu_view_profile')}
            </Flex>
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link href="/dashboard/settings">
            <Flex align="center" gap="2">
              <Icon.Settings aria-hidden />
              {t('dashboard.nav.settings')}
            </Flex>
          </Link>
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <Flex align="center" gap="2">
              <span aria-hidden>{LOCALE_FLAGS[activeLocale]}</span>
              {t('landing.nav.language')}
            </Flex>
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.RadioGroup
              value={activeLocale}
              onValueChange={handleLocaleChange}
            >
              {LOCALES.map(locale => (
                <DropdownMenu.RadioItem key={locale} value={locale}>
                  <Flex align="center" gap="2">
                    <span aria-hidden>{LOCALE_FLAGS[locale]}</span>
                    {t(`landing.locales.${locale}`)}
                  </Flex>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Item asChild>
          <Link href="/dashboard/settings/resources">
            <Flex align="center" gap="2">
              <Icon.BookOpen aria-hidden />
              {t('dashboard.topbar.help')}
            </Flex>
          </Link>
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          color="red"
          disabled={logout.isPending}
          onSelect={() => logout.mutate()}
        >
          <Flex align="center" gap="2">
            <Icon.SignOut aria-hidden />
            {t('dashboard.topbar.logout')}
          </Flex>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
