# One Piece LogPose v3

Monorepo para la aplicación **One Piece LogPose** — seguimiento de la serie, colección de cartas, red social y gamificación para fans de One Piece.

**Repositorio:** [github.com/Fernando-Herrero/onepiece-final-project](https://github.com/Fernando-Herrero/onepiece-final-project)

## Stack

- **Frontend:** Next.js 16 (Pages Router) + React 19 + Tailwind 4 + TanStack Query
- **Backend:** Express 5 + TypeScript + MongoDB/Mongoose
- **Contratos:** oRPC + Zod (`@logpose/contracts`)
- **Tooling:** pnpm 11.6 + Turbo, Node 24.16.0

## Estructura

```
apps/web/          → UI (puerto 3000)
apps/api/          → API REST + oRPC (puerto 4000)
packages/contracts → Tipos y validación compartidos
```

## Inicio rápido

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api

## Documentación

| Doc | Descripción |
|-----|-------------|
| [AGENTS.md](./AGENTS.md) | Guía para el agente de IA |
| [docs/MIGRATION.md](./docs/MIGRATION.md) | Plan de migración completo |
| [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) | Convenciones de código |
| [docs/REFERENCE-ADMIN.md](./docs/REFERENCE-ADMIN.md) | Patrones replicados del monorepo admin |

## Repos legacy (migración en curso)

- Frontend v2: `5-REACT/PROYECTOS/One-piece-LogPose` (Vite SPA)
- Backend v2: `7-NODE/proyectos/api-onepiece` (Express API)

## Fase actual

**Fase 0** — Scaffold ✅ → siguiente: **Fase 1** contratos oRPC

Ver [docs/MIGRATION.md](./docs/MIGRATION.md) para el plan completo.
