import { describe, it, expect } from 'vitest';
import { getPublishedProducts, getProductBySlug } from '@/lib/products-server';
import { FALLBACK_PRODUCTS } from '@/lib/data/products';

/**
 * Tests `lib/products-server` — le chemin "Payload OK + parsing" n'est pas
 * testable ici car l'alias Vite `@payload-config` throw avant que
 * `vi.doMock('payload')` ne puisse intervenir (couvert dans
 * products-server-success.test.ts qui mock statiquement les deux modules).
 *
 * On vérifie le fallback complet (Payload indisponible en environnement
 * test) sans régression.
 */
describe('lib/products-server — fallback en environnement test', () => {
  it('retombe sur FALLBACK_PRODUCTS quand Payload est indisponible', async () => {
    const products = await getPublishedProducts();
    expect(products).toEqual(FALLBACK_PRODUCTS);
  });

  it('retourne les 8 produits avec un iconKey valide (string)', async () => {
    const products = await getPublishedProducts();
    expect(products).toHaveLength(8);
    for (const p of products) {
      expect(typeof p.iconKey).toBe('string');
      expect(p.iconKey.length).toBeGreaterThan(0);
    }
  });

  it('getProductBySlug renvoie le produit du fallback', async () => {
    const product = await getProductBySlug('nexusrh');
    expect(product).not.toBeNull();
    expect(product?.name).toBe('NexusRH CI');
  });

  it('getProductBySlug renvoie null pour un slug inconnu', async () => {
    const product = await getProductBySlug('inexistant');
    expect(product).toBeNull();
  });
});
