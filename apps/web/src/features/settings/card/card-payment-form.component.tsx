import { Badge, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import {
  type CardField,
  type CardForm,
  detectCardBrand,
  EMPTY_CARD_FORM,
  formatCardNumber,
  formatCvv,
  formatExpiry,
  useCardValidation,
} from '@/features/settings/card/use-card-validation';

/** Latencia falsa de la pasarela, como en el LogPose v2. */
const FAKE_GATEWAY_DELAY_MS = 1500;

type CardPaymentFormProps = {
  onPaid: () => Promise<void>;
  onCancel: () => void;
  priceLabel: string;
};

const FORMATTERS: Partial<Record<CardField, (value: string) => string>> = {
  number: formatCardNumber,
  expiry: formatExpiry,
  cvv: formatCvv,
};

export function CardPaymentForm({
  onPaid,
  onCancel,
  priceLabel,
}: CardPaymentFormProps) {
  const { t } = useTranslation();
  const { errors, validateField, validateAll, isValid, reset } =
    useCardValidation();

  const [form, setForm] = useState<CardForm>(EMPTY_CARD_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const brand = detectCardBrand(form.number);

  function handleChange(field: CardField, rawValue: string) {
    const value = FORMATTERS[field]?.(rawValue) ?? rawValue;

    setForm(prev => ({ ...prev, [field]: value }));

    // Solo re-validamos en caliente lo que ya estaba marcado en rojo,
    // para no gritarle al usuario mientras teclea el primer dígito.
    if (submitted || errors[field]) {
      validateField(field, value);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);

    if (!validateAll(form)) {
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, FAKE_GATEWAY_DELAY_MS));
      await onPaid();
      setForm(EMPTY_CARD_FORM);
      setSubmitted(false);
      reset();
    } finally {
      setIsProcessing(false);
    }
  }

  function fieldState(field: CardField) {
    const error = errors[field];
    const showValid = form[field].length > 0 && isValid(field, form[field]);

    return {
      error,
      className: error
        ? 'border border-red-500/60'
        : showValid
          ? 'border border-green-500/40'
          : undefined,
    };
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="1">
          <Text as="label" size="2" htmlFor="card-name">
            {t('settings.premium.card_name')}
          </Text>
          <TextField.Root
            id="card-name"
            value={form.name}
            autoComplete="cc-name"
            placeholder={t('settings.premium.card_name_placeholder')}
            className={fieldState('name').className}
            onChange={event => handleChange('name', event.target.value)}
            onBlur={() => validateField('name', form.name)}
          />
          {errors.name ? (
            <Text size="1" className="text-red-400">
              {t(errors.name)}
            </Text>
          ) : null}
        </Flex>

        <Flex direction="column" gap="1">
          <Flex align="center" justify="between">
            <Text as="label" size="2" htmlFor="card-number">
              {t('settings.premium.card_number')}
            </Text>
            {brand ? (
              <Badge size="1" variant="soft" color="gray">
                {brand}
              </Badge>
            ) : null}
          </Flex>
          <TextField.Root
            id="card-number"
            value={form.number}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            className={fieldState('number').className}
            onChange={event => handleChange('number', event.target.value)}
            onBlur={() => validateField('number', form.number)}
          />
          {errors.number ? (
            <Text size="1" className="text-red-400">
              {t(errors.number)}
            </Text>
          ) : null}
        </Flex>

        <Flex gap="3">
          <Flex direction="column" gap="1" className="flex-1">
            <Text as="label" size="2" htmlFor="card-expiry">
              {t('settings.premium.card_expiry')}
            </Text>
            <TextField.Root
              id="card-expiry"
              value={form.expiry}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="08/30"
              className={fieldState('expiry').className}
              onChange={event => handleChange('expiry', event.target.value)}
              onBlur={() => validateField('expiry', form.expiry)}
            />
            {errors.expiry ? (
              <Text size="1" className="text-red-400">
                {t(errors.expiry)}
              </Text>
            ) : null}
          </Flex>

          <Flex direction="column" gap="1" className="flex-1">
            <Text as="label" size="2" htmlFor="card-cvv">
              {t('settings.premium.card_cvv')}
            </Text>
            <TextField.Root
              id="card-cvv"
              value={form.cvv}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              className={fieldState('cvv').className}
              onChange={event => handleChange('cvv', event.target.value)}
              onBlur={() => validateField('cvv', form.cvv)}
            />
            {errors.cvv ? (
              <Text size="1" className="text-red-400">
                {t(errors.cvv)}
              </Text>
            ) : null}
          </Flex>
        </Flex>

        <Text size="1" className="text-[#f4ede1]/50">
          {t('settings.premium.fake_notice')}
        </Text>

        <Flex gap="3" mt="2" justify="end">
          <Button
            type="button"
            variant="soft"
            color="gray"
            disabled={isProcessing}
            onClick={onCancel}
          >
            {t('settings.premium.cancel')}
          </Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing
              ? t('settings.premium.processing')
              : `${t('settings.premium.pay_and_verify')} · ${priceLabel}`}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
