import { Logger } from '@nestjs/common';

const logger = new Logger('ORPC');

export function logOrpcError(error: unknown): void {
  logger.error(
    JSON.stringify({
      event: 'orpc.unhandled_error',
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : { value: String(error) },
    }),
  );
}
