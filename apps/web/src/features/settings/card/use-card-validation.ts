import { useState } from 'react';

import type { TranslationKey } from '@/integrations/next-i18next/translation-key';

export type CardField = 'name' | 'number' | 'expiry' | 'cvv';

export type CardForm = Record<CardField, string>;

export const EMPTY_CARD_FORM: CardForm = {
  name: '',
  number: '',
  expiry: '',
  cvv: '',
};

/** Algoritmo de Luhn: el mismo check que usa una pasarela real antes de cobrar. */
function passesLuhn(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number.parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/** Agrupa en bloques de 4 mientras se escribe: 4242 4242 4242 4242. */
export function formatCardNumber(value: string): string {
  return (
    value
      .replace(/\D/g, '')
      .slice(0, 19)
      .match(/.{1,4}/g)
      ?.join(' ') ?? ''
  );
}

/** Inserta la barra de MM/AA automáticamente. */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvv(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

/**
 * Marca de la tarjeta a partir del prefijo, solo para pintar la etiqueta.
 * No cambia la validación: cualquier número que pase Luhn se acepta.
 */
export function detectCardBrand(value: string): string | null {
  const digits = value.replace(/\D/g, '');

  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';

  return null;
}

/** Cadena vacía = campo válido; en caso contrario, la clave i18n del error. */
export type CardErrorKey = TranslationKey | '';

type CardErrors = Record<CardField, CardErrorKey>;

const NO_ERRORS: CardErrors = { name: '', number: '', expiry: '', cvv: '' };

/**
 * Validación de tarjeta portada del LogPose v2 (`useCardValidation.jsx`).
 * Devuelve claves i18n en vez de textos, para traducirlas en el componente.
 */
export function useCardValidation() {
  const [errors, setErrors] = useState<CardErrors>(NO_ERRORS);

  const validators: Record<CardField, (value: string) => CardErrorKey> = {
    name: value =>
      value.trim().length < 2 ? 'settings.premium.error_name' : '',

    number: value => {
      const digits = value.replace(/\s+/g, '');

      if (!/^\d{13,19}$/.test(digits) || !passesLuhn(digits)) {
        return 'settings.premium.error_number';
      }

      return '';
    },

    expiry: value => {
      const match = /^(\d{2})\/(\d{2})$/.exec(value);

      if (!match) {
        return 'settings.premium.error_expiry_format';
      }

      const month = Number.parseInt(match[1]!, 10);
      const year = Number.parseInt(match[2]!, 10);

      if (month < 1 || month > 12) {
        return 'settings.premium.error_expiry_month';
      }

      // Una tarjeta caduca el último día de su mes, así que vale hasta el mes siguiente.
      const expiresAt = new Date(2000 + year, month, 1);

      if (expiresAt <= new Date()) {
        return 'settings.premium.error_expiry_expired';
      }

      return '';
    },

    cvv: value => (/^\d{3,4}$/.test(value) ? '' : 'settings.premium.error_cvv'),
  };

  function validateField(field: CardField, value: string): boolean {
    const error = validators[field](value);
    setErrors(prev => ({ ...prev, [field]: error }));

    return error === '';
  }

  function validateAll(form: CardForm): boolean {
    const nextErrors = {
      name: validators.name(form.name),
      number: validators.number(form.number),
      expiry: validators.expiry(form.expiry),
      cvv: validators.cvv(form.cvv),
    };

    setErrors(nextErrors);

    return Object.values(nextErrors).every(error => error === '');
  }

  function isValid(field: CardField, value: string): boolean {
    return validators[field](value) === '';
  }

  function reset() {
    setErrors(NO_ERRORS);
  }

  return { errors, validateField, validateAll, isValid, reset };
}
