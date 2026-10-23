import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

// Lo que GSAP crea en `animate` se revierte al desmontar; con movimiento reducido no se anima.
export function useGsapMotion(
  animate: () => void,
  scope: RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      if (!isMotionDisabled()) animate();
    },
    { scope },
  );
}
