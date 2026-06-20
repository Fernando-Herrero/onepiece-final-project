import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';
import { Reveal } from '@/features/landing/ui/reveal.component';

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      className="faq-item rounded-lg border border-[#f4ede1]/10 bg-[#0b1120]/60 backdrop-blur-sm transition-colors hover:border-[#f2d9a8]/25"
      data-open={open || undefined}
    >
      <Button
        type="button"
        variant="ghost"
        highContrast
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="font-road-captain h-auto w-full max-w-full min-w-0 cursor-pointer justify-between gap-3 px-4 py-3 text-left text-lg font-bold tracking-wide text-[#f2d9a8]/90"
      >
        <Text as="span" className="min-w-0 flex-1 text-left">
          {question}
        </Text>
        <Text as="span" className="faq-chevron shrink-0 text-[#f4ede1]/50">
          ▾
        </Text>
      </Button>
      <Box className="faq-panel">
        <Box className="faq-panel-inner">
          <Text
            as="p"
            size="2"
            color="gray"
            className="faq-answer px-4 py-4 leading-relaxed"
          >
            {answer}
          </Text>
        </Box>
      </Box>
    </Card>
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
