import { useSyncExternalStore } from 'react';

const NAV_EXPANDED_KEY = 'logpose_nav_expanded';
const navExpandedListeners = new Set<() => void>();

function subscribeNavExpanded(onStoreChange: () => void) {
  navExpandedListeners.add(onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    navExpandedListeners.delete(onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function getNavExpandedSnapshot() {
  return localStorage.getItem(NAV_EXPANDED_KEY) === 'true';
}

function getNavExpandedServerSnapshot() {
  return false;
}

function setNavExpanded(next: boolean) {
  localStorage.setItem(NAV_EXPANDED_KEY, String(next));

  for (const listener of navExpandedListeners) {
    listener();
  }
}

export function useNavExpanded() {
  const navExpanded = useSyncExternalStore(
    subscribeNavExpanded,
    getNavExpandedSnapshot,
    getNavExpandedServerSnapshot,
  );

  return {
    navExpanded,
    toggleNavExpanded: () => setNavExpanded(!navExpanded),
  };
}
