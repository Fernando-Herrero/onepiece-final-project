# One Piece LogPose

Aplicación web para fans de **One Piece**: seguir el progreso del anime/manga, coleccionar cartas de personajes y elementos del universo, participar en una comunidad y desbloquear logros a medida que avanzas en la serie.

## Qué incluye

- **Progreso de serie** — capítulos, arcos y sagas; XP y niveles según lo que vas viendo
- **Colección de cartas** — personajes, frutas del diablo, espadas, barcos, objetos…
- **Comunidad** — publicaciones, comentarios, perfiles y seguimiento entre usuarios
- **Gamificación** — logros, notificaciones y recompensas ligadas al progreso

## Arquitectura

Monorepo con tipado compartido entre frontend y backend:

```
apps/web/          → interfaz (Next.js, puerto 3000)
apps/api/          → API (Express, puerto 4000)
packages/contracts → contratos oRPC + schemas Zod
```

El cliente web consume la API a través de contratos tipados (oRPC + TanStack Query), sin duplicar tipos ni validaciones.

## Tecnologías

| Capa | Stack |
|------|--------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TanStack Query |
| Backend | Express 5, TypeScript, MongoDB con Mongoose |
| Contratos | oRPC, Zod |
| Monorepo | pnpm, Turbo |

## Inicio rápido

Requisitos: Node 24.16.0, pnpm 11.6 (recomendado [mise](https://mise.jdx.dev) + `.node-version` en la raíz).

```bash
pnpm install
pnpm dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:4000/api

Otros comandos útiles: `pnpm build`, `pnpm lint`, `pnpm type-check`, `pnpm format`.

## Estado del proyecto (jun 2026)

| Hecho | Pendiente |
|-------|-----------|
| Contratos oRPC (7 módulos) | Dashboard web (Fase 4) |
| API Express migrada | Protección rutas autenticadas |
| Landing pública + login/register | Landing móvil sin animaciones (perf Vercel) |

Detalle por fase, próximo paso y verificación: [`docs/MIGRATION.md`](docs/MIGRATION.md) §1.1.  
Guía para el agente: [`AGENTS.md`](AGENTS.md).

## Origen del proyecto

LogPose v3 migra y unifica dos proyectos anteriores (SPA en Vite + API Express separada) en este monorepo, con contratos compartidos y la misma base de herramientas que un monorepo profesional de referencia.
