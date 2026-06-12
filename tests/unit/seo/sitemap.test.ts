import { describe, it, expect, beforeAll } from 'vitest';
import type { MetadataRoute } from 'next';
import sitemap from '@/app/sitemap';
import { EXPERTISES } from '@/lib/data/expertises';
import { PRODUCTS } from '@/lib/data/products';
import { SECTORS } from '@/lib/data/sectors';

describe('app/sitemap', () => {
  // Sitemap est async (fetch articles + catégories Payload) — on
  // resolve une fois avant les assertions.
  let entries: MetadataRoute.Sitemap = [];

  beforeAll(async () => {
    entries = await sitemap();
  });

  it('inclut au moins 30 URLs (statiques + dynamiques + articles)', () => {
    expect(entries.length).toBeGreaterThanOrEqual(30);
  });

  it('chaque URL est absolue et utilise le domaine openlabconsulting', () => {
    for (const e of entries) {
      expect(e.url).toMatch(/^https?:\/\//);
      expect(e.url).toContain('openlabconsulting.com');
    }
  });

  it('inclut la home avec priorité 1.0', () => {
    const home = entries.find((e) => e.url.endsWith('openlabconsulting.com/'));
    expect(home).toBeDefined();
    expect(home?.priority).toBe(1.0);
  });

  it('inclut les 4 pages détail /expertises/<slug>', () => {
    for (const e of EXPERTISES) {
      expect(
        entries.find((entry) => entry.url.endsWith(`/expertises/${e.slug}`)),
      ).toBeDefined();
    }
  });

  it('inclut les 8 pages détail /solutions/<slug>', () => {
    for (const p of PRODUCTS) {
      expect(
        entries.find((entry) => entry.url.endsWith(`/solutions/${p.slug}`)),
      ).toBeDefined();
    }
  });

  it('inclut les 5 pages détail /secteurs/<slug>', () => {
    for (const s of SECTORS) {
      expect(
        entries.find((entry) => entry.url.endsWith(`/secteurs/${s.slug}`)),
      ).toBeDefined();
    }
  });

  it('inclut les 4 sous-pages /livre/*', () => {
    for (const sub of ['chapitres', 'extraits', 'acheter', 'companion']) {
      expect(
        entries.find((entry) => entry.url.endsWith(`/livre/${sub}`)),
      ).toBeDefined();
    }
  });

  it('inclut les 3 sous-pages /laboratoire/*', () => {
    for (const sub of ['axes', 'publications', 'partenariats']) {
      expect(
        entries.find((entry) => entry.url.endsWith(`/laboratoire/${sub}`)),
      ).toBeDefined();
    }
  });

  it('inclut les 7 archives /insights/categorie/<cat>', () => {
    for (const cat of [
      'souverainete',
      'conformite-rh',
      'cybersecurite',
      'data-gouvernance',
      'agents-ia',
      'mlops',
      'etude-de-cas',
    ]) {
      expect(
        entries.find((entry) =>
          entry.url.endsWith(`/insights/categorie/${cat}`),
        ),
      ).toBeDefined();
    }
  });

  it('inclut les articles publiés (au moins le fallback)', () => {
    const articleEntries = entries.filter(
      (e) =>
        e.url.includes('/insights/') &&
        !e.url.includes('/insights/categorie/') &&
        !e.url.endsWith('/insights'),
    );
    expect(articleEntries.length).toBeGreaterThanOrEqual(3);
  });
});
