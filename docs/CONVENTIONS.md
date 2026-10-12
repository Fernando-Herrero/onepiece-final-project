# Convenciones de código — LogPose

## TypeScript

- Tipado estricto en contratos, API handlers y tipos públicos
- Inferir en variables locales cuando sea obvio
- `Zod` en boundaries: contratos oRPC, validación API
- No `any`; usar `unknown` + narrow
- Migración JSX → TSX progresiva al portar legacy

---

## React / Next (Pages Router)

### Verticals (código agrupado por dominio)

Inspirado en [The Vertical Codebase](https://tkdodo.eu/blog/the-vertical-codebase) y en la arquitectura de referencia: **no** separar por tipo (`components/`, `hooks/`, `utils/` globales), sino por **funcionalidad** — cada vertical es un feature de primer nivel.

```
features/<vertical>/
├── api/
│   ├── query-options.ts      # get<Vertical>QueriesOptions(client)
│   ├── use-<vertical>.ts     # hooks oRPC (ej. use-auth.ts)
│   └── <vertical>.keys.ts    # si hace falta
├── form/                     # TanStack Form (si aplica)
├── ui/
│   └── *.component.tsx
├── <vertical>.page-content.tsx   # shell de página (default export)
├── <vertical>.types.ts
└── <vertical>.constants.ts
```

**Cadena de página (como en la referencia):**

```
pages/<ruta>.page.tsx              → thin: routing + getServerSideProps + getLayout
  └── features/<vertical>/<vertical>.page-content.tsx
        └── ui/*.component.tsx + Suspense + ErrorBoundary
```

**Composición entre verticals:** una página puede importar de otros features (ej. `login.page-content` usa `landing` layout + `auth` forms), pero cada vertical **posee** su propia capa `api/` y `ui/`.

**Shared real:** `components/error-boundary/` (`PageError`, `QueryErrorFallback`), `components/icons/`, `components/verified-badge/`, `features/dashboard/` layout.

**Contenido compartido entre público y dashboard:** cuando la misma pantalla debe existir dentro y fuera de la sesión (FAQ, contacto, tripulación), el contenido vive en un vertical neutro — `features/help/` — y cada lado aporta solo su layout: `LandingPublicLayout` en la landing, `SettingsPageShell` en el dashboard. **Nunca duplicar el contenido ni enlazar desde el dashboard a una ruta de la landing:** sacaría al usuario con sesión a la pantalla con login/registro.

**Claves i18n como prop:** un componente que recibe una clave de traducción en vez de un literal la tipa con `TranslationKey` (`@/integrations/next-i18next/translation-key`), para no perder el tipado que da `i18next.d.ts`.

### UI — Radix + Tailwind

- **Radix UI Themes** (`@radix-ui/themes`) como base de componentes en dashboard y features autenticadas: `Box`, `Flex`, `Button`, `Card`, `Heading`, `Avatar`, `Grid`, `Spinner`, etc.
- Usar Radix **siempre que cubra el caso** sin perder funcionalidad importante. Preferir `Box`/`Flex` frente a `div`/`span` para layout; `Text`/`Heading` para copy; `Avatar` para fotos de perfil con fallback.
- Componentes custom + Tailwind solo cuando Radix no lo dé: `<picture>` multi-breakpoint, flip de carta, acordeón serie, banners con URL externa arbitraria, hover swap en avatar picker.
- Mantener identidad visual legacy (fuentes One Piece, paleta naranja/crema) **encima** de Radix, no sustituirla por un look genérico de backoffice.

### Imágenes — `next/image` vs `<img>`

| Caso                                                                | Herramienta                                                                                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Assets estáticos de `/public` (landing, cartas con path controlado) | `next/image` (`fill` + `sizes` o `width`/`height`)                                                                                                |
| Avatar de usuario circular                                          | Radix `Avatar` con `src` **siempre definido** (default Luffy si falta) + `fallback` para error de carga; `onLoadingStatusChange` → swap a default |
| Cover / URL libre del usuario (`coverImage`)                        | `<img>` dentro de `Box` + `onError` hasta definir `images.remotePatterns`                                                                         |
| `<picture>` + `srcSet` / art direction                              | `<picture>` + `<img>` (excepción documentada)                                                                                                     |
| Picker con hover entre dos imágenes                                 | `<img>` (excepción documentada)                                                                                                                   |

No migrar todo a `next/image` de golpe: aplicar la tabla en código nuevo y al tocar un componente existente.

### Convención de páginas (igual que en la referencia)

- Archivos en `src/pages/` con sufijo `.page.tsx`
- `next.config.mjs`: `pageExtensions: ['page.tsx', 'page.ts']`
- Ejemplo: `dashboard/community.page.tsx` → ruta `/dashboard/community`

### Estado

| Tipo                      | Herramienta                  |
| ------------------------- | ---------------------------- |
| Datos de API              | TanStack Query + oRPC client |
| Formularios simples       | `useState` local             |
| UI global (modal, device) | Context ligero               |
| Auth session              | Query `me` + token storage   |

**No usar Context para:** posts, users, notifications, profile data.

### Componentes

- Funcionales siempre
- Archivos UI en `features/<vertical>/ui/` con sufijo `.component.tsx` (como en la referencia)
- Props tipadas con `type` o `interface`
- `'use client'` implícito en Pages Router (todo es client salvo SSR explícito)

---

## oRPC + contratos

### Orden de trabajo

1. Definir schema Zod en `packages/contracts/src/features/<name>/` o `common/` si es compartido
2. IDs Mongo genéricos → `packages/contracts/src/common/id.schemas.ts` (`mongoIdSchema`, `mongoIdParamsSchema`)
3. Definir contract con `@orpc/contract`
4. Exportar en `packages/contracts/src/contract.ts`
5. `pnpm --filter @logpose/contracts build`
6. Implementar handler en API
7. Consumir desde web con cliente tipado

### No duplicar

- Un schema Zod por entidad — vive en contracts
- API y web importan de `@logpose/contracts`

---

## API Nest (`apps/api`)

### Cuatro capas por feature

```text
packages/contracts  →  *.controller.ts  →  *.service.ts  →  *.persistence.ts
   Zod/oc              @Implement            negocio            @InjectCollection
```

### Reglas (referencia)

| Tema                             | Patrón                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Un procedure                     | Un método `@Implement` en controller                                                           |
| Input                            | Zod en contrato — **no** `ValidationPipe` en el mismo handler                                  |
| Output                           | `.output()` en contrato; lo valida oRPC (ADR 0005)                                             |
| Errores negocio                  | `.errors()` en contrato + `new ORPCError('CODIGO')` en servicio (ADR 0005)                     |
| Errores inesperados              | `AllExceptionsFilter` global                                                                   |
| Auth oRPC                        | `requireUser(context.request)` — no Guards Nest duplicados                                     |
| Rutas estáticas antes de `/{id}` | En controller: `list`, `ranking` **antes** de `getById` (evita que `/ranking` matchee como id) |
| Mongo                            | `@jperezmart/nest-mongodb` — **sin Mongoose**                                                  |
| Índices                          | `onModuleInit()` en `*Persistence`                                                             |
| Serializers                      | `*.model.ts` o funciones puras — no en persistence                                             |

### Archivos de integración oRPC

- `integrations/orpc/contract-errors.interceptor.ts` — `ORPCError` del servicio → error del contrato
- `integrations/orpc/orpc.config.ts` — config de `ORPCModule`; la usan la app y los tests de integración

Todos los `@orpc/*` van en el catálogo con la **misma versión exacta**: `@orpc/nest` fija la suya de `@orpc/server`, y dos copias son dos clases `ORPCError` que `instanceof` no reconoce entre sí. El pre-commit lo vigila con `pnpm dedupe --check`.

### Cliente web

- `OpenAPILink` + `credentials: 'include'` (cookies sesión)
- Errores de mutación: `getOrpcErrorCode(error)` en `integrations/orpc/orpc-error.ts`
- Query: `queryOptions` manual + `profile.keys` (válido); valorar `.queryOptions()` del cliente oRPC en fases futuras

---

## Estilos

- Tailwind 4 (`@import 'tailwindcss'` en globals.css)
- **Radix UI Themes** para componentes base (ver sección UI arriba)
- `classnames` para clases condicionales
- Mantener identidad visual del legacy One Piece al migrar
- Mobile first
- **Landing motion:** efectos GSAP/Lenis solo desktop; móvil estático
- **Preferencias de accesibilidad:** el único canal entre React y CSS son tres data-attributes en `<html>` — `data-font-scale` (`sm|md|lg`), `data-high-contrast` y `data-reduce-motion` (`'true'|'false'`). Los escribe `useApplyAccessibilityPreferences()` desde el layout del dashboard; las reglas cuelgan de ellos en `globals.css`. No añadir clases ni estado React para esto

---

## Imports

- Web: alias `@/*` → `src/*`
- Contracts: `@logpose/contracts/contract`, `@logpose/contracts/features/*`, `@logpose/contracts/common/*`
- Agregador queries: `@/integrations/tanstack-query/queries-options` → `getAllQueriesOptions(client)`
- Workspace: `workspace:*` en package.json

---

## Git y commits

- **Un paso verificado → un commit** (no acumular fases enteras)
- Antes de commit: checks del scope tocado (`pnpm format-check`, `pnpm lint`, `pnpm type-check` cuando aplique)
- Mensaje: imperativo, inglés, 1–2 frases (el porqué)
- Push tras cerrar el paso o al terminar la sesión

---

## Anti-patrones (recordatorio)

```typescript
// ❌ PROHIBIDO
const hasItems = (items: Item[]) => items.length > 0;

// ✅ CORRECTO
if (items.length > 0) { ... }
```

```tsx
// ❌ PROHIBIDO — derivar con effect
const [filtered, setFiltered] = useState([]);
useEffect(() => { setFiltered(items.filter(...)); }, [items]);

// ✅ CORRECTO
const filtered = items.filter(...);
```

```typescript
// ❌ PROHIBIDO — archivo para un uso
// utils/has-items.ts exportando una función

// ✅ CORRECTO — inline en el componente
```
