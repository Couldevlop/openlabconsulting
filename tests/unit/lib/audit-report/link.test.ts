import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signReportToken, verifyReportToken } from '@/lib/audit-report/link';

/**
 * Jeton de téléchargement : HMAC signé, expirable, révocable.
 *
 * Un rapport nominatif ne doit pas rester accessible indéfiniment à
 * quiconque récupère l'URL (email transféré, historique de navigateur).
 */

beforeEach(() => {
  Object.assign(process.env, {
    PAYLOAD_SECRET: 'secret-de-test-suffisamment-long-pour-hmac',
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('jeton de téléchargement', () => {
  it('accepte un jeton fraîchement signé', () => {
    expect(verifyReportToken(signReportToken('42'))).toEqual({
      reportId: '42',
    });
  });

  it('refuse un jeton expiré', () => {
    vi.useFakeTimers();
    const token = signReportToken('42', 1);
    vi.advanceTimersByTime(2 * 24 * 60 * 60 * 1000);
    expect(verifyReportToken(token)).toEqual({ error: 'expired' });
  });

  it('refuse une signature falsifiée', () => {
    const [payload] = signReportToken('42').split('.');
    expect(verifyReportToken(`${payload}.0000`)).toEqual({ error: 'invalid' });
  });

  it('refuse un jeton dont la charge a été modifiée', () => {
    const forged = Buffer.from(
      JSON.stringify({ r: '99', e: Date.now() + 10_000 }),
    ).toString('base64url');
    const signature = signReportToken('42').split('.')[1];
    expect(verifyReportToken(`${forged}.${signature}`)).toEqual({
      error: 'invalid',
    });
  });

  it('refuse une entrée qui n’est pas un jeton', () => {
    expect(verifyReportToken('n-importe-quoi')).toEqual({ error: 'invalid' });
    expect(verifyReportToken('')).toEqual({ error: 'invalid' });
    expect(verifyReportToken('a.b.c')).toEqual({ error: 'invalid' });
  });

  it('produit des signatures différentes pour deux rapports', () => {
    expect(signReportToken('42')).not.toBe(signReportToken('43'));
  });

  it('refuse de signer sans secret configuré', () => {
    delete process.env.PAYLOAD_SECRET;
    expect(() => signReportToken('42')).toThrow(/PAYLOAD_SECRET/);
  });
});
