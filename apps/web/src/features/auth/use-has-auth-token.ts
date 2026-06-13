import { useSyncExternalStore } from 'react';

import { getAuthToken, subscribeAuthToken } from '@/features/auth/auth.storage';

export function useHasAuthToken() {
  return useSyncExternalStore(
    subscribeAuthToken,
    () => Boolean(getAuthToken()),
    () => false,
  );
}
