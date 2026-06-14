import { Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';
import { Reveal } from '@/features/landing/ui/reveal.component';

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="faq-item rounded-lg border border-[#f4ede1]/10 bg-[#0b1120]/60 backdrop-blur-sm transition-colors hover:border-[#f2d9a8]/25"
      data-open={open || undefined}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="font-road-captain flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-lg font-bold tracking-wide text-[#f2d9a8]/90"
      >
        {question}
        <span className="faq-chevron text-[#f4ede1]/50">▾</span>
      </button>
      <div className="faq-panel">
        <div className="faq-panel-inner">
          <Text
            as="p"
            size="2"
            color="gray"
            className="faq-answer px-4 pb-4 leading-relaxed"
          >
            {answer}
          </Text>
        </div>
      </div>
    </div>
  );
}

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
      <Reveal>
        <Heading
          as="h1"
          size="7"
          mb="6"
          className="font-one-piece font-bold tracking-wide text-[#f2d9a8]"
        >
          {t('landing.nav.faq')}
        </Heading>
      </Reveal>
      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map(([titleKey, textKey]) => (
          <Reveal key={titleKey} y={20}>
            <FaqItem
              question={t(`faq.${titleKey}`)}
              answer={t(`faq.${textKey}`)}
            />
          </Reveal>
        ))}
      </div>
    </LandingPublicLayout>
  );
}
