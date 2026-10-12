import type { ORPCModuleConfig } from '@orpc/nest';
import { ORPCError } from '@orpc/server';

type ProcedureInterceptor = NonNullable<
  ORPCModuleConfig['interceptors']
>[number];

/**
 * oRPC solo da por error del contrato un ORPCError con el status declarado en
 * `.errors()`. Este interceptor se lo pone, para que los servicios lancen
 * `new ORPCError('CODIGO')` sin saber de qué procedure vienen.
 */
export const contractErrorsInterceptor: ProcedureInterceptor = async ({
  next,
  procedure,
}) => {
  try {
    return await next();
  } catch (error) {
    if (!(error instanceof ORPCError)) throw error;

    const config = procedure['~orpc'].errorMap[error.code];
    if (!config) throw error;

    throw new ORPCError(error.code, {
      status: config.status,
      message: config.message,
      cause: error,
    });
  }
};
