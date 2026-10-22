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
    <Card className="card p-6">
      <Heading
        as="h1"
        size="6"
        mb="3"
        className="font-one-piece text-highlight"
      >
        {t(titleKey)}
      </Heading>
      <Text as="p" size="2" className="text-foreground/75">
        {t(bodyKey)}
      </Text>
    </Card>
  );
}
