# La web y la API se sirven desde el mismo origen

## Decisión

El navegador nunca llama a la API en su propio host. Pide `/api/*` al origen de la web y Next lo reescribe hacia la API (`rewrites` en `apps/web/next.config.mjs`, destino `API_INTERNAL_URL` o `localhost:4000` en desarrollo). El cliente oRPC usa `window.location.origin` como base (`integrations/orpc/orpc.client.ts`).

En SSR, `getServerSideProps` llama directamente a `API_INTERNAL_URL` y reenvía la cookie del request (`integrations/auth/server.ts`).

## Por qué

El motivo no quedó registrado al implementarlo. Lo que sostiene la decisión hoy son sus consecuencias:

- La cookie de sesión es del mismo sitio que la web: `httpOnly`, `sameSite: 'lax'` (`auth.cookies.ts`), sin depender de cookies de terceros.
- La API no necesita CORS: `main.ts` no llama a `enableCors`.

## Consecuencias

Si la web llama a la API en otro origen, o desaparece el proxy, la sesión deja de viajar y la API necesitaría CORS con credenciales. Cualquier cambio del flujo de registro y login parte de aquí.
