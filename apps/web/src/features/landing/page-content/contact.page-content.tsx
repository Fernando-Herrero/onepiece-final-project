import { Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { ContactForm } from '@/features/help/ui/contact-form.component';
import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';
import { Reveal } from '@/features/landing/ui/reveal.component';

export default function ContactPageContent() {
  const { t } = useTranslation();

  return (
    <LandingPublicLayout title={t('contact.meta_title')}>
      <Reveal>
        <Flex direction="column" align="center" gap="5">
          <Text
            as="p"
            size="3"
            color="gray"
            align="center"
            className="max-w-sm leading-relaxed"
          >
            {t('contact.message_title')}
          </Text>

          <ContactForm titleAs="h1" />
        </Flex>
      </Reveal>
    </LandingPublicLayout>
  );
}
