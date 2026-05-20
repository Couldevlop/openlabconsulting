import { describe, it, expect } from 'vitest';
import { calculerPaie, formatFcfa } from '@/lib/demos/nexusrh-paie';

describe('lib/demos/nexusrh-paie — calculerPaie', () => {
  it('calcule un net cohérent pour un CDI à 450 000 F CFA brut', () => {
    const r = calculerPaie({ brut: 450_000, statut: 'cdi' });
    expect(r.brut).toBe(450_000);
    // CNPS salarié 6,3 % de 450k = 28 350
    expect(r.cnpsSalarie).toBe(28_350);
    // FDFP salarié 1,2 % de 450k = 5 400
    expect(r.fdfpSalarie).toBe(5_400);
    // Net doit être positif et < brut
    expect(r.net).toBeGreaterThan(0);
    expect(r.net).toBeLessThan(r.brut);
    // Coût employeur > brut (charges patronales)
    expect(r.coutEmployeur).toBeGreaterThan(r.brut);
  });

  it('exonère les apprentis de l’ITS', () => {
    const r = calculerPaie({ brut: 200_000, statut: 'apprenti' });
    expect(r.its).toBe(0);
    expect(r.trancheIts).toHaveLength(0);
  });

  it('exonère les stagiaires de l’ITS', () => {
    const r = calculerPaie({ brut: 300_000, statut: 'stagiaire' });
    expect(r.its).toBe(0);
  });

  it('applique l’abattement enfants à charge sur l’ITS', () => {
    const sans = calculerPaie({
      brut: 600_000,
      statut: 'cdi',
      enfantsCharge: 0,
    });
    const avec = calculerPaie({
      brut: 600_000,
      statut: 'cdi',
      enfantsCharge: 3,
    });
    expect(avec.its).toBeLessThan(sans.its);
  });

  it('plafonne l’abattement enfants à 50 %', () => {
    const max = calculerPaie({
      brut: 600_000,
      statut: 'cdi',
      enfantsCharge: 10,
    });
    const six = calculerPaie({
      brut: 600_000,
      statut: 'cdi',
      enfantsCharge: 5,
    });
    expect(max.its).toBe(six.its);
  });

  it('respecte les tranches ITS progressives', () => {
    const r = calculerPaie({ brut: 1_500_000, statut: 'cdi' });
    // Au moins 3 tranches doivent être touchées sur ce niveau de salaire.
    expect(r.trancheIts.length).toBeGreaterThanOrEqual(3);
  });

  it('respecte le plafond CNPS retraite (2,7 M)', () => {
    const r1 = calculerPaie({ brut: 2_700_000, statut: 'cdi' });
    const r2 = calculerPaie({ brut: 5_000_000, statut: 'cdi' });
    // Au-dessus du plafond, la CNPS salarié n'augmente plus.
    expect(r2.cnpsSalarie).toBe(r1.cnpsSalarie);
  });
});

describe('lib/demos/nexusrh-paie — formatFcfa', () => {
  it('formate avec le symbole F CFA et sans décimales', () => {
    const s = formatFcfa(450_000);
    expect(s).toContain('450');
    expect(s).toMatch(/CFA|XOF/);
  });
});
