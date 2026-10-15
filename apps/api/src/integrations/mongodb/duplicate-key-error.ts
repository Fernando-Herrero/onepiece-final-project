import { MongoServerError } from 'mongodb';

/** Violación de un índice único (E11000). */
export function isDuplicateKeyError(error: unknown) {
  return error instanceof MongoServerError && error.code === 11000;
}
