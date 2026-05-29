import { describe, it, expect } from 'vitest';
import {
  EXPERTISES,
  FALLBACK_EXPERTISES,
  getExpertiseBySlug,
} from '@/lib/data/expertises';
import { isIconKey } from '@/lib/icon-map';

describe('lib/data/expertises', () => {
  it('expose exactement 4 expertises (CLAUDE.md §5)', () => {
    expect(EXPERTISES).toHaveLength(4);
  });

  it('chaque expertise a un slug unique attendu', () => {
    const slugs = EXPERTISES.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(4);
    expect(slugs.sort()).toEqual(
      [
        'agents-automatisation',
        'conseil-strategie',
        'cybersecurite-ia',
        'data-gouvernance',
      ].sort(),
    );
  });

  it('chaque expertise a un title, punchline, intro, iconKey', () => {
    for (const e of EXPERTISES) {
      expect(e.title.length).toBeGreaterThan(3);
      expect(e.punchline.length).toBeGreaterThan(10);
      expect(e.intro.length).toBeGreaterThan(50);
      // iconKey sérialisable (string), résolu au rendu via DynamicIcon.
      expect(typeof e.iconKey).toBe('string');
      expect(e.iconKey.length).toBeGreaterThan(0);
    }
  });

  it('chaque iconKey est une clé du registre ICON_MAP', () => {
    for (const e of EXPERTISES) {
      expect(isIconKey(e.iconKey)).toBe(true);
    }
  });

  it('chaque expertise a entre 4 et 6 compétences', () => {
    for (const e of EXPERTISES) {
      expect(e.competences.length).toBeGreaterThanOrEqual(4);
      expect(e.competences.length).toBeLessThanOrEqual(6);
    }
  });

  it('chaque expertise a exactement 3 étapes d’approche (numérotées 01/02/03)', () => {
    for (const e of EXPERTISES) {
      expect(e.approche).toHaveLength(3);
      expect(e.approche.map((a) => a.step)).toEqual(['01', '02', '03']);
    }
  });

  it('chaque expertise lie au moins un produit OpenLab existant', () => {
    const knownProducts = new Set([
      'nexusrh',
      'nexuserp',
      'sygescom',
      'agrosense',
      'qualitos',
      'fraud-shield',
      'smart-city',
    ]);
    for (const e of EXPERTISES) {
      expect(e.produitsLies.length).toBeGreaterThanOrEqual(1);
      for (const p of e.produitsLies) {
        expect(knownProducts.has(p.slug)).toBe(true);
      }
    }
  });

  it('getExpertiseBySlug retrouve une expertise existante', () => {
    expect(getExpertiseBySlug('conseil-strategie')?.title).toBe(
      'Conseil & stratégie IA',
    );
    expect(getExpertiseBySlug('cybersecurite-ia')?.title).toBe(
      'Cybersécurité augmentée',
    );
  });

  it('getExpertiseBySlug retourne undefined pour un slug inconnu', () => {
    expect(getExpertiseBySlug('inexistante')).toBeUndefined();
    expect(getExpertiseBySlug('')).toBeUndefined();
  });

  it('FALLBACK_EXPERTISES est un alias de EXPERTISES', () => {
    expect(FALLBACK_EXPERTISES).toBe(EXPERTISES);
  });
});
