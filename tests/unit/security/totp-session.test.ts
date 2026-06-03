import { describe, it, expect } from 'vitest';
import {
  TOTP_COOKIE,
  signTotpSession,
  verifyTotpSession,
} from '@/lib/auth/totp-session';

const SECRET = 'test-payload-secret-0123456789abcdef';

describe('lib/auth/totp-session — cookie 2FA signé (OWASP A07)', () => {
  it('expose le nom de cookie', () => {
    expect(TOTP_COOKIE).toBe('totp-verified');
  });

  it('signe puis vérifie un jeton valide (roundtrip)', async () => {
    const token = await signTotpSession('u123', 3600, SECRET);
    const res = await verifyTotpSession(token, SECRET);
    expect(res).toEqual({ userId: 'u123' });
  });

  it('rejette un jeton constant forgé (ancien « 1 »)', async () => {
    expect(await verifyTotpSession('1', SECRET)).toBeNull();
    expect(
      await verifyTotpSession('u123.9999999999999.deadbeef', SECRET),
    ).toBeNull();
  });

  it('rejette une signature falsifiée', async () => {
    const token = await signTotpSession('u123', 3600, SECRET);
    const tampered = token.slice(0, -2) + (token.endsWith('00') ? '11' : '00');
    expect(await verifyTotpSession(tampered, SECRET)).toBeNull();
  });

  it('rejette un userId modifié (signature ne correspond plus)', async () => {
    const token = await signTotpSession('u123', 3600, SECRET);
    const parts = token.split('.');
    const forged = ['attacker', parts[1], parts[2]].join('.');
    expect(await verifyTotpSession(forged, SECRET)).toBeNull();
  });

  it('rejette un jeton expiré', async () => {
    const now = 1_000_000_000_000;
    const token = await signTotpSession('u123', 60, SECRET, now);
    // 61 s plus tard → expiré.
    expect(await verifyTotpSession(token, SECRET, now + 61_000)).toBeNull();
    // Encore valide à 59 s.
    expect(await verifyTotpSession(token, SECRET, now + 59_000)).toEqual({
      userId: 'u123',
    });
  });

  it('rejette avec un mauvais secret (autre serveur)', async () => {
    const token = await signTotpSession('u123', 3600, SECRET);
    expect(await verifyTotpSession(token, 'autre-secret')).toBeNull();
  });

  it('rejette les entrées vides / malformées', async () => {
    expect(await verifyTotpSession(null, SECRET)).toBeNull();
    expect(await verifyTotpSession('', SECRET)).toBeNull();
    expect(await verifyTotpSession('a.b', SECRET)).toBeNull();
    expect(await verifyTotpSession('a.b.c.d', SECRET)).toBeNull();
  });
});
