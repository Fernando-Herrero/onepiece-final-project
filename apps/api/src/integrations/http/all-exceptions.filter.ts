import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import type { ServerEnv } from '../env/server.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly config: ConfigService<ServerEnv, true>) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const isProduction =
      this.config.get('NODE_ENV', { infer: true }) === 'production';

    if (isHttpException) {
      const body = exception.getResponse();
      response
        .status(status)
        .json(
          typeof body === 'string'
            ? { statusCode: status, message: body }
            : body,
        );
      return;
    }

    this.logger.error(
      JSON.stringify({
        event: 'http.unhandled_error',
        method: request.method,
        path: request.url,
        error:
          exception instanceof Error
            ? {
                name: exception.name,
                message: exception.message,
                stack: exception.stack,
              }
            : { value: String(exception) },
      }),
    );

    response.status(status).json({
      statusCode: status,
      message: isProduction
        ? 'Internal server error'
        : exception instanceof Error
          ? exception.message
          : 'Internal server error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
