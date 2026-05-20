import type { ReactElement } from 'react';
import { CasesCarousel } from './CasesCarousel';
import { getPublishedCaseStudies } from '@/lib/case-studies-server';

/**
 * CasesCarouselServer — wrapper Server Component qui interroge la
 * collection Payload `caseStudies` et passe le résultat au
 * `CasesCarousel` client-side.
 *
 * Si Payload n'est pas disponible (build statique, dev sans docker,
 * DB down), le helper retombe automatiquement sur le fallback
 * hard-codé — le carrousel reste fonctionnel.
 *
 * À utiliser directement dans `app/page.tsx` :
 *
 *   <CasesCarouselServer />
 *
 * Pas de prop : tout est résolu côté server.
 */
export async function CasesCarouselServer(): Promise<ReactElement> {
  const slides = await getPublishedCaseStudies();
  return <CasesCarousel slides={slides} />;
}
