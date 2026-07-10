import { Box, Button, Card, Flex, Text } from '@radix-ui/themes';
import type { ReactNode } from 'react';

import { Icon } from '@/components/icons/icon';

type SerieAccordionProps = {
  variant: 'saga' | 'arc';
  title: string;
  subtitle?: string;
  meta?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function SerieAccordion({
  variant,
  title,
  subtitle,
  meta,
  isOpen,
  onToggle,
  children,
}: SerieAccordionProps) {
  const isSaga = variant === 'saga';

  return (
    <Card
      className={
        isSaga
          ? 'faq-item rounded-2xl border border-[#f2d9a8]/20 bg-[linear-gradient(135deg,rgba(242,217,168,0.14)_0%,rgba(8,12,22,0.92)_45%,rgba(5,7,13,0.98)_100%)] p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)] data-open:shadow-[0_24px_60px_rgba(0,0,0,0.5)]'
          : 'faq-item rounded-xl border border-white/15 bg-[#0a0f1c]/85 p-3 shadow-md'
      }
      data-open={isOpen || undefined}
    >
      <Button
        type="button"
        variant="ghost"
        highContrast
        aria-expanded={isOpen}
        onClick={onToggle}
        className="h-auto w-full max-w-full min-w-0 cursor-pointer justify-between gap-3 p-0 text-left hover:bg-transparent"
      >
        <Flex align="start" justify="between" gap="3" className="w-full">
          <Box className="min-w-0 flex-1">
            <Flex align="baseline" wrap="wrap" gap="2">
              <Text
                as="p"
                size={isSaga ? '4' : '3'}
                weight="bold"
                className={`font-one-piece tracking-wide text-[#f2d9a8] ${isSaga ? 'text-2xl md:text-3xl' : 'text-xl'}`}
              >
                {title}
              </Text>
              {meta ? (
                <Text
                  as="span"
                  size="1"
                  color="gray"
                  className="text-[#f4ede1]/55"
                >
                  {meta}
                </Text>
              ) : null}
            </Flex>
            {subtitle ? (
              <Text
                as="p"
                size="1"
                className={`mt-1 text-[#f4ede1]/70 ${isSaga ? 'font-road-captain tracking-wide' : 'line-clamp-2'}`}
              >
                {subtitle}
              </Text>
            ) : null}
          </Box>

          <Box
            aria-hidden="true"
            className={`mt-1 shrink-0 text-[#f2d9a8] transition-transform duration-300 ease-in-out motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
          >
            <Icon.CaretDown />
          </Box>
        </Flex>
      </Button>

      <Box className="faq-panel">
        <Box className="faq-panel-inner">
          <Flex direction="column" gap="2" className="pt-4">
            {children}
          </Flex>
        </Box>
      </Box>
    </Card>
  );
}
