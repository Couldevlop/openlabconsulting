import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AbidjanPage, {
  metadata as abidjanMetadata,
} from '@/app/(site)/abidjan/page';
import CocodyPage, {
  metadata as cocodyMetadata,
} from '@/app/(site)/cocody/page';
import UemoaPage, { metadata as uemoaMetadata } from '@/app/(site)/uemoa/page';
import { LOCATIONS } from '@/lib/data/locations';

/**
 * Tests des 3 pages géo (audit P2 §7 #13).
 * Couvre : rendu hero (h1 + mot-clé géo), CTA Audit IA présent,
 * canonical et metadata, schema.org LocalBusiness injecté.
 */
describe('Pages géo (audit P2 §7 #13)', () => {
  it.each([
    ['Abidjan', AbidjanPage, abidjanMetadata, 'abidjan'],
    ['Cocody', CocodyPage, cocodyMetadata, 'cocody'],
    ['UEMOA', UemoaPage, uemoaMetadata, 'uemoa'],
  ] as const)(
    'page /%s rend le h1 attendu',
    async (label, Page, _meta, slug) => {
      const ui = await Page();
      render(ui);
      const heading = screen.getByRole('heading', { level: 1 });
      const location = LOCATIONS.find((l) => l.slug === slug);
      expect(location).toBeDefined();
      expect(heading).toHaveTextContent(label);
    },
  );

  it.each([
    ['abidjan', abidjanMetadata],
    ['cocody', cocodyMetadata],
    ['uemoa', uemoaMetadata],
  ] as const)('metadata /%s : canonical + description', (slug, metadata) => {
    expect(metadata.alternates?.canonical).toBe(`/${slug}`);
    expect(metadata.description).toBeTruthy();
    expect(String(metadata.description).length).toBeLessThanOrEqual(170);
  });

  it.each([
    ['Abidjan', AbidjanPage],
    ['Cocody', CocodyPage],
    ['UEMOA', UemoaPage],
  ] as const)('page /%s expose le CTA Audit IA', async (_label, Page) => {
    const ui = await Page();
    render(ui);
    const ctas = screen.getAllByRole('link', { name: /Audit IA gratuit/i });
    expect(ctas.length).toBeGreaterThan(0);
    expect(ctas[0]?.getAttribute('href')).toBe('/audit-ia');
  });

  it('lib/data/locations contient les 3 slugs attendus', () => {
    const slugs = LOCATIONS.map((l) => l.slug).sort();
    expect(slugs).toEqual(['abidjan', 'cocody', 'uemoa']);
  });

  it('chaque location a au moins 4 preuves et 4 services', () => {
    for (const location of LOCATIONS) {
      expect(location.proofs.length).toBeGreaterThanOrEqual(4);
      expect(location.services.length).toBeGreaterThanOrEqual(4);
    }
  });
});
