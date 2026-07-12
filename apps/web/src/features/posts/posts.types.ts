import type { postPublicSchema } from '@logpose/contracts/common/post.schemas';
import type * as z from 'zod/v4';

export type PostPublic = z.infer<typeof postPublicSchema>;
