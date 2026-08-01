import { Card, Flex, Heading, Switch, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { toast } from 'sonner';

import { Icon } from '@/components/icons/icon';
import { useAuthSession } from '@/features/auth/api/use-auth';
import { useUpdateProfileMutation } from '@/features/profile/api/use-profile';
import { PROFILE_POSTS_TAB_CONFIG } from '@/features/profile/profile.constants';
import type { ProfilePrivacy } from '@/features/profile/profile.types';

export default function SettingsPrivacyPageContent() {
  const { t } = useTranslation();
  const { user } = useAuthSession();
  const updateProfile = useUpdateProfileMutation();

  if (!user) {
    return null;
  }

  const sessionUser = user;

  async function handlePrivacyChange(
    key: keyof ProfilePrivacy,
    checked: boolean,
  ) {
    try {
      await updateProfile.mutateAsync({
        userId: sessionUser._id,
        body: {
          privacy: {
            ...sessionUser.privacy,
            [key]: checked,
          },
        },
      });
      toast.success(t('settings.privacy.save_success'));
    } catch {
      toast.error(t('settings.privacy.save_error'));
    }
  }

  return (
    <Card className="mx-auto max-w-xl border border-[#f2d9a8]/15 bg-[#05070d]/50 p-6 motion-safe:animate-[profile-fade-up_0.45s_ease-out_both]">
      <Link
        href="/dashboard/settings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[#f2d9a8]/80 underline-offset-2 hover:text-[#f2d9a8] hover:underline"
      >
        <Icon.CaretLeft aria-hidden />
        {t('settings.back')}
      </Link>

      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece text-[#f2d9a8]"
      >
        {t('settings.title_privacy')}
      </Heading>
      <Text as="p" size="2" mb="5" className="text-[#f4ede1]/75">
        {t('settings.privacy.description')}
      </Text>

      <Flex direction="column" gap="4">
        <Text as="p" size="3" weight="medium" className="text-[#f2d9a8]/90">
          {t('settings.privacy.title')}
        </Text>

        {PROFILE_POSTS_TAB_CONFIG.map(tab => (
          <Flex key={tab.privacyKey} align="center" justify="between" gap="4">
            <Text as="label" size="2" className="text-[#f4ede1]/85">
              {t(tab.labelKey)}
            </Text>
            <Switch
              checked={sessionUser.privacy[tab.privacyKey]}
              disabled={updateProfile.isPending}
              onCheckedChange={checked =>
                handlePrivacyChange(tab.privacyKey, checked)
              }
            />
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}
