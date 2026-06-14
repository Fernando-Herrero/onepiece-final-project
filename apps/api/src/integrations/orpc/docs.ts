import { contract } from '@logpose/contracts/contract';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import type { Request, Response } from 'express';

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

/** Origen público para el bloque `servers` del OpenAPI (http vs https detrás de proxy). */
function resolvePublicOrigin(req: Request): string {
  return `${req.protocol}://${req.get('host') ?? 'localhost'}/`;
}

const SWAGGER_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LogPose API</title>
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

export async function serveOpenApiSpec(req: Request, res: Response) {
  const spec = await generator.generate(contract, {
    info: {
      title: 'LogPose API',
      version: '1.0.0',
    },
    servers: [
      {
        url: resolvePublicOrigin(req),
      },
    ],
    tags: [
      { name: 'Health', description: 'Liveness checks' },
      { name: 'Auth', description: 'Login, register, session' },
      { name: 'Users', description: 'User profiles and social' },
      { name: 'Posts', description: 'Community posts' },
      { name: 'Comments', description: 'Post comments' },
      { name: 'Progress', description: 'Series progress' },
      { name: 'Cards', description: 'Collectible cards' },
      { name: 'Notifications', description: 'User notifications' },
    ],
  });

  res.json(spec);
}

export function serveSwaggerUi(_req: Request, res: Response) {
  res.set('Content-Type', 'text/html; charset=utf-8').send(SWAGGER_HTML);
}
