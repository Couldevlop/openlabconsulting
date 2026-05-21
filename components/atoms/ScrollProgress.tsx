'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * ScrollProgress — barre orange fine (2 px) en haut de page qui suit la
 * progression de lecture verticale. Améliore le sentiment de contrôle
 * et indique « combien de page il reste à lire ».
 *
 * - Position : fixed top-0, z-50, au-dessus de la navbar
 * - Respecte `prefers-reduced-motion` (barre statique 0 → 100 % du
 *   scroll en saut au lieu d'animation continue)
 * - Couleur : orange OpenLab avec léger glow
 * - Non-bloquant pour les clicks (pointer-events: none)
 */
export function ScrollProgress(): ReactElement {
  const [progress, setProgress] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    function update(): void {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct =
        docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0;
      setProgress(pct);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <motion.div
      aria-hidden
      data-testid="scroll-progress"
      role="presentation"
      className="pointer-events-none fixed top-0 left-0 z-[60] h-[2px] w-full origin-left"
      style={{
        background:
          'linear-gradient(90deg, var(--color-ol-orange) 0%, var(--color-ol-orange-light) 50%, var(--color-ol-orange) 100%)',
        boxShadow: '0 0 8px rgba(255, 90, 0, 0.45)',
        transformOrigin: 'left',
      }}
      animate={{ scaleX: progress / 100 }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : { type: 'tween', duration: 0.1, ease: 'linear' }
      }
    />
  );
}
