import 'server-only';
import { cache } from 'react';
import { getPublishedProducts } from '@/lib/products-server';
import {
  interpolateCounts,
  spellFrenchCount,
  type ProductCount,
} from '@/lib/format/product-count';

/**
 * Server-only : source unique du **compteur de produits** (CLAUDE.md §1.3).
 *
 * Le nombre affiché dans les titres de marque n'est plus codé en dur. Il est :
 *   1. forcé par l'admin si `SiteSettings.productCountOverride` est rempli ;
 *   2. sinon dérivé du nombre de produits publiés (`getPublishedProducts`).
 * Le mot (« huit ») suit la même logique (`productCountWordOverride` sinon
 * écriture automatique). Fail-soft : DB down → compte du fallback hard-codé.
 *
 * Mémoïsé par requête (`react.cache`) pour éviter des fetchs répétés quand
 * plusieurs sections de la même page ont besoin du compteur.
 *
 * Clean architecture : la UI consomme ce helper (ou reçoit `ProductCount`
 * en prop), jamais Payload directement. OWASP A03/A05/A09 : requêtes
 * paramétrées, aucun secret exposé, log d'erreur en dev seulement.
 */
async function readOverride(): Promise<{ count?: number; word?: string }> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const doc = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })) as {
      productCountOverride?: unknown;
      productCountWordOverride?: unknown;
    };
    const count =
      typeof doc.productCountOverride === 'number' &&
      Number.isInteger(doc.productCountOverride) &&
      doc.productCountOverride > 0
        ? doc.productCountOverride
        : undefined;
    const word =
      typeof doc.productCountWordOverride === 'string' &&
      doc.productCountWordOverride.trim().length > 0
        ? doc.productCountWordOverride.trim()
        : undefined;
    return { count, word };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[cms] fallback SiteSettings compteur — Payload indisponible:',
        (err as Error).message,
      );
    }
    return {};
  }
}

export const getProductCount = cache(async (): Promise<ProductCount> => {
  const override = await readOverride();
  const count = override.count ?? (await getPublishedProducts()).length;
  const word = override.word ?? spellFrenchCount(count);
  return { count, word };
});

/**
 * Raccourci pratique : interpole les tokens de compteur dans un texte en
 * résolvant le compteur courant. À utiliser dans les Server Components pour
 * les chaînes éditoriales contenant `{productsWord}` & co.
 */
export async function withProductCount(text: string): Promise<string> {
  return interpolateCounts(text, await getProductCount());
}
