# oRPC valida la salida y traduce los errores del contrato en un solo sitio

Sustituye la regla de `parseOrThrow` del ADR 0001.

## Decisión

- **Salida:** la valida oRPC contra el `.output()` del contrato. Los controllers devuelven lo que da el servicio, sin `parseOrThrow`.
- **Errores:** los servicios lanzan `new ORPCError('CODIGO')`. El interceptor global `contractErrorsInterceptor` (`integrations/orpc/contract-errors.interceptor.ts`, registrado en `ORPCModule`) lo reemite con el status y el mensaje del `.errors()` del procedure si el código está en el contrato. Si no está, lo deja pasar. Los handlers no llevan `try/catch`.
- **Errores de infraestructura** (p. ej. el 11000 de Mongo): se traducen a un código del contrato en el servicio que sabe qué significan (`AuthService.register` → `DUPLICATE_ACCOUNT`).

## Por qué

- oRPC ya valida la salida (`validateOutput`). `parseOrThrow` repetía esa validación y lanzaba un `Error` sin tipo, así que no aportaba nada.
- oRPC solo marca un error como del contrato si su status coincide con el declarado, y `new ORPCError('POST_NOT_FOUND')` sale con 500. Antes eso se corregía con un `try/catch` en cada handler y una lista de códigos por feature que había que mantener a mano. Ahora el contrato es la única lista.

## Alternativas rechazadas

**Lanzar `errors.CODIGO()` desde el servicio**: el servicio dependería del tipo de cada procedure.

**Un helper por handler**: deja el `try/catch` repetido en cada procedure y hay que acordarse de ponerlo.
