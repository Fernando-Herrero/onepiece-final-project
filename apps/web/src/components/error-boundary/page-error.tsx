import {
  Button,
  Callout,
  Flex,
  Heading,
  Link as RadixLink,
  Text,
} from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

type PageErrorProps = {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
};

export function PageError({
  title,
  message,
  onRetry,
  retryText,
}: PageErrorProps) {
  const { t } = useTranslation();

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="4"
      py="9"
      className="text-center"
    >
      <Callout.Root color="red" variant="soft" className="max-w-md text-left">
        <Callout.Icon>⚠️</Callout.Icon>
        <Callout.Text>
          <div>
            <Heading as="h2" size="4" mb={message ? '2' : '0'}>
              {title}
            </Heading>
            {message ? (
              <Text as="div" size="2" color="gray">
                {message}
              </Text>
            ) : null}
          </div>
        </Callout.Text>
      </Callout.Root>
      {onRetry ? (
        <Button type="button" color="red" onClick={onRetry}>
          {retryText}
        </Button>
      ) : null}
      <RadixLink asChild color="orange" highContrast>
        <a href="/">{t('errors.back_home')}</a>
      </RadixLink>
    </Flex>
  );
}
