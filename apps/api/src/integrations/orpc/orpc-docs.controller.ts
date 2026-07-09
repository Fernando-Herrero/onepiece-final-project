import { Controller, Get, Header, Req } from '@nestjs/common';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import type { Request } from 'express';

import { contract } from './orpc.contract.js';

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

/**
 * Public origin (`https://host/`) for the OpenAPI `servers` entry. Because this
 * is a regular Nest controller, `req.protocol` honours the reverse proxy's
 * `X-Forwarded-Proto` (via `trust proxy`), so the spec advertises https in
 * production — unlike oRPC's node adapter, which only inspects the raw socket.
 */
function resolvePublicOrigin(req: Request): string {
  return `${req.protocol}://${req.get('host') ?? 'localhost'}/`;
}

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
 * Serves the OpenAPI reference UI and spec for the contract. `@orpc/nest`
 * registers the procedure routes but does not expose the docs, so we generate
 * the spec straight from the contract here.
 */
@Controller('api/orpc')
export class OrpcDocsController {
  @Get('spec.json')
  spec(@Req() req: Request) {
    return generator.generate(contract, {
      info: {
        title: 'LogPose API (Nest)',
        version: '1.0.0',
      },
      servers: [{ url: resolvePublicOrigin(req) }],
      tags: [
        { name: 'Health', description: 'Liveness and readiness checks' },
        { name: 'Auth', description: 'Session, login and registration' },
        { name: 'Users', description: 'Profiles, ranking and social graph' },
      ],
    });
  }

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  docs(): string {
    return SWAGGER_HTML;
  }
}
