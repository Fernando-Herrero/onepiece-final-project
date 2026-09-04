export function isMotionDisabled(): boolean {
  // Preferencia explícita del usuario (ajustes › accesibilidad), escrita en
  // <html data-reduce-motion> por `useApplyAccessibilityPreferences`.
  if (document.documentElement.dataset.reduceMotion === 'true') {
    return true;
  }

  return window.matchMedia(
    '(prefers-reduced-motion: reduce), (max-width: 767px), (pointer: coarse)',
  ).matches;
}
