import type { ReactElement } from 'react';
import { AgrosenseDemo } from './AgrosenseDemo';
import { FraudShieldDemo } from './FraudShieldDemo';
import { NexusErpDemo } from './NexusErpDemo';
import { NexusRhDemo } from './NexusRhDemo';
import { QualitOsDemo } from './QualitOsDemo';
import { SmartCityDemo } from './SmartCityDemo';
import { SygescomDemo } from './SygescomDemo';
import type { ProductSlug } from '@/lib/data/products';

/**
 * ProductDemo — router de démo selon le slug produit (§7.2).
 *
 * Server Component qui sélectionne la démo client appropriée. Chaque
 * démo est isolée dans son propre fichier 'use client' pour éviter
 * d'embarquer Motion v12, useState etc. dans les pages produits qui
 * ne l'utiliseraient pas.
 */
const DEMOS: Record<ProductSlug, () => ReactElement> = {
  nexusrh: NexusRhDemo,
  sygescom: SygescomDemo,
  agrosense: AgrosenseDemo,
  'fraud-shield': FraudShieldDemo,
  qualitos: QualitOsDemo,
  nexuserp: NexusErpDemo,
  'smart-city': SmartCityDemo,
};

export function ProductDemo({ slug }: { slug: ProductSlug }): ReactElement {
  const Demo = DEMOS[slug];
  return <Demo />;
}
