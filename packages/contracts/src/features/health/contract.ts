import { oc } from '@orpc/contract';
import { z } from 'zod';

export const healthOutputSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
});

export const healthContract = oc
  .tag('Health')
  .prefix('/health')
  .router({
    check: oc
      .route({
        method: 'GET',
        path: '/',
        description: 'Health check',
      })
      .output(healthOutputSchema),
  });
