import { gsap } from 'gsap';
import { type MouseEvent as ReactMouseEvent, useRef } from 'react';

import { isMotionDisabled } from '@/features/landing/motion/landing-motion';

export function useTilt(max = 7) {
  const reducedRef = useRef<boolean | null>(null);

  const isReduced = () => {
    if (reducedRef.current === null) {
      reducedRef.current = isMotionDisabled();
    }
    return reducedRef.current;
  };

  const onMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (isReduced()) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateX: -py * max,
      rotateY: px * max,
      y: -6,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 800,
      transformOrigin: 'center',
    });
  };

  const onMouseLeave = (event: ReactMouseEvent<HTMLElement>) => {
    gsap.to(event.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
    });
  };

  return { onMouseMove, onMouseLeave };
}
