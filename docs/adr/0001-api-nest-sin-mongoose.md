# La API es NestJS con oRPC, y Zod en `packages/contracts` es la única validación

Sustituye a la decisión del 2026-06-13 de quedarse en Express.

## Decisión

`apps/api` es NestJS 11 con `@orpc/nest` (`@Implement` del contrato) y `@jperezmart/nest-mongodb` sobre el driver `mongodb`, sin Mongoose. Los schemas Zod de `packages/contracts` son la única fuente de validación: no hay schemas de Mongoose ni `ValidationPipe` en los procedures, y el controller valida la salida con `parseOrThrow(schema, data)`.

## Por qué

- Alinea la API con la arquitectura de referencia: mismos módulos, mismo contrato y mismo acceso a Mongo.
- Dos validadores (Zod y Mongoose) se desincronizan.
- Los documentos son `Collection<T>` con tipos de TypeScript, no clases `Model`. La lógica va en `*Service` y el acceso en `*Persistence`, sin hooks implícitos.
- Una sola conexión, con `MongoModule.forRootAsync`.

## Alternativas rechazadas

**Quedarse en Express**: fue la decisión inicial (2026-06-13). Se abandona en julio de 2026 para alinear la API con la arquitectura de referencia.

**Mongoose**: por los dos validadores y los hooks implícitos.
