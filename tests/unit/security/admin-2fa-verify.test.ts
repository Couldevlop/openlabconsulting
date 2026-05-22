import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/admin/2fa/verify/route';
import { __resetMemoryStore } from '@/lib/rate-limit';

/**
 * Tests pour /api/admin/2fa/verify — stub Payload throw, donc user
 * null systématique → 401. On vérifie en plus le rate-limit appliqué
 * avant l'auth.
 */
describe('POST /api/admin/2fa/verify', () => {
  beforeEach(() => {
    __resetMemoryStore();
    delete process.env.REDIS_URL;
  });

  it('renvoie 401 si user absent (stub Payload throw)', async () => {
    const req = new Request('http://localhost/api/admin/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code: '123456' }),
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.0.2.20',
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('renvoie 429 après 5 soumissions depuis la même IP', async () => {
    const ip = '198.51.100.60';
    const buildReq = (): Request =>
      new Request('http://localhost/api/admin/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ code: '123456' }),
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': ip,
        },
      });
    for (let i = 0; i < 5; i++) {
      await POST(buildReq());
    }
    const blocked = await POST(buildReq());
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
  });
});
