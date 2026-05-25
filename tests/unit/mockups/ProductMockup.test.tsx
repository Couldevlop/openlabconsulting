import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductMockup } from '@/components/mockups/ProductMockup';
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
});
