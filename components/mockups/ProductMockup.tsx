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
 * Chaque produit dispose désormais d'un dashboard SVG dédié (ni stock
 * photo, ni image AI — une signature visuelle propre). Réutilisé par le
 * hero /solutions/[slug] et le carrousel cas clients (homepage §6.5).
 */
const MOCKUPS: Record<ProductSlug, () => ReactElement> = {
  nexusrh: NexusRhMockup,
  nexuserp: NexusErpMockup,
  sygescom: SygescomMockup,
  agrosense: AgrosenseMockup,
  qualitos: QualitOsMockup,
  'fraud-shield': FraudShieldMockup,
  'smart-city': SmartCityMockup,
};

export function ProductMockup({ slug }: { slug: ProductSlug }): ReactElement {
  const Component = MOCKUPS[slug];
  return <Component />;
}
