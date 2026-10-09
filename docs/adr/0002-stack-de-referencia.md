# El stack copia el de la arquitectura de referencia: monorepo, Pages Router y contrato oRPC compartido

## Decisión

LogPose es un monorepo pnpm + Turbo con el mismo stack que la arquitectura de referencia:

- `apps/web`: Next con **Pages Router** (`pageExtensions: ['page.tsx', 'page.ts']` en `next.config.mjs`), no App Router.
- `apps/api`: NestJS (ver [ADR 0001](0001-api-nest-sin-mongoose.md)).
- `packages/contracts`: el contrato oRPC con sus schemas Zod. Lo implementa la API (`@Implement`) y lo consume la web (`OpenAPILink`). Se compila y las apps importan el JS de `dist/`, por eso `build`, `dev` y `type-check` dependen de `^build` en `turbo.json`.

## Por qué

- Un solo repo para frontend, backend y contratos, con TypeScript en todo el stack.
- Contratos compartidos: si la API cambia la forma de un dato, la web deja de compilar en vez de fallar en producción.
- Un stack ya probado (catálogo de pnpm, Turbo, Pages Router, oRPC) en lugar de diseñar uno desde cero.

## Consecuencias

Pasar a App Router obligaría a reescribir todas las páginas (`*.page.tsx`), el guard de sesión en `getServerSideProps` (`integrations/auth/server.ts`) y la hidratación de TanStack Query. No se hace sin un ADR que sustituya a este.
