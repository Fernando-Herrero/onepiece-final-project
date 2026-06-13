const TOKEN_KEY = 'token';

const listeners = new Set<() => void>();

function notifyAuthTokenListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeAuthToken(listener: () => void) {
  const onStorage = () => {
    listener();
  };

  listeners.add(listener);
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthTokenListeners();
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  notifyAuthTokenListeners();
}
