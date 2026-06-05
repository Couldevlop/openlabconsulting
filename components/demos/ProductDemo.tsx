import type { ReactElement } from 'react';
import { AgrosenseDemo } from './AgrosenseDemo';
import { FraudShieldDemo } from './FraudShieldDemo';
import { NexusErpDemo } from './NexusErpDemo';
import { NexusRhDemo } from './NexusRhDemo';
import { QualitOsDemo } from './QualitOsDemo';
import { SmartCityDemo } from './SmartCityDemo';
import { SygescomDemo } from './SygescomDemo';

/**
 * ProductDemo — router de démo selon le slug produit (§7.2).
 *
 * Server Component qui sélectionne la démo client appropriée. Chaque
 * démo est isolée dans son propre fichier 'use client' pour éviter
 * d'embarquer Motion v12, useState etc. dans les pages produits qui
 * ne l'utiliseraient pas.
 *
 * Le slug produit est libre (créable depuis l'admin) : un slug sans
 * démo enregistrée ici est valide — la page masque alors la section
 * démo via `hasProductDemo` au lieu de planter au rendu.
 */
const DEMOS: Partial<Record<string, () => ReactElement>> = {
  nexusrh: NexusRhDemo,
  sygescom: SygescomDemo,
  agrosense: AgrosenseDemo,
  'fraud-shield': FraudShieldDemo,
  qualitos: QualitOsDemo,
  nexuserp: NexusErpDemo,
  'smart-city': SmartCityDemo,
};

/** Indique si une démo interactive existe pour ce slug produit. */
export function hasProductDemo(slug: string): boolean {
  return slug in DEMOS;
}

export function ProductDemo({ slug }: { slug: string }): ReactElement | null {
  const Demo = DEMOS[slug];
  if (!Demo) return null;
  return <Demo />;
}
