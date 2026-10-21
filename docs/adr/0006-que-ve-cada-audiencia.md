# Qué ve cada audiencia de un perfil y de un post

## Decisión

`SessionGuard` resuelve en cada petición quién mira (`Viewer`: anónimo, o usuario con su rol), y `accessTo(viewer, ownerId)` (`features/auth/access.ts`) le da acceso `full` sobre un perfil si es su dueño o un admin, y `public` en el resto de casos.

| Dato                                                          | `public`        | `full` |
| ------------------------------------------------------------- | --------------- | ------ |
| Perfil: nombre, avatar, bio, `role`, `isActive`, `privacy`, … | sí              | sí     |
| Privado: `email`, `phoneNumber`, `address` y `preferences`    | no              | sí     |
| Pestañas de posts, likes, guardados y comentarios             | según `privacy` | sí     |
| Contadores de esas pestañas (`users.getStats`)                | según `privacy` | sí     |

En el contrato, `users.getById` devuelve una unión discriminada por `access`: `sessionUserSchema` (perfil y datos privados, lo mismo que `auth.me`) con `access: 'full'`, o `userProfileSchema` con `access: 'public'`. La web solo lee los datos privados después de comprobar `access === 'full'`.

Cada post se ve según su `visibility`: `public`, todos; `followers`, quien sigue al dueño; `private`, nadie más. El dueño y el admin lo ven siempre. La regla es un filtro de Mongo, `visiblePostsFilter` (`access.ts`), que aplican todas las lecturas (feed, pestañas, originales de retweet, contadores) y las acciones sobre un post (like, guardado, retweet, borrado): lo que no ves no existe y da `POST_NOT_FOUND`. Solo se retuitea lo público. Un contador oculto por `privacy` no viene en la respuesta, y los que vienen cuentan lo mismo que lista su pestaña; `totalComments`, que no tiene pestaña, solo cuenta los comentarios en posts que el viewer ve. Ningún post expone quién le ha dado like o lo ha guardado: solo los contadores y `userLiked`/`userBookmarked` del viewer.

## Por qué

- Antes `getById` devolvía el email, el teléfono y la dirección a cualquiera, con o sin sesión, y era la web la que decidía no pintarlos.
- Con la unión, olvidarse de comprobar el acceso no compila: `user.email` no existe en la rama `public`.
- `visibility` existía, pero ninguna lectura la trataba: el feed y las pestañas solo leían lo público (ni el dueño veía sus privados), y los originales de retweet, los posts comentados, los likes y los retweets no miraban nada. El filtro va en la consulta porque el feed pagina en Mongo: filtrar después devolvería páginas cortas.

## Alternativas rechazadas

**`canSeePost` en memoria**: obliga a cargar los seguidores de cada dueño y rompe el tamaño de página del feed.

**Campos privados opcionales en un solo schema**: `undefined` no distingue «no tienes acceso» de «no lo ha rellenado», y nada obliga a comprobarlo antes de leer.
