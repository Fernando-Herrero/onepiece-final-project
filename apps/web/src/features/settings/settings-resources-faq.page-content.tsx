import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { FAQ_ITEMS } from '@/features/help/help.constants';
import { FaqItem } from '@/features/help/ui/faq-item.component';
import { SettingsPageShell } from '@/features/settings/settings-page-shell.component';

export default function SettingsResourcesFaqPageContent() {
  const { t } = useTranslation();

  return (
    <SettingsPageShell
      titleKey="settings.resources.faq_title"
      descriptionKey="settings.resources.faq_text"
      backHref="/dashboard/settings/resources"
      backLabelKey="settings.resources.back"
    >
      <Flex direction="column" gap="3">
        {FAQ_ITEMS.map(([titleKey, textKey]) => (
          <FaqItem
            key={titleKey}
            question={t(`faq.${titleKey}`)}
            answer={t(`faq.${textKey}`)}
          />
        ))}
      </Flex>
    </SettingsPageShell>
  );
}
