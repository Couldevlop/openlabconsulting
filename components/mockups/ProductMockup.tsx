import type { ReactElement } from 'react';
import { AgrosenseMockup } from './AgrosenseMockup';
import { FraudShieldMockup } from './FraudShieldMockup';
import { NexusErpMockup } from './NexusErpMockup';
import { NexusRhMockup } from './NexusRhMockup';
import { QualitOsMockup } from './QualitOsMockup';
import { SmartCityMockup } from './SmartCityMockup';
import { SygescomMockup } from './SygescomMockup';
import type { ProductSlug } from '@/lib/data/products';

/**
 * ProductMockup — router de mockup SVG selon le slug produit (§7.1 hero).
 *
 * Chaque produit fondateur dispose d'un dashboard SVG dédié (ni stock
 * photo, ni image AI — une signature visuelle propre). Réutilisé par le
 * hero /solutions/[slug] et le carrousel cas clients (homepage §6.5).
 *
 * Le slug produit est désormais libre (un produit peut être créé depuis
 * l'admin sans déploiement, cf. `lib/products-server.ts`). Pour un slug
 * sans mockup dédié, le composant rend `null` : l'appelant retombe alors
 * sur une capture réelle ou un `MediaPlaceholder`.
 */
const MOCKUPS: Partial<Record<ProductSlug, () => ReactElement>> = {
  nexusrh: NexusRhMockup,
  nexuserp: NexusErpMockup,
  sygescom: SygescomMockup,
  agrosense: AgrosenseMockup,
  qualitos: QualitOsMockup,
  'fraud-shield': FraudShieldMockup,
  'smart-city': SmartCityMockup,
  // SentinelBTP s'appuie sur une capture réelle (SOLUTION_SCREENSHOTS) :
  // pas de mockup SVG dédié → ProductMockup retombe sur null.
};

/** Vrai si un mockup SVG dédié existe pour ce slug (slug libre toléré). */
export function hasProductMockup(slug: string): slug is ProductSlug {
  return Object.prototype.hasOwnProperty.call(MOCKUPS, slug);
}

export function ProductMockup({ slug }: { slug: string }): ReactElement | null {
  const Component = hasProductMockup(slug) ? MOCKUPS[slug] : undefined;
  if (!Component) return null;
  return <Component />;
}
