import { authContract } from '@logpose/contracts/features/auth/contract';
import { healthContract } from '@logpose/contracts/features/health/contract';
import { serieContract } from '@logpose/contracts/features/serie/contract';
import { usersContract } from '@logpose/contracts/features/users/contract';
import { Controller, Get, Header } from '@nestjs/common';
import { oc } from '@orpc/contract';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';

const implementedContract = oc.prefix('/api').router({
  health: healthContract,
  auth: authContract,
  users: usersContract,
  serie: serieContract,
});

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

/**
 * Relative OpenAPI server so Swagger "Try it out" hits the same origin as the UI.
 *
 * In dev, `pnpm dev` serves the web on :3000 with a rewrite of `/api/*` → Nest :4000.
 * If the spec advertised `http://localhost:4000/`, the browser would call :4000 from a
 * page on :3000 and fail with "Failed to fetch" (no CORS on the API). With `/`, requests
 * go to :3000/api/... and the Next proxy forwards them — same pattern as admin.
 *
 * Direct access at http://localhost:4000/api/orpc also works: `/` resolves to :4000.
 */
const OPENAPI_SERVER = { url: '/' as const };

const SWAGGER_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LogPose API (Nest)</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  </head>
  <body>
    <div id="app"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api/orpc/spec.json',
          dom_id: '#app',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.presets.standalone,
          ],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        });
      };
    </script>
  </body>
</html>
`;

/**
 * Serves the OpenAPI reference UI and spec for implemented procedures only.
 * `@orpc/nest` registers the procedure routes but does not expose the docs.
 */
@Controller('api/orpc')
export class OrpcDocsController {
  @Get('spec.json')
  spec() {
    return generator.generate(implementedContract, {
      info: {
        title: 'LogPose API (Nest)',
        version: '1.0.0',
      },
      servers: [OPENAPI_SERVER],
      tags: [
        { name: 'Health', description: 'Liveness and readiness checks' },
        { name: 'Auth', description: 'Session, login and registration' },
        { name: 'Users', description: 'Profiles, ranking and social graph' },
        {
          name: 'Serie',
          description: 'Sagas, arcs and episodes (static data)',
        },
      ],
    });
  }

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  docs(): string {
    return SWAGGER_HTML;
  }
}
