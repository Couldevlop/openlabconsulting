import { describe, it, expect } from 'vitest';
import {
  computeVisitorHash,
  normalizeCountry,
  visitDayHour,
} from '@/lib/visit-tracking';

/**
 * Helpers de comptage de visites (lib/visit-tracking).
 * Couvre : jour/heure UTC, hash anonyme déterministe + rotation
 * quotidienne + non-réversibilité de l'IP, normalisation pays.
 */

describe('visitDayHour', () => {
  it('extrait le jour (AAAA-MM-JJ) et l’heure UTC', () => {
    const d = new Date('2026-06-07T14:35:00Z');
    expect(visitDayHour(d)).toEqual({ day: '2026-06-07', hour: 14 });
  });

  it('utilise bien l’UTC (pas le fuseau local)', () => {
    const d = new Date('2026-06-07T23:59:59Z');
    expect(visitDayHour(d).day).toBe('2026-06-07');
    expect(visitDayHour(d).hour).toBe(23);
  });
});

describe('computeVisitorHash', () => {
  it('est déterministe pour les mêmes entrées', () => {
    const a = computeVisitorHash('secret', '2026-06-07', '1.2.3.4', 'UA');
    const b = computeVisitorHash('secret', '2026-06-07', '1.2.3.4', 'UA');
    expect(a).toBe(b);
  });

  it('tourne chaque jour (jour différent → hash différent)', () => {
    const d1 = computeVisitorHash('secret', '2026-06-07', '1.2.3.4', 'UA');
    const d2 = computeVisitorHash('secret', '2026-06-08', '1.2.3.4', 'UA');
    expect(d1).not.toBe(d2);
  });

  it('diffère par IP et par user-agent', () => {
    const base = computeVisitorHash('secret', '2026-06-07', '1.2.3.4', 'UA');
    expect(
      computeVisitorHash('secret', '2026-06-07', '9.9.9.9', 'UA'),
    ).not.toBe(base);
    expect(
      computeVisitorHash('secret', '2026-06-07', '1.2.3.4', 'Autre'),
    ).not.toBe(base);
  });

  it('produit un SHA-256 hex (64 chars) sans exposer l’IP', () => {
    const h = computeVisitorHash('secret', '2026-06-07', '1.2.3.4', 'UA');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(h).not.toContain('1.2.3.4');
  });
});

describe('normalizeCountry', () => {
  it('accepte un code ISO 2 lettres et le met en majuscules', () => {
    expect(normalizeCountry('ci')).toBe('CI');
    expect(normalizeCountry('FR')).toBe('FR');
  });

  it('renvoie XX pour absent, invalide, Tor (T1)', () => {
    expect(normalizeCountry(null)).toBe('XX');
    expect(normalizeCountry(undefined)).toBe('XX');
    expect(normalizeCountry('')).toBe('XX');
    expect(normalizeCountry('FRA')).toBe('XX');
    expect(normalizeCountry('T1')).toBe('XX');
  });
});
