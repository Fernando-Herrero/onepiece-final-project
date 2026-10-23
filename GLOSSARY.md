# Glosario

Vocabulario de LogPose. El nombre en `código` es el del contrato (`packages/contracts`); lo que aún no existe lleva «sin implementar».

## Serie

**Saga**:
Bloque mayor de la historia (East Blue, Arabasta…); agrupa arcos.

**Arco** (`Arc`):
Tramo de una saga con su rango de episodios. `isFiller` marca los de relleno.

**Episodio** (`Episode`):
Episodio del anime. Es el eje de la cronología: el progreso y los desbloqueos se anclan a episodios, no a capítulos del manga.

**Canon / relleno**:
Si un episodio adapta el manga (`canon`), no lo adapta (`filler`), mezcla ambos (`mixed`) o resume (`recap`). Hoy el contrato solo tiene `isFiller` en `Arc`; los cuatro valores están en `data/research` y llegan al contrato al normalizar esos datos.

**Progreso de la serie** (`serieProgress`):
Hasta dónde ha llegado el usuario, como `{ saga, arc, episode }`. Desbloqueará avatares (`AVATAR_PROGRESS_UNLOCK_RULES`, vacío hasta que el progreso se calcule en el servidor).

## Cartas y progresión

**Character**:
Entidad estable del personaje; agrupa sus cartas. Sin implementar.

**Card**:
Coleccionable concreto anclado a un momento de la historia (Luffy Gear 5), no el personaje genérico. Todas las categorías (`character`, `item`, `fruit`, `sword`, `boat`) son `Card`. Sin implementar.
_Evitar_: versión (a secas), personaje.

**UnlockRule**:
Regla del servidor que dice qué otorga un episodio, arco o evento. Sin implementar.

**Recompensa** (`Reward`):
Lo que otorga una `UnlockRule`: XP, berries y cartas. Sin implementar.

**XP** (`experience`):
Experiencia del usuario; ordena el ranking. Cada episodio fija la que da (`episode.experience`).

**Berries**:
Moneda blanda del juego. Sin implementar.

**Logro** (`Achievement`):
Reto con una condición (completar un arco, reunir N cartas) y su recompensa. Sin implementar.

**rankingScore**:
Puntuación materializada que ordenará el leaderboard combinando nivel, colección, rareza y logros. Sin implementar: hoy el ranking ordena por `experience`.

**Server-authoritative**:
El servidor decide y aplica las recompensas; el cliente solo informa de lo que ha hecho. Decidido, sin implementar.

## Red social

**Post**:
Texto con hasta 4 imágenes y una visibilidad. 280 caracteres, o 600 si el autor está verificado.

**Retweet**:
Post envoltorio (`isRetweet`, `retweetOf`) que copia el texto y las imágenes del original al crearse. Like, guardado y retweet actúan sobre el original. Solo se retuitea lo público.

**Guardado** (`bookmark`):
Post que el usuario marca para leer después; sale en la pestaña de guardados de su perfil.

**Borrado lógico** (`isDeleted`):
Un post borrado se marca, no se elimina, y arrastra a sus retweets. Un retweet cuyo original no aparece no se sirve.

**Verificado** (`verified`):
Usuario premium: insignia junto al nombre y posts más largos. El pago es simulado.

## Acceso

**Viewer**:
Quién hace la petición: anónimo, o usuario con su rol. Lo resuelve `SessionGuard` una vez por petición ([ADR 0004](docs/adr/0004-auth-propia-rol-simple.md)).

**Sesión** (`sessions`):
Login abierto en un navegador: un token aleatorio en la cookie y su hash en Mongo. Dura 30 días desde el último uso y se revoca al cerrar sesión o cambiar la contraseña ([ADR 0016](docs/adr/0016-sesiones-opacas-en-mongo.md)).

**Rol** (`role`):
`user` o `admin`, leído de la base de datos. El admin ve todo de todos.

**Acceso** (`access`):
Lo que un viewer ve de un perfil: `full` (su dueño o un admin) o `public` ([ADR 0006](docs/adr/0006-que-ve-cada-audiencia.md)).

**Visibilidad** (`visibility`):
Quién ve un post: `public` (todos), `followers` (quien sigue al dueño) o `private` (nadie más). El dueño y el admin lo ven siempre.

**Privacidad** (`privacy`):
Qué pestañas del perfil (posts, likes, guardados, comentarios) y sus contadores ven los demás.

## Choques de nombre

**Card v1 / v2**:
v1 es el catálogo antiguo: una entrada por personaje con arrays paralelos (`type[]`, `bounty[]`) y `unlockedCards` como cinco listas de ids. v2 es `Card`, una por versión. No confundir con la app anterior, también llamada v2 (este monorepo es v3).
_Evitar_: v2 a secas.

**`experience` / XP**:
Lo mismo. En el código, `experience`; en la interfaz y en los docs, XP.

**`rewards` / `Reward`**:
`episode.rewards` son solo las cartas que da un episodio, por categoría; la XP va aparte en `experience`. `Reward` (XP, berries y cartas) llega con `UnlockRule`. «Logro» queda para `Achievement`.
