import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  ProductMockup,
  hasProductMockup,
} from '@/components/mockups/ProductMockup';
import { PRODUCTS } from '@/lib/data/products';

/**
 * Couvre le dispatcher ProductMockup + les mockups SVG dédiés. Les produits
 * disposant d'une capture réelle (ex. SentinelBTP) n'ont pas de mockup SVG :
 * le dispatcher retombe alors sur `null` (cf. SOLUTION_SCREENSHOTS).
 */
describe('ProductMockup', () => {
  it.each(PRODUCTS.filter((p) => hasProductMockup(p.slug)).map((p) => p.slug))(
    'rend un mockup SVG accessible pour « %s »',
    (slug) => {
      const { container } = render(<ProductMockup slug={slug} />);
      const svg = container.querySelector('svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('aria-label')).toBeTruthy();
    },
  );

  it('ne rend rien pour un slug sans mockup dédié', () => {
    expect(hasProductMockup('produit-sans-mockup')).toBe(false);
    const { container } = render(<ProductMockup slug="produit-sans-mockup" />);
    expect(container.firstChild).toBeNull();
  });
});
