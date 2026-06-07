import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  ProductMockup,
  hasProductMockup,
} from '@/components/mockups/ProductMockup';
import { PRODUCTS } from '@/lib/data/products';

/**
 * Couvre le dispatcher ProductMockup + les 7 mockups SVG (dont les 3
 * nouveaux : NexusERP, QualitOS, Smart City).
 */
describe('ProductMockup', () => {
  it.each(PRODUCTS.map((p) => p.slug))(
    'rend un mockup SVG accessible pour « %s »',
    (slug) => {
      const { container } = render(<ProductMockup slug={slug} />);
      const svg = container.querySelector('svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('aria-label')).toBeTruthy();
    },
  );

  it('ne rend rien pour un slug libre sans mockup dédié', () => {
    expect(hasProductMockup('sentinelbtp')).toBe(false);
    const { container } = render(<ProductMockup slug="sentinelbtp" />);
    expect(container.firstChild).toBeNull();
  });
});
