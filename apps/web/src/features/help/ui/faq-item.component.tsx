import { Box, Button, Card, Text } from '@radix-ui/themes';
import { useState } from 'react';

import { Icon } from '@/components/icons/icon';

type FaqItemProps = {
  question: string;
  answer: string;
};

/** Acordeón de una pregunta. Compartido por /faq y ajustes › recursos › FAQ. */
export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      className="faq-item group border-foreground/10 bg-page/60 hover:border-highlight/25 rounded-lg border backdrop-blur-sm transition-colors"
      data-open={open || undefined}
    >
      <Button
        type="button"
        variant="ghost"
        highContrast
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="font-road-captain text-highlight/90 h-auto w-full max-w-full min-w-0 cursor-pointer justify-between gap-3 px-4 py-3 text-left text-lg font-bold tracking-wide"
      >
        <Text as="span" className="min-w-0 flex-1 text-left">
          {question}
        </Text>
        <Box
          aria-hidden="true"
          className="text-foreground/50 shrink-0 transition-transform duration-300 ease-in-out group-data-open:rotate-180 motion-reduce:transition-none"
        >
          <Icon.CaretDown />
        </Box>
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
