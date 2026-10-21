# Auth propia con JWT en cookie y un rol simple `user | admin`

## Decisión

- **Sesión:** al hacer login o registro, la API firma un JWT con solo el id del usuario (`sub`) y lo guarda en una cookie `httpOnly` de 2 horas (`auth-session.service.ts`, `auth.cookies.ts`).
- **Privado por defecto:** `SessionGuard` está registrado como `APP_GUARD` (`auth.module.ts`), así que todo endpoint exige sesión salvo que lleve `@Public()`. El guard deja quién mira (`Viewer`) en `request.viewer`, y los handlers que exigen sesión lo leen con `requireViewer(context.request)` (`integrations/orpc/orpc-context.ts`). Qué ve cada uno: ADR 0006.
- **Rol:** `user` o `admin`. No va en el JWT: el guard lo lee de la base de datos una vez por petición (`UsersPersistence.findRoleById`) y viaja en el `Viewer`.
- **Web:** las páginas `/dashboard/*` validan la sesión en `getServerSideProps` contra `/api/auth/me`, y las de admin exigen además `role === 'admin'` (`integrations/auth/server.ts`).

## Por qué

La única necesidad de permisos es moderar usuarios y posts, y se cubre sin sobreingeniería.

## Alternativas rechazadas

**La auth de la arquitectura de referencia** (SSO corporativo con RBAC por recursos): infraestructura corporativa que LogPose no necesita.
