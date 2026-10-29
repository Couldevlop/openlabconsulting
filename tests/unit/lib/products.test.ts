import { describe, it, expect } from 'vitest';
import {
  PRODUCTS,
  FALLBACK_PRODUCTS,
  getProductBySlug,
  isWithdrawnProduct,
  isWithdrawnProductHref,
  namesWithdrawnProduct,
} from '@/lib/data/products';
import { ICON_KEYS } from '@/lib/icon-map';

describe('lib/data/products', () => {
  it('expose 8 fiches publiques (AEGIS et Fraud Shield retirés du site)', () => {
    expect(PRODUCTS).toHaveLength(8);
  });

  it('chaque produit a un slug unique attendu', () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(8);
    expect(slugs.sort()).toEqual(
      [
        'agrosense',
        'nexuserp',
        'maturia',
        'nexusrh',
        'qualitos',
        'sentinelbtp',
        'smart-city',
        'sygescom',
      ].sort(),
    );
  });

  it('chaque produit a name, tagline, target, status, eyebrow, intro, problem, iconKey', () => {
    for (const p of PRODUCTS) {
      expect(p.name.length).toBeGreaterThan(3);
      expect(p.tagline.length).toBeGreaterThan(10);
      expect(p.target.length).toBeGreaterThan(3);
      expect(['production', 'pilot', 'mvp', 'dev']).toContain(p.status);
      expect(p.statusLabel.length).toBeGreaterThan(2);
      expect(p.eyebrow.length).toBeGreaterThan(3);
      expect(p.intro.length).toBeGreaterThan(50);
      expect(p.problem.length).toBeGreaterThan(30);
      // iconKey : clé string sérialisable (résolue via lib/icon-map.ts).
      expect(typeof p.iconKey).toBe('string');
      expect(ICON_KEYS).toContain(p.iconKey);
    }
  });

  it('chaque produit a entre 4 et 6 features avec title, body, iconKey', () => {
    for (const p of PRODUCTS) {
      expect(p.features.length).toBeGreaterThanOrEqual(4);
      expect(p.features.length).toBeLessThanOrEqual(6);
      for (const f of p.features) {
        expect(f.title.length).toBeGreaterThan(3);
        expect(f.body.length).toBeGreaterThan(20);
        expect(typeof f.iconKey).toBe('string');
        expect(ICON_KEYS).toContain(f.iconKey);
      }
    }
  });

  it('FALLBACK_PRODUCTS est un alias de PRODUCTS', () => {
    expect(FALLBACK_PRODUCTS).toBe(PRODUCTS);
  });

  it('chaque produit a un stack de 3 à 8 lignes', () => {
    for (const p of PRODUCTS) {
      expect(p.stack.length).toBeGreaterThanOrEqual(3);
      expect(p.stack.length).toBeLessThanOrEqual(8);
    }
  });

  it('si proofs existe, chaque proof a une source non vide (§4.10)', () => {
    for (const p of PRODUCTS) {
      if (p.proofs) {
        for (const proof of p.proofs) {
          expect(proof.value.length).toBeGreaterThan(0);
          expect(proof.label.length).toBeGreaterThan(0);
          expect(proof.source.length).toBeGreaterThan(5);
        }
      }
    }
  });

  it('chaque produit lie au moins une expertise existante', () => {
    const knownExpertises = new Set([
      'conseil-strategie',
      'agents-automatisation',
      'data-gouvernance',
      'cybersecurite-ia',
    ]);
    for (const p of PRODUCTS) {
      expect(p.expertisesLies.length).toBeGreaterThanOrEqual(1);
      for (const e of p.expertisesLies) {
        expect(knownExpertises.has(e.slug)).toBe(true);
      }
    }
  });

  it('SYGESCOM expose les preuves §7.2 (-12 % pertes, ROI < 3 mois)', () => {
    const sygescom = getProductBySlug('sygescom');
    expect(sygescom).toBeDefined();
    expect(sygescom!.proofs).toBeDefined();
    expect(sygescom!.proofs!.some((p) => p.value === '−12 %')).toBe(true);
    expect(sygescom!.proofs!.some((p) => p.value === '< 3 mois')).toBe(true);
  });

  it('getProductBySlug retrouve un produit existant', () => {
    expect(getProductBySlug('nexusrh')?.name).toBe('NexusRH CI');
    expect(getProductBySlug('smart-city')?.name).toBe('OpenLab Smart City');
  });

  it('getProductBySlug retourne undefined pour un slug inconnu', () => {
    expect(getProductBySlug('inexistant')).toBeUndefined();
  });

  it('getProductBySlug ne sert pas les produits retirés', () => {
    expect(getProductBySlug('aegis')).toBeUndefined();
    expect(getProductBySlug('fraud-shield')).toBeUndefined();
  });

  it('isWithdrawnProduct cible AEGIS et Fraud Shield seulement', () => {
    expect(isWithdrawnProduct('aegis')).toBe(true);
    expect(isWithdrawnProduct('fraud-shield')).toBe(true);
    expect(isWithdrawnProduct('nexusrh')).toBe(false);
  });

  it('isWithdrawnProductHref reconnaît les liens vers un produit retiré', () => {
    expect(isWithdrawnProductHref('/solutions/aegis')).toBe(true);
    expect(isWithdrawnProductHref('/solutions/fraud-shield/')).toBe(true);
    expect(isWithdrawnProductHref('/solutions/fraud-shield#demo')).toBe(true);
    expect(isWithdrawnProductHref('/solutions/nexusrh')).toBe(false);
    expect(isWithdrawnProductHref('/solutions')).toBe(false);
    expect(isWithdrawnProductHref('/insights/aegis')).toBe(false);
  });

  it('namesWithdrawnProduct reconnaît les libellés libres', () => {
    expect(namesWithdrawnProduct('OpenLab Fraud Shield')).toBe(true);
    expect(namesWithdrawnProduct('AEGIS')).toBe(true);
    expect(namesWithdrawnProduct('NexusRH CI')).toBe(false);
  });
});
