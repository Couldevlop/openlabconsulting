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
    expect(csp).toContain('upgrade-insecure-requests');
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
