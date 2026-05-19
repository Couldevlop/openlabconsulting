import type { ReactElement } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

interface LogoProps {
  /** Hauteur visuelle souhaitée. `sm` = 24 px, `md` = 36 px (défaut), `lg` = 48 px. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-6 w-auto',
  md: 'h-9 w-auto',
  lg: 'h-12 w-auto',
} as const;

/**
 * Logo OpenLab — wrapper sur l'asset `/public/OPENLAB.png` (612×408).
 *
 * Pour les variantes dark/light/mark exigées §3.4, prévoir d'ajouter
 * `OPENLAB-dark.png` et `OPENLAB-mark.svg` dans `/public/` et de
 * sélectionner via prop ou media query — pour P2 on utilise l'unique
 * asset fourni.
 */
export function Logo({ size = 'md', className }: LogoProps): ReactElement {
  return (
    <Image
      src="/OPENLAB.png"
      alt="OpenLab Consulting"
      width={612}
      height={408}
      priority
      className={cn(sizeMap[size], 'object-contain', className)}
    />
  );
}
