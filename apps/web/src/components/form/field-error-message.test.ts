import { createInstance, type TFunction } from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { getFieldErrorMessage } from '@/components/form/field-error-message';

import common from '../../../public/locales/es/common.json';

let t: TFunction;

beforeAll(async () => {
  const i18n = createInstance();
  await i18n.init({
    lng: 'es',
    defaultNS: 'common',
    resources: { es: { common } },
  });
  t = i18n.t;
});

function firstIssue(schema: z.ZodType, value: unknown) {
  return schema.safeParse(value).error?.issues[0];
}

describe('getFieldErrorMessage', () => {
  it.each([
    [
      'too_small con minimum 1',
      z.string().min(1),
      '',
      'Este campo es obligatorio',
    ],
    [
      'too_small con minimum 3',
      z.string().min(3),
      'ab',
      'Debe tener al menos 3 caracteres',
    ],
    ['too_big', z.string().max(5), 'abcdefg', 'No puede superar 5 caracteres'],
    ['invalid_format de email', z.email(), 'no-es-email', 'Email no válido'],
    [
      'invalid_format que no es email',
      z.string().regex(/^a$/),
      'b',
      'Valor no válido',
    ],
    [
      'custom con i18n passwords_mismatch',
      z
        .string()
        .refine(() => false, { params: { i18n: 'passwords_mismatch' } }),
      'x',
      'Las contraseñas no coinciden',
    ],
    ['custom sin i18n', z.string().refine(() => false), 'x', 'Valor no válido'],
    ['un code desconocido (invalid_type)', z.number(), 'a', 'Valor no válido'],
  ])('traduce %s', (_, schema, value, expected) => {
    expect(getFieldErrorMessage(firstIssue(schema, value), t)).toBe(expected);
  });

  it('devuelve undefined si no hay error', () => {
    expect(getFieldErrorMessage(undefined, t)).toBeUndefined();
  });

  it('devuelve "Valor no válido" para un issue sin code', () => {
    expect(getFieldErrorMessage({ message: 'cualquier cosa' }, t)).toBe(
      'Valor no válido',
    );
  });
});
