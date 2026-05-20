'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';

interface MarqueeProps {
  /** Le contenu à dupliquer en boucle (typiquement une liste de logos). */
  children: ReactNode;
  /** Vitesse en pixels par seconde. Défaut 40 (lent, lisible). */
  speed?: number;
  /** Direction du défilement. */
  direction?: 'left' | 'right';
  /** Pause au survol — utile pour les logos cliquables. */
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * Marquee — défilement horizontal continu en boucle infinie.
 *
 * Utilisé pour les logos clients (§6.2 Reassurance) pour donner du
 * mouvement sans dépendre d'un carrousel à clic.
 *
 * Implémentation :
 *   - On duplique le contenu deux fois → quand la première copie sort
 *     à gauche, la seconde prend le relais sans saut visible.
 *   - Motion v12 anime `x` de 0 à -50%.
 *   - prefers-reduced-motion : rendu statique côte à côte, pas de motion.
 *
 * Performance : motion sur transform, donc GPU-accéléré. Pas de
 * repaint, juste composition.
 */
export function Marquee({
  children,
  speed = 40,
  direction = 'left',
  pauseOnHover = true,
  className,
}: MarqueeProps): React.ReactElement {
  const prefersReduced = useReducedMotion();

  // Si reduced motion, on rend statiquement le contenu (une seule fois).
  if (prefersReduced) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center justify-center gap-x-12 gap-y-6',
          className,
        )}
      >
        {children}
      </div>
    );
  }

  // Distance fictive — on anime à -50% (un seul des deux blocs).
  // Durée = (largeur d'un bloc en %) / vitesse. Approximation par
  // contenu : on utilise une durée fixe basée sur speed, le navigateur
  // ajustera visuellement selon la largeur réelle.
  const duration = (100 / speed) * 10; // 25s pour speed=40

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
      aria-hidden={false}
    >
      <motion.div
        className={cn(
          'flex w-max items-center gap-x-12',
          pauseOnHover && 'hover:[animation-play-state:paused]',
        )}
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {/* Contenu original */}
        <div className="flex flex-shrink-0 items-center gap-x-12">
          {children}
        </div>
        {/* Duplicate pour la boucle sans saut */}
        <div aria-hidden className="flex flex-shrink-0 items-center gap-x-12">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
