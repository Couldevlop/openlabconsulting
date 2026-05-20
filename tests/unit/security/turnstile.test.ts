import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { verifyTurnstile } from '@/lib/turnstile';

describe('lib/turnstile — verifyTurnstile', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it('bypass en dev quand TURNSTILE_SECRET_KEY est absente', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.NODE_ENV = 'development';
    const r = await verifyTurnstile('any-token');
    expect(r).toEqual({ ok: true, mode: 'bypass' });
  });

  it('échoue en prod quand TURNSTILE_SECRET_KEY est absente', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.NODE_ENV = 'production';
    const r = await verifyTurnstile('any-token');
    expect(r).toEqual({ ok: false, mode: 'misconfigured' });
  });

  it('rejette un token vide quand le secret est configuré', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret123';
    const r = await verifyTurnstile('');
    expect(r.ok).toBe(false);
    expect(r.mode).toBe('invalid');
    expect(r.errorCodes).toContain('missing-input-response');
  });

  it('renvoie ok=true quand Cloudflare valide', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret123';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    const r = await verifyTurnstile('valid-token');
    expect(r.ok).toBe(true);
    expect(r.mode).toBe('verified');
  });

  it('renvoie ok=false avec error-codes quand Cloudflare rejette', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret123';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
        { status: 200 },
      ),
    );
    const r = await verifyTurnstile('bad-token');
    expect(r.ok).toBe(false);
    expect(r.mode).toBe('invalid');
    expect(r.errorCodes).toEqual(['invalid-input-response']);
  });

  it('renvoie network-error si fetch throw', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret123';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('boom'));
    const r = await verifyTurnstile('token');
    expect(r.ok).toBe(false);
    expect(r.mode).toBe('network-error');
  });
});
