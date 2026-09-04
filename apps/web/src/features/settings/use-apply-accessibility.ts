import { useEffect } from 'react';

import { useAuthSession } from '@/features/auth/api/use-auth';

/**
 * Refleja las preferencias de accesibilidad en `<html>` como data-attributes,
 * que es lo que leen las reglas de `globals.css` y `isMotionDisabled()`.
 * Se monta una sola vez, en el layout del dashboard.
 */
export function useApplyAccessibilityPreferences() {
  const { user } = useAuthSession();
  const accessibility = user?.preferences.accessibility;

  useEffect(() => {
    const root = document.documentElement;

    if (!accessibility) {
      delete root.dataset.fontScale;
      delete root.dataset.highContrast;
      delete root.dataset.reduceMotion;
      return;
    }

    root.dataset.fontScale = accessibility.fontScale;
    root.dataset.highContrast = String(accessibility.highContrast);
    root.dataset.reduceMotion = String(accessibility.reduceMotion);
  }, [
    accessibility,
    accessibility?.fontScale,
    accessibility?.highContrast,
    accessibility?.reduceMotion,
  ]);
}
