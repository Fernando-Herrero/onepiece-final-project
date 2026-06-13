import { Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';

const FAQ_ITEMS = [
  ['title_what_is', 'text_what_is'],
  ['title_how_create_profile', 'text_how_create_profile'],
  ['title_how_unlock_characters', 'text_how_unlock_characters'],
  ['title_what_are_items', 'text_what_are_items'],
  ['title_can_interact_users', 'text_can_interact_users'],
  ['title_what_is_dashboard', 'text_what_is_dashboard'],
  ['title_what_are_series_cards', 'text_what_are_series_cards'],
  ['title_need_to_pay', 'text_need_to_pay'],
  ['title_how_report_bug', 'text_how_report_bug'],
  ['title_use_without_seen', 'text_use_without_seen'],
  ['title_special_events', 'text_special_events'],
] as const;

export default function FaqPageContent() {
  const { t } = useTranslation();

  return (
    <LandingPublicLayout title={t('faq.meta_title')}>
      <Heading
        as="h1"
        size="7"
        mb="6"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {t('landing.nav.faq')}
      </Heading>
      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map(([titleKey, textKey]) => (
          <details
            key={titleKey}
            className="group rounded-lg border border-[#f4ede1]/10 bg-[#0b1120]/60 backdrop-blur-sm"
          >
            <summary className="cursor-pointer list-none px-4 py-3 font-road-captain tracking-wide text-[#f2d9a8]/90 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {t(`faq.${titleKey}`)}
                <span className="text-[#f4ede1]/50 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </span>
            </summary>
            <Text as="p" size="2" color="gray" className="px-4 pb-4 leading-relaxed">
              {t(`faq.${textKey}`)}
            </Text>
          </details>
        ))}
      </div>
    </LandingPublicLayout>
  );
}
