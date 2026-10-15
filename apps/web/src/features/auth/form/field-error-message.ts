import type { TFunction } from 'i18next';
import type * as z from 'zod/v4';

// TanStack Form tipa los errores como issues de Standard Schema, pero Zod
// entrega los suyos completos: el `code` es lo que se traduce.
function isZodIssue(issue: { message: string }): issue is z.core.$ZodIssue {
  return 'code' in issue;
}

/** Texto en el idioma de la web para el primer error de un campo; ignora `message`, que es para desarrolladores. */
export function getFieldErrorMessage(
  issue: { message: string } | undefined,
  t: TFunction,
) {
  if (!issue) return undefined;
  if (!isZodIssue(issue)) return t('validation.invalid');

  switch (issue.code) {
    case 'too_small':
      return Number(issue.minimum) <= 1
        ? t('validation.required')
        : t('validation.too_short', { minimum: Number(issue.minimum) });
    case 'too_big':
      return t('validation.too_long', { maximum: Number(issue.maximum) });
    case 'invalid_format':
      return issue.format === 'email'
        ? t('validation.invalid_email')
        : t('validation.invalid');
    case 'custom':
      return issue.params?.i18n === 'passwords_mismatch'
        ? t('validation.passwords_mismatch')
        : t('validation.invalid');
    default:
      return t('validation.invalid');
  }
}
