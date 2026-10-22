import { Card, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import type { TranslationKey } from '@/integrations/next-i18next/translation-key';

type DashboardPlaceholderPageContentProps = {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

export function DashboardPlaceholderPageContent({
  titleKey,
  bodyKey,
}: DashboardPlaceholderPageContentProps) {
  const { t } = useTranslation();

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-6">
      <Heading
        as="h1"
        size="6"
        mb="3"
        className="font-one-piece text-[#f2d9a8]"
      >
        {t(titleKey)}
      </Heading>
      <Text as="p" size="2" className="text-[#f4ede1]/75">
        {t(bodyKey)}
      </Text>
    </Card>
  );
}
