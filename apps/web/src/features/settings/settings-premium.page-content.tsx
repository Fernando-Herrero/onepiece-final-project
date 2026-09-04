import { POST_TEXT_MAX_LENGTH_VERIFIED } from '@logpose/contracts/common/post.schemas';
import {
  AlertDialog,
  Badge,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';

import { Icon } from '@/components/icons/icon';
import {
  useAuthSession,
  useUnverifyAccountMutation,
  useVerifyAccountMutation,
} from '@/features/auth/api/use-auth';
import { CardPaymentForm } from '@/features/settings/card/card-payment-form.component';

const PREMIUM_PRICE_LABEL = '4,99 €';

const PREMIUM_PERKS = [
  {
    id: 'badge',
    icon: <Icon.ShieldCheck />,
    titleKey: 'settings.premium.perk_badge_title',
    textKey: 'settings.premium.perk_badge_text',
  },
  {
    id: 'longer_posts',
    icon: <Icon.Comment />,
    titleKey: 'settings.premium.perk_posts_title',
    textKey: 'settings.premium.perk_posts_text',
  },
  {
    id: 'support',
    icon: <Icon.Heart />,
    titleKey: 'settings.premium.perk_support_title',
    textKey: 'settings.premium.perk_support_text',
  },
] as const;

export default function SettingsPremiumPageContent() {
  const { t } = useTranslation();
  const { user } = useAuthSession();
  const verifyAccount = useVerifyAccountMutation();
  const unverifyAccount = useUnverifyAccountMutation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!user) {
    return null;
  }

  const sessionUser = user;

  async function handlePaid() {
    try {
      await verifyAccount.mutateAsync(sessionUser._id);
      setCheckoutOpen(false);
      toast.success(t('settings.premium.success'));
    } catch {
      toast.error(t('settings.premium.error'));
    }
  }

  async function handleCancelPremium() {
    try {
      await unverifyAccount.mutateAsync(sessionUser._id);
      toast.success(t('settings.premium.cancel_success'));
    } catch {
      toast.error(t('settings.premium.cancel_error'));
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

      <Flex align="center" gap="2" mb="2">
        <Heading as="h1" size="6" className="font-one-piece text-[#f2d9a8]">
          {t('settings.title_premium')}
        </Heading>
        {sessionUser.verified ? (
          <Badge color="blue" variant="soft">
            {t('settings.premium.active_badge')}
          </Badge>
        ) : null}
      </Flex>

      <Text as="p" size="2" mb="5" className="text-[#f4ede1]/75">
        {sessionUser.verified
          ? t('settings.premium.active_description')
          : t('settings.premium.description')}
      </Text>

      <Flex direction="column" gap="3" mb="5">
        {PREMIUM_PERKS.map(perk => (
          <Flex
            key={perk.id}
            gap="3"
            align="start"
            className="rounded-lg border border-[#f2d9a8]/12 bg-[#1b2742]/30 p-3"
          >
            <span className="mt-0.5 text-[#f2d9a8]">{perk.icon}</span>
            <Flex direction="column" gap="1">
              <Text
                as="p"
                size="2"
                weight="medium"
                className="text-[#f2d9a8]/90"
              >
                {t(perk.titleKey)}
              </Text>
              <Text as="p" size="2" className="text-[#f4ede1]/65">
                {t(perk.textKey, { max: POST_TEXT_MAX_LENGTH_VERIFIED })}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>

      {sessionUser.verified ? (
        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <Button variant="soft" color="gray" className="w-fit">
              {t('settings.premium.cancel_button')}
            </Button>
          </AlertDialog.Trigger>
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>
              {t('settings.premium.cancel_title')}
            </AlertDialog.Title>
            <AlertDialog.Description size="2">
              {t('settings.premium.cancel_description')}
            </AlertDialog.Description>
            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  {t('settings.premium.cancel_keep')}
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  color="red"
                  disabled={unverifyAccount.isPending}
                  onClick={handleCancelPremium}
                >
                  {t('settings.premium.cancel_confirm')}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      ) : (
        <Dialog.Root open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <Dialog.Trigger>
            <Button className="w-fit">
              {t('settings.premium.subscribe_button', {
                price: PREMIUM_PRICE_LABEL,
              })}
            </Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="440px">
            <Dialog.Title>{t('settings.premium.checkout_title')}</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              {t('settings.premium.checkout_description')}
            </Dialog.Description>

            <CardPaymentForm
              priceLabel={PREMIUM_PRICE_LABEL}
              onPaid={handlePaid}
              onCancel={() => setCheckoutOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Root>
      )}
    </Card>
  );
}
