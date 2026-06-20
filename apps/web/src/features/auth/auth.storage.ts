export const SESSION_COOKIE_NAME = 'logpose_session';

export function clearLegacyAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
}
