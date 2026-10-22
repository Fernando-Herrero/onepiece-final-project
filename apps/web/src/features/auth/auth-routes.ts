import type { SessionUser } from '@/features/auth/api/session-user';

export function getAuthenticatedHomePath(user: SessionUser) {
  return user.role === 'admin' ? '/dashboard/admin' : '/dashboard/profile';
}
