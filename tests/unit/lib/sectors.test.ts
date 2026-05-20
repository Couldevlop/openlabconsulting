import { describe, it, expect } from 'vitest';
import { SECTORS, getSectorBySlug } from '@/lib/data/sectors';

describe('lib/data/sectors', () => {
  it('expose exactement 5 secteurs (CLAUDE.md §5)', () => {
    expect(SECTORS).toHaveLength(5);
  });

  it('chaque secteur a un slug unique attendu', () => {
    const slugs = SECTORS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(5);
    expect(slugs.sort()).toEqual(
      [
        'agro-industrie',
        'banque-assurance',
        'sante',
        'secteur-public',
        'telecoms-energie',
      ].sort(),
    );
  });

  it('chaque secteur a name, tagline, intro non vides', () => {
    for (const s of SECTORS) {
      expect(s.name.length).toBeGreaterThan(3);
      expect(s.tagline.length).toBeGreaterThan(10);
      expect(s.intro.length).toBeGreaterThan(80);
      expect(typeof s.Icon).toBe('object');
    }
  });

  it('chaque secteur a entre 4 et 6 enjeux', () => {
    for (const s of SECTORS) {
      expect(s.enjeux.length).toBeGreaterThanOrEqual(4);
      expect(s.enjeux.length).toBeLessThanOrEqual(6);
    }
  });

  it('chaque secteur a entre 3 et 5 textes réglementaires', () => {
    for (const s of SECTORS) {
      expect(s.regulation.length).toBeGreaterThanOrEqual(3);
      expect(s.regulation.length).toBeLessThanOrEqual(5);
    }
  });

  it('chaque secteur lie au moins 1 produit existant', () => {
    const knownProducts = new Set([
      'nexusrh',
      'nexuserp',
      'sygescom',
      'agrosense',
      'qualitos',
      'fraud-shield',
      'smart-city',
    ]);
    for (const s of SECTORS) {
      expect(s.produitsLies.length).toBeGreaterThanOrEqual(1);
      for (const p of s.produitsLies) {
        expect(knownProducts.has(p.slug)).toBe(true);
      }
    }
  });

  it('chaque secteur lie au moins 1 expertise existante', () => {
    const knownExpertises = new Set([
      'conseil-strategie',
      'agents-automatisation',
      'data-gouvernance',
      'cybersecurite-ia',
    ]);
    for (const s of SECTORS) {
      expect(s.expertisesLies.length).toBeGreaterThanOrEqual(1);
      for (const e of s.expertisesLies) {
        expect(knownExpertises.has(e.slug)).toBe(true);
      }
    }
  });

  it('les 5 slugs sectoriels correspondent aux options du form AuditIaCta', () => {
    // Le form AuditIaCta a ses options en dur (cf. composant). On
    // vérifie ici qu'aucun slug ne dérive sans qu'on s'en aperçoive.
    const sectorSlugs = SECTORS.map((s) => s.slug);
    const formOptions = [
      'banque-assurance',
      'secteur-public',
      'agro-industrie',
      'sante',
      'telecoms-energie',
    ];
    for (const opt of formOptions) {
      expect(sectorSlugs).toContain(opt);
    }
  });

  it('getSectorBySlug retrouve / retourne undefined', () => {
    expect(getSectorBySlug('sante')?.name).toBe('Santé');
    expect(getSectorBySlug('inexistant')).toBeUndefined();
  });
});
