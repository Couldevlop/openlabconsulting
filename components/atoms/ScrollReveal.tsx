'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';

interface ScrollRevealProps {
  children: ReactNode;
  /** Délai en secondes avant l'apparition (utile pour stagger). */
  delay?: number;
  /** Direction d'entrée. `up` (par défaut) = monte de 24px et fade-in. */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  /** Distance en pixels du déplacement initial. */
  distance?: number;
  /** Active pour rejouer chaque fois que l'élément entre dans le viewport.
   *  Par défaut on joue UNE fois (preuve d'animation, pas de motif rebattu). */
  replay?: boolean;
  className?: string;
}

const offsets = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  fade: { x: 0, y: 0 },
} as const;

/**
 * ScrollReveal — wrapper Motion qui fait entrer un bloc dans le viewport
 * avec un fade + slide subtil.
 *
 * Respecte automatiquement `prefers-reduced-motion` (CLAUDE.md §4.7) :
 * si l'utilisateur a désactivé les animations, le contenu apparaît sans
 * mouvement.
 *
 * Durées alignées sur §4.6 :
 *   - 400 ms pour les apparitions de section
 *   - cubic-bezier(0.22, 1, 0.36, 1) ≈ ease "soft out"
 */
export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance,
  replay = false,
  className,
}: ScrollRevealProps): React.ReactElement {
  const prefersReduced = useReducedMotion();
  const offset = offsets[direction];
  const finalDistance = distance ?? 24;
  const dx = (offset.x / 24) * finalDistance;
  const dy = (offset.y / 24) * finalDistance;

  if (prefersReduced) {
    // Pas d'animation — on rend simplement le contenu, ce qui évite tout
    // FOUC ou délai sur les machines configurées en reduced-motion.
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, x: dx, y: dy }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: !replay, amount: 0.25, margin: '0px 0px -10% 0px' }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
