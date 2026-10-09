# LogPose

App para fans de One Piece: progreso de la serie, cartas coleccionables y red social.

## Language

**Character**:
Entidad estable del personaje; agrupa sus cartas.

**Card**:
Coleccionable concreto anclado a un momento de la historia (Luffy Gear 5), no el personaje genérico. Todas las categorías (`character`, `item`, `fruit`, `sword`, `boat`) son `Card`.
_Avoid_: versión (a secas), personaje

**UnlockRule**:
Regla del servidor que dice qué otorga un episodio, arco o evento.

**Berries**:
Moneda blanda del juego.

**rankingScore**:
Puntuación materializada para el leaderboard: combina nivel, colección, rareza y logros.

**Server-authoritative**:
El servidor decide y aplica las recompensas; el cliente solo informa de lo que ha hecho. Decidido, sin implementar.
