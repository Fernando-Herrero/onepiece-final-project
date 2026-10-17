import { oc } from '@orpc/contract';
import * as z from 'zod/v4';

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
