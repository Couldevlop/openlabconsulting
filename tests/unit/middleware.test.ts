import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function makeReq(path = '/'): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${path}`));
}

describe('middleware sécurité', () => {
  it('pose une CSP restrictive avec frame-ancestors none', async () => {
    const res = await middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy');
    expect(csp).not.toBeNull();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it('n’impose pas upgrade-insecure-requests sur localhost', async () => {
    // WebKit applique la directive jusque sur localhost : sur un serveur
    // de test en HTTP, tous les chunks partiraient en https:// et la
    // page ne s'hydraterait jamais.
    const res = await middleware(makeReq());
    expect(res.headers.get('Content-Security-Policy')).not.toContain(
      'upgrade-insecure-requests',
    );
  });

  it('n’impose pas la directive sur les autres boucles locales', async () => {
    // WebKit résout parfois localhost en IPv6 : `nextUrl.hostname` renvoie
    // alors « ::1 » sans crochets. Toutes les formes doivent être couvertes.
    for (const origin of [
      'http://127.0.0.1:3000',
      'http://[::1]:3000',
      'http://app.localhost:3000',
    ]) {
      const res = await middleware(new NextRequest(new URL(`${origin}/`)));
      expect(res.headers.get('Content-Security-Policy')).not.toContain(
        'upgrade-insecure-requests',
      );
    }
  });

  it('impose upgrade-insecure-requests sur un hôte public en HTTPS', async () => {
    const res = await middleware(
      new NextRequest(new URL('https://openlabconsulting.com/')),
    );
    expect(res.headers.get('Content-Security-Policy')).toContain(
      'upgrade-insecure-requests',
    );
  });

  it('impose la directive derrière un proxy TLS', async () => {
    // En production, l'application reçoit du HTTP en clair depuis
    // l'ingress : c'est `x-forwarded-proto` qui atteste du TLS côté client.
    const req = new NextRequest(new URL('http://openlabconsulting.com/'), {
      headers: { 'x-forwarded-proto': 'https' },
    });
    expect(
      (await middleware(req)).headers.get('Content-Security-Policy'),
    ).toContain('upgrade-insecure-requests');
  });

  it('pose X-Frame-Options DENY', async () => {
    const res = await middleware(makeReq());
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('pose Referrer-Policy strict-origin-when-cross-origin', async () => {
    const res = await middleware(makeReq());
    expect(res.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin',
    );
  });

  it('pose Permissions-Policy verrouillé', async () => {
    const res = await middleware(makeReq());
    const pp = res.headers.get('Permissions-Policy');
    expect(pp).toContain('camera=()');
    expect(pp).toContain('microphone=()');
    expect(pp).toContain('geolocation=()');
  });

  it('pose X-Content-Type-Options nosniff', async () => {
    const res = await middleware(makeReq());
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('pose COOP / CORP same-origin', async () => {
    const res = await middleware(makeReq());
    expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(res.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
  });
});
