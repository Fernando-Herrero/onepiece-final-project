import type { MongoClientOptions } from 'mongodb';

/**
 * Opciones del cliente, compartidas por la app y sus tests de integración. Sin
 * `ignoreUndefined`, un opcional sin valor se inserta como `null` y rompe los
 * schemas de salida.
 */
export const mongoClientOptions = {
  ignoreUndefined: true,
} satisfies MongoClientOptions;
