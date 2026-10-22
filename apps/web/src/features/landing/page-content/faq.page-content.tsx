import { Flex, Heading } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { FAQ_ITEMS } from '@/features/help/help.constants';
import { FaqItem } from '@/features/help/ui/faq-item.component';
import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';
import { Reveal } from '@/features/landing/ui/reveal.component';

export default function FaqPageContent() {
  const { t } = useTranslation();

  return (
    <LandingPublicLayout title={t('faq.meta_title')}>
      <Reveal>
        <Heading
          as="h1"
          size="7"
          mb="6"
          className="font-one-piece text-highlight font-bold tracking-wide"
        >
          {t('landing.nav.faq')}
        </Heading>
      </Reveal>
      <Flex direction="column" gap="3">
        {FAQ_ITEMS.map(([titleKey, textKey]) => (
          <Reveal key={titleKey} y={20}>
            <FaqItem
              question={t(`faq.${titleKey}`)}
              answer={t(`faq.${textKey}`)}
            />
          </Reveal>
        ))}
      </Flex>
    </LandingPublicLayout>
  );
}
