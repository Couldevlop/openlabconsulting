'use client';

import dynamic from 'next/dynamic';
import type { ReactElement } from 'react';

/**
 * Wrapper client qui charge le canvas WebGL en dynamique (ssr:false),
 * pour deux raisons :
 *
 * 1. Garder First Load JS < 150 kB (CLAUDE.md §2.3) — three + R3F font
 *    ~150 kB minifiés, on les pousse dans un chunk séparé chargé après
 *    hydratation.
 * 2. Three.js touche window/document — il ne peut pas s'exécuter côté
 *    serveur sans erreur.
 *
 * `loading: () => null` évite tout flash de fallback : le dégradé du
 * Hero reste seul visible jusqu'au montage du canvas.
 */
const HeroCanvas = dynamic(
  () => import('./HeroCanvas').then((m) => ({ default: m.HeroCanvas })),
  { ssr: false, loading: () => null },
);

export function HeroBackground(): ReactElement {
  return <HeroCanvas />;
}
