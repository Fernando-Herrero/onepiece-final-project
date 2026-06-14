export function isMotionDisabled(): boolean {
  return window.matchMedia(
    '(prefers-reduced-motion: reduce), (max-width: 767px), (pointer: coarse)',
  ).matches;
}
