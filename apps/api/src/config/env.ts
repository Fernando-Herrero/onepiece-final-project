// Versión anterior (referencia — no se usa; ver integrations/env/server.ts).
//
// import 'dotenv/config';
//
// const required = ['MONGODB_URI', 'JWT_SECRET'] as const;
//
// for (const key of required) {
//   if (!process.env[key]) {
//     throw new Error(`Missing required env var: ${key}`);
//   }
// }
//
// export const env = {
//   port: Number(process.env.PORT) || 4000,
//   mongodbUri: process.env.MONGODB_URI!,
//   jwtSecret: process.env.JWT_SECRET!,
// };
//
// ─── Por qué integrations/env/server.ts es mejor ───
//
// - Validación con Zod (mismo stack que contracts): schema declarativo en lugar de un loop manual.
// - Tipado explícito (ServerEnv) sin non-null assertions (!).
// - validateEnv() testeable: puedes pasar un objeto mock sin tocar process.env.
// - Errores agrupados: Zod indica todas las variables inválidas en un solo parse.
// - Ubicación alineada con admin (integrations/env/server.ts): env de servidor separado de config/db.
//
// El objeto exportado sigue siendo camelCase (env.port, env.mongodbUri, env.jwtSecret)
// para no cambiar el resto de la API.
