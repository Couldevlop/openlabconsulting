import type { ReactElement } from 'react';
import { Solutions } from './Solutions';
import { getPublishedProducts } from '@/lib/products-server';

/**
 * SolutionsServer — wrapper Server Component qui interroge la collection
 * Payload `products` et passe le résultat au showcase `Solutions` de la
 * homepage (§6.6).
 *
 * Si Payload n'est pas disponible (build statique, dev sans docker, DB
 * down) ou que la collection est vide, le helper retombe automatiquement
 * sur le fallback hard-codé (`PRODUCTS`) — le showcase reste fonctionnel.
 *
 * À utiliser directement dans `app/(site)/page.tsx` :
 *
 *   <SolutionsServer />
 *
 * Pas de prop : tout est résolu côté server. Aligné sur
 * `CasesCarouselServer`.
 */
export async function SolutionsServer(): Promise<ReactElement> {
  const products = await getPublishedProducts();
  return <Solutions products={products} />;
}
