# One Piece LogPose

Aplicación web para fans de **One Piece**: seguir la serie episodio a episodio, compartir posts con otros fans y, más adelante, coleccionar cartas que se desbloquean con el progreso.

## Qué funciona hoy

- Registro e inicio de sesión con cookie.
- Serie por sagas, arcos y episodios (los episodios, por ahora, solo de East Blue).
- Comunidad: posts con imágenes, likes, guardados y retweets, con visibilidad pública, para seguidores o privada.
- Perfiles con seguimiento y ajustes de privacidad, accesibilidad y premium (pago simulado).

Pendiente: progreso con XP, cartas, comentarios, notificaciones, búsqueda y panel de admin.

## Estructura

```
apps/web/            → Next.js 16 (Pages Router), Tailwind 4, Radix Themes y TanStack Query. Puerto 3000
apps/api/            → NestJS 11 con @orpc/nest y MongoDB. Puerto 4000
packages/contracts/  → contratos oRPC y schemas Zod que comparten las dos apps
```

La web llama a la API con un cliente oRPC tipado desde `packages/contracts`, así que los tipos y la validación de cada endpoint se escriben una vez.

## Arrancar en local

Requisitos: Node 24.16.0 (`.node-version`), pnpm 11.6 y un MongoDB en replica set, porque borrar una cuenta usa una transacción. Atlas ya lo es; en local, `mongod --replSet rs0` y una vez `rs.initiate()` en mongosh.

```bash
cp apps/api/.env.example apps/api/.env
pnpm install
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/health/ y Swagger en http://localhost:4000/api/orpc

Las imágenes de los posts necesitan las claves de Cloudinary en `apps/api/.env`. Otros scripts: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm type-check` y `pnpm format`.

## Documentación

- [GLOSSARY.md](GLOSSARY.md): vocabulario del dominio.
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md): convenciones de código, de Radix UI y de la API Nest.
- [docs/adr/](docs/adr/): decisiones de arquitectura con su porqué.
