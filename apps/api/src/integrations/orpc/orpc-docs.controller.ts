import { Controller, Get, Header, Req } from '@nestjs/common';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import type { Request } from 'express';

import { contract } from './orpc.contract.js';

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

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
      tags: [{ name: 'Health', description: 'Liveness checks' }],
    });
  }

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  docs(): string {
    return SWAGGER_HTML;
  }
}
