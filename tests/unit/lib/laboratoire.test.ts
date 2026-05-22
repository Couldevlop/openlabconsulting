import { describe, it, expect } from 'vitest';
import {
  RD_AXES,
  PUBLICATIONS,
  PARTENARIATS,
  getAxeBySlug,
} from '@/lib/data/laboratoire';

describe('lib/data/laboratoire — RD_AXES', () => {
  it('expose 6 axes de R&D', () => {
    expect(RD_AXES).toHaveLength(6);
  });

  it('chaque axe a un slug unique, un title, un pitch et au moins 1 produit lié', () => {
    const slugs = new Set<string>();
    for (const axe of RD_AXES) {
      expect(typeof axe.slug).toBe('string');
      expect(typeof axe.title).toBe('string');
      expect(typeof axe.pitch).toBe('string');
      expect(axe.produitsLies.length).toBeGreaterThan(0);
      expect(axe.exemples.length).toBeGreaterThan(0);
      expect(slugs.has(axe.slug)).toBe(false);
      slugs.add(axe.slug);
    }
  });
});

describe('lib/data/laboratoire — PUBLICATIONS', () => {
  it('contient au moins 4 publications', () => {
    expect(PUBLICATIONS.length).toBeGreaterThanOrEqual(4);
  });

  it('chaque publication a un type valide', () => {
    const validTypes = ['livre', 'livre-blanc', 'article-pair', 'conference'];
    for (const pub of PUBLICATIONS) {
      expect(validTypes).toContain(pub.type);
      expect(pub.year).toBeGreaterThanOrEqual(2020);
      expect(pub.authors.length).toBeGreaterThan(0);
    }
  });

  it('contient au moins 1 livre publié par OpenLab', () => {
    const livres = PUBLICATIONS.filter((p) => p.type === 'livre');
    expect(livres.length).toBeGreaterThanOrEqual(1);
  });
});

describe('lib/data/laboratoire — PARTENARIATS', () => {
  it('contient au moins 5 partenaires', () => {
    expect(PARTENARIATS.length).toBeGreaterThanOrEqual(5);
  });

  it('chaque partenariat a un type valide', () => {
    const validTypes = ['universitaire', 'public', 'prive', 'ong'];
    for (const p of PARTENARIATS) {
      expect(validTypes).toContain(p.type);
      expect(typeof p.slug).toBe('string');
      expect(typeof p.title).toBe('string');
      expect(typeof p.pitch).toBe('string');
    }
  });

  it('chaque slug est unique', () => {
    const slugs = PARTENARIATS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('lib/data/laboratoire — getAxeBySlug', () => {
  it('retrouve un axe existant', () => {
    const axe = getAxeBySlug('paie-conformite-ouest-africaine');
    expect(axe).toBeDefined();
    expect(axe?.title).toMatch(/Paie/i);
  });

  it('retourne undefined pour un slug inconnu', () => {
    expect(getAxeBySlug('axe-inexistant')).toBeUndefined();
  });
});
