import { implementedContract } from '@logpose/contracts/implemented-contract';
import { Controller, Get, Header, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';

import { Public } from '../../features/auth/public.decorator.js';
import type { ServerEnv } from '../env/server.js';

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
    <link rel="icon" href="/favicon.png" type="image/png" />
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
@Public()
export class OrpcDocsController {
  constructor(private readonly config: ConfigService<ServerEnv, true>) {}

  private assertDocsEnabled(): void {
    if (this.config.get('NODE_ENV', { infer: true }) === 'production') {
      throw new NotFoundException();
    }
  }

  @Get('spec.json')
  spec() {
    this.assertDocsEnabled();

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
    this.assertDocsEnabled();

    return SWAGGER_HTML;
  }
}
