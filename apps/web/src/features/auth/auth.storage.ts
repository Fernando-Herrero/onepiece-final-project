export { SESSION_COOKIE_NAME } from '@logpose/contracts/features/auth/constants';

export function clearLegacyAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
}
