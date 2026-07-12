/**
 * Utilidades para leer errores tipados del cliente oRPC en mutaciones.
 * La API devuelve códigos como `ALREADY_FOLLOWING`; aquí se extraen de forma segura
 * para mostrar toasts concretos (p. ej. follow/unfollow en perfil).
 */
import { type InferClientErrorUnion, isDefinedError } from '@orpc/client';

import { client } from '@/integrations/orpc/orpc.client';

type OrpcClientError = InferClientErrorUnion<typeof client>;

/** Códigos de error de mutaciones de usuario que el front conoce y traduce. */
const KNOWN_USER_MUTATION_CODES = [
  'ALREADY_FOLLOWING',
  'NOT_FOLLOWING',
  'CANNOT_FOLLOW_SELF',
  'PRIVACY_DENIED',
  'FORBIDDEN',
] as const;

export type KnownUserMutationCode = (typeof KNOWN_USER_MUTATION_CODES)[number];

/** Devuelve el `code` del error oRPC si es un defined error; si no, `undefined`. */
export function getOrpcErrorCode(error: unknown): string | undefined {
  const typedError = error as OrpcClientError;

  if (!isDefinedError(typedError)) {
    return undefined;
  }

  return typedError.code;
}

/** Type guard: el error es uno de los códigos de mutación de usuario conocidos. */
export function isKnownUserMutationError(
  error: unknown,
): error is { code: KnownUserMutationCode } {
  const code = getOrpcErrorCode(error);

  return (
    code !== undefined &&
    (KNOWN_USER_MUTATION_CODES as readonly string[]).includes(code)
  );
}
