import { useEffect } from 'react';

import type { SessionUser } from '@/features/auth/api/session-user';
import { useAuthSession } from '@/features/auth/api/use-auth';

type AccessibilityPreferences = SessionUser['preferences']['accessibility'];

/** Copia en el dispositivo que el script de `_document` aplica antes del primer pintado. */
export const ACCESSIBILITY_STORAGE_KEY = 'logpose:accessibility';

/**
 * Escribe las preferencias en `<html>` como data-attributes (los leen
 * `globals.css` e `isMotionDisabled()`) y en la copia local; con `null` borra las dos.
 */
export function applyAccessibilityPreferences(
  accessibility: AccessibilityPreferences | null,
) {
  const root = document.documentElement;

  if (!accessibility) {
    delete root.dataset.fontScale;
    delete root.dataset.highContrast;
    delete root.dataset.reduceMotion;
    localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    return;
  }

  root.dataset.fontScale = accessibility.fontScale;
  root.dataset.highContrast = String(accessibility.highContrast);
  root.dataset.reduceMotion = String(accessibility.reduceMotion);
  localStorage.setItem(
    ACCESSIBILITY_STORAGE_KEY,
    JSON.stringify(accessibility),
  );
}

/**
 * Se monta una vez, en `NoSSRProviders`. Solo escribe con usuario: fuera del
 * dashboard `me` no se pide y la copia local manda; el logout la borra.
 */
export function useApplyAccessibilityPreferences() {
  const { user } = useAuthSession();
  const accessibility = user?.preferences.accessibility;

  useEffect(() => {
    if (accessibility) applyAccessibilityPreferences(accessibility);
  }, [accessibility]);
}
