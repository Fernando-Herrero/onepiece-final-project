import * as z from 'zod/v4';

/** Entorno del servidor de Next (config y SSR); falla al compilar si falta algo en producción. */
export const env = z
  .object({
    // URL directa a la API: el proxy `/api` y el SSR la usan sin pasar por Next.
    API_INTERNAL_URL:
      process.env.NODE_ENV === 'production'
        ? z.url()
        : z.url().default('http://localhost:4000'),
  })
  .parse(process.env);
