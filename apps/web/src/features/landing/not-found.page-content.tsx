import { Button, Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';

export default function NotFoundPageContent() {
  const { t } = useTranslation();

  return (
    <LandingPublicLayout title={t('not_found.meta_title')}>
      <Flex direction="column" align="center" gap="4" className="py-16 text-center">
        <Heading
          as="h1"
          size="8"
          className="font-one-piece tracking-wide text-[#f2d9a8]"
        >
          404
        </Heading>
        <Text as="p" size="4" color="gray">
          {t('not_found.message')}
        </Text>
        <Button color="orange" size="3" asChild>
          <Link href="/">{t('not_found.back_home')}</Link>
        </Button>
      </Flex>
    </LandingPublicLayout>
  );
}
