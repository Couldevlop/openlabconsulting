import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Garde 2FA du middleware sur /admin (OWASP A07). Le flag est lu au
 * chargement du module → on resette les modules et on (ré)importe avec
 * l'env voulu pour chaque scénario.
 */
const SECRET = 'gate-test-secret-abcdef0123456789';

function adminReq(cookie?: string): NextRequest {
  return new NextRequest('http://localhost:3000/admin', {
    headers: cookie ? { cookie } : {},
  });
}

async function loadMiddleware(enforce: boolean) {
  vi.resetModules();
  process.env.ENFORCE_ADMIN_2FA = enforce ? 'true' : 'false';
  process.env.PAYLOAD_SECRET = SECRET;
  return import('@/middleware');
}

describe('middleware — garde 2FA /admin', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    delete process.env.ENFORCE_ADMIN_2FA;
  });

  it('flag OFF : /admin passe sans redirection', async () => {
    const { middleware } = await loadMiddleware(false);
    const res = await middleware(adminReq('payload-token=abc'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('flag ON, non authentifié : laisse passer (page de login)', async () => {
    const { middleware } = await loadMiddleware(true);
    const res = await middleware(adminReq());
    expect(res.headers.get('location')).toBeNull();
  });

  it('flag ON, authentifié sans session 2FA : redirige vers /admin-2fa', async () => {
    const { middleware } = await loadMiddleware(true);
    const res = await middleware(adminReq('payload-token=abc'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin-2fa');
  });

  it('flag ON, session 2FA signée valide : laisse passer', async () => {
    const { middleware } = await loadMiddleware(true);
    const { signTotpSession, TOTP_COOKIE } =
      await import('@/lib/auth/totp-session');
    const token = await signTotpSession('u1', 3600, SECRET);
    const res = await middleware(
      adminReq(`payload-token=abc; ${TOTP_COOKIE}=${token}`),
    );
    expect(res.headers.get('location')).toBeNull();
  });

  it('flag ON, cookie 2FA forgé : redirige vers /admin-2fa', async () => {
    const { middleware } = await loadMiddleware(true);
    const res = await middleware(
      adminReq('payload-token=abc; totp-verified=1'),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin-2fa');
  });
});
