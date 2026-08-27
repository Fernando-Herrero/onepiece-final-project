import {
  AlertDialog,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';

import { Icon } from '@/components/icons/icon';
import {
  useAuthSession,
  useDeleteAccountMutation,
} from '@/features/auth/api/use-auth';

export default function SettingsAccountPageContent() {
  const { t } = useTranslation();
  const { user } = useAuthSession();
  const deleteAccount = useDeleteAccountMutation();
  const [confirmEmail, setConfirmEmail] = useState('');

  if (!user) {
    return null;
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync(user._id);
    } catch {
      toast.error(t('settings.danger_zone.delete_error'));
    }
  };

  const isConfirmed =
    confirmEmail.trim().toLowerCase() === user.email.toLowerCase();

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
        {t('settings.title_security')}
      </Heading>
      <Text as="p" size="2" mb="5" className="text-[#f4ede1]/75">
        {t('settings.text_security')}
      </Text>

      <Flex
        direction="column"
        gap="3"
        className="rounded-lg border border-red-500/30 bg-red-500/5 p-4"
      >
        <Text as="p" size="3" weight="medium" className="text-red-400">
          {t('settings.danger_zone.title')}
        </Text>
        <Text as="p" size="2" className="text-[#f4ede1]/75">
          {t('settings.danger_zone.description')}
        </Text>

        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <Button color="red" className="w-fit">
              {t('settings.danger_zone.delete_button')}
            </Button>
          </AlertDialog.Trigger>
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>
              {t('settings.danger_zone.confirm_title')}
            </AlertDialog.Title>
            <AlertDialog.Description size="2">
              {t('settings.danger_zone.confirm_description')}
            </AlertDialog.Description>

            <Flex direction="column" gap="2" mt="4">
              <Text as="label" size="2" className="text-[#f4ede1]/85">
                {t('settings.danger_zone.confirm_email_label', {
                  email: user.email,
                })}
              </Text>
              <TextField.Root
                value={confirmEmail}
                onChange={e => setConfirmEmail(e.target.value)}
                placeholder={user.email}
              />
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  {t('settings.danger_zone.confirm_cancel')}
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  variant="solid"
                  color="red"
                  disabled={!isConfirmed || deleteAccount.isPending}
                  onClick={handleDeleteAccount}
                >
                  {deleteAccount.isPending
                    ? '...'
                    : t('settings.danger_zone.confirm_action')}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Flex>
    </Card>
  );
}
