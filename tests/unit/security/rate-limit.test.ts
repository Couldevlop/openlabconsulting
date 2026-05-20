import { describe, it, expect, beforeEach } from 'vitest';
import { RATE_LIMITS, __resetMemoryStore, rateLimit } from '@/lib/rate-limit';

describe('lib/rate-limit (in-memory fallback)', () => {
  beforeEach(() => {
    __resetMemoryStore();
    // Pas de REDIS_URL → fallback mémoire.
    delete process.env.REDIS_URL;
  });

  it('autorise les premières requêtes sous la limite', async () => {
    const opts = { limit: 3, windowSec: 60 };
    const r1 = await rateLimit('test:1', opts);
    const r2 = await rateLimit('test:1', opts);
    const r3 = await rateLimit('test:1', opts);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);
  });

  it('refuse la 4e requête (limit=3)', async () => {
    const opts = { limit: 3, windowSec: 60 };
    await rateLimit('test:2', opts);
    await rateLimit('test:2', opts);
    await rateLimit('test:2', opts);
    const r4 = await rateLimit('test:2', opts);
    expect(r4.ok).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it('isole les clés différentes', async () => {
    const opts = { limit: 1, windowSec: 60 };
    expect((await rateLimit('a', opts)).ok).toBe(true);
    expect((await rateLimit('b', opts)).ok).toBe(true);
    expect((await rateLimit('a', opts)).ok).toBe(false);
    expect((await rateLimit('b', opts)).ok).toBe(false);
  });

  it('renvoie un resetAt cohérent avec la fenêtre', async () => {
    const opts = { limit: 2, windowSec: 60 };
    const before = Date.now();
    const r = await rateLimit('test:reset', opts);
    expect(r.resetAt).toBeGreaterThanOrEqual(
      before + opts.windowSec * 1000 - 100,
    );
    expect(r.resetAt).toBeLessThanOrEqual(before + opts.windowSec * 1000 + 100);
  });

  it('expose les presets §10.4', () => {
    expect(RATE_LIMITS.contact).toEqual({ limit: 5, windowSec: 900 });
    expect(RATE_LIMITS.auditIa).toEqual({ limit: 3, windowSec: 3600 });
    expect(RATE_LIMITS.chat).toEqual({ limit: 20, windowSec: 60 });
    expect(RATE_LIMITS.login).toEqual({ limit: 5, windowSec: 900 });
  });
});
