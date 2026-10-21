# Qué ve cada audiencia de un perfil

## Decisión

`SessionGuard` resuelve en cada petición quién mira (`Viewer`: anónimo, o usuario con su rol), y `accessTo(viewer, ownerId)` (`features/auth/access.ts`) le da acceso `full` sobre un perfil si es su dueño o un admin, y `public` en el resto de casos.

| Dato                                                          | `public`        | `full` |
| ------------------------------------------------------------- | --------------- | ------ |
| Perfil: nombre, avatar, bio, `role`, `isActive`, `privacy`, … | sí              | sí     |
| Privado: `email`, `phoneNumber`, `address` y `preferences`    | no              | sí     |
| Pestañas de posts, likes, guardados y comentarios             | según `privacy` | sí     |

En el contrato, `users.getById` devuelve una unión discriminada por `access`: `sessionUserSchema` (perfil y datos privados, lo mismo que `auth.me`) con `access: 'full'`, o `userProfileSchema` con `access: 'public'`. La web solo lee los datos privados después de comprobar `access === 'full'`.

## Por qué

- Antes `getById` devolvía el email, el teléfono y la dirección a cualquiera, con o sin sesión, y era la web la que decidía no pintarlos.
- Con la unión, olvidarse de comprobar el acceso no compila: `user.email` no existe en la rama `public`.

## Alternativas rechazadas

**Campos privados opcionales en un solo schema**: `undefined` no distingue «no tienes acceso» de «no lo ha rellenado», y nada obliga a comprobarlo antes de leer.
