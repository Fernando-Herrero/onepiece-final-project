import type { sessionUserSchema } from '@logpose/contracts/common/user.schemas';
import type * as z from 'zod/v4';

type AuthUser = z.infer<typeof sessionUserSchema>;

export function getAuthenticatedHomePath(user: AuthUser) {
  return user.role === 'admin' ? '/dashboard/admin' : '/dashboard/profile';
}
