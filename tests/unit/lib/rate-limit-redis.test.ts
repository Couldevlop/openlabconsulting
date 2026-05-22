import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests du chemin Redis de `lib/rate-limit` — ioredis mocké pour
 * simuler INCR / EXPIRE / PTTL via multi-pipeline.
 */
describe('lib/rate-limit — chemin Redis', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.REDIS_URL = 'redis://localhost:6379';
  });

  afterEach(() => {
    vi.doUnmock('ioredis');
    delete process.env.REDIS_URL;
  });

  it('utilise Redis quand REDIS_URL est défini', async () => {
    let count = 0;
    const execMock = vi.fn().mockImplementation(async () => {
      count++;
      return [
        [null, count],
        [null, 1],
        [null, 60_000],
      ];
    });
    vi.doMock('ioredis', () => ({
      default: vi.fn(() => ({
        multi: () => ({
          incr: vi.fn(),
          expire: vi.fn(),
          pttl: vi.fn(),
          exec: execMock,
        }),
      })),
    }));
    const { rateLimit } = await import('@/lib/rate-limit');
    const r1 = await rateLimit('test:redis', { limit: 5, windowSec: 60 });
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(4);
    expect(execMock).toHaveBeenCalled();
  });

  it('refuse au-delà de la limite (count > limit)', async () => {
    vi.doMock('ioredis', () => ({
      default: vi.fn(() => ({
        multi: () => ({
          incr: vi.fn(),
          expire: vi.fn(),
          pttl: vi.fn(),
          exec: vi.fn().mockResolvedValue([
            [null, 10], // 10 hits
            [null, 1],
            [null, 30_000],
          ]),
        }),
      })),
    }));
    const { rateLimit } = await import('@/lib/rate-limit');
    const r = await rateLimit('test:over', { limit: 5, windowSec: 60 });
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it('fail-open : autorise si exec retourne null', async () => {
    vi.doMock('ioredis', () => ({
      default: vi.fn(() => ({
        multi: () => ({
          incr: vi.fn(),
          expire: vi.fn(),
          pttl: vi.fn(),
          exec: vi.fn().mockResolvedValue(null),
        }),
      })),
    }));
    const { rateLimit } = await import('@/lib/rate-limit');
    const r = await rateLimit('test:null', { limit: 5, windowSec: 60 });
    expect(r.ok).toBe(true);
    expect(r.remaining).toBe(5);
  });

  it('fallback in-memory si exec throw (timeout Redis)', async () => {
    vi.doMock('ioredis', () => ({
      default: vi.fn(() => ({
        multi: () => ({
          incr: vi.fn(),
          expire: vi.fn(),
          pttl: vi.fn(),
          exec: vi.fn().mockRejectedValue(new Error('Redis timeout')),
        }),
      })),
    }));
    const { rateLimit, __resetMemoryStore } = await import('@/lib/rate-limit');
    __resetMemoryStore();
    const r = await rateLimit('test:err', { limit: 3, windowSec: 60 });
    // Tombé en in-memory → autorisé.
    expect(r.ok).toBe(true);
  });

  it('si import ioredis throw, utilise fallback in-memory', async () => {
    vi.doMock('ioredis', () => {
      throw new Error('ioredis non installé');
    });
    const { rateLimit, __resetMemoryStore } = await import('@/lib/rate-limit');
    __resetMemoryStore();
    const r = await rateLimit('test:import-err', { limit: 2, windowSec: 60 });
    expect(r.ok).toBe(true);
  });
});
