import { describe, it, expect } from 'vitest';
import { validatePasswordStrength } from '@/lib/password-policy';

describe('lib/password-policy — validatePasswordStrength', () => {
  it('accepte un mot de passe fort (12+, mix complet, non commun)', () => {
    const r = validatePasswordStrength('OpenLab-2026-x7K!');
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it('refuse < 12 caractères', () => {
    const r = validatePasswordStrength('Short1!');
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('12'))).toBe(true);
  });

  it('refuse sans majuscule', () => {
    const r = validatePasswordStrength('openlab-2026-x7!');
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('majuscule'))).toBe(true);
  });

  it('refuse sans chiffre', () => {
    const r = validatePasswordStrength('OpenLab-MotDePass!');
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('chiffre'))).toBe(true);
  });

  it('refuse sans caractère spécial', () => {
    const r = validatePasswordStrength('OpenLab2026SecureXY');
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('spécial'))).toBe(true);
  });

  it('refuse les mots de passe communs (blacklist)', () => {
    const r = validatePasswordStrength('password123');
    expect(r.ok).toBe(false);
  });

  it('refuse les répétitions extrêmes (entropie trop basse)', () => {
    const r = validatePasswordStrength('AAAAAAAAAAA1a!');
    // 11 'A' + 1 'a' + 1 chiffre + 1 spécial → entropie basse
    expect(r.ok).toBe(false);
  });

  it('accumule plusieurs erreurs', () => {
    const r = validatePasswordStrength('court');
    expect(r.errors.length).toBeGreaterThan(1);
  });
});
