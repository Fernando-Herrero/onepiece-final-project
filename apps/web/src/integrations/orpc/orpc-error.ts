/**
 * Utilidades para leer errores tipados del cliente oRPC en mutaciones.
 * La API devuelve códigos como `ALREADY_FOLLOWING`; aquí se extraen de forma segura
 * para mostrar toasts concretos (p. ej. follow/unfollow en perfil).
 */
import { type InferClientErrorUnion, isDefinedError } from '@orpc/client';

import { client } from '@/integrations/orpc/orpc.client';

type OrpcClientError = InferClientErrorUnion<typeof client>;

/** Devuelve el `code` del error oRPC si es un defined error; si no, `undefined`. */
export function getOrpcErrorCode(error: unknown): string | undefined {
  const typedError = error as OrpcClientError;

  if (!isDefinedError(typedError)) {
    return undefined;
  }

  return typedError.code;
}
