import { describe, it, expect } from 'vitest';

/**
 * Tests pour /api/admin/2fa/setup — en environnement de test, le stub
 * `@payload-config` throw immédiatement → `getPayloadAndUser` retombe
 * sur `user: null` → routes répondent toujours 401. Les chemins
 * "user connecté" ne sont pas testables sans alias désactivé.
 * Couvert par les tests d'intégration P6.
 */

import { GET, POST } from '@/app/api/admin/2fa/setup/route';

describe('GET /api/admin/2fa/setup', () => {
  it('renvoie 401 si Payload indisponible (stub Payload throw)', async () => {
    const req = new Request('http://localhost/api/admin/2fa/setup');
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('unauthorized');
  });
});

describe('POST /api/admin/2fa/setup', () => {
  it('renvoie 401 si user absent (stub Payload throw)', async () => {
    const req = new Request('http://localhost/api/admin/2fa/setup', {
      method: 'POST',
      body: JSON.stringify({ code: '123456', secret: 'ABCDEFGHIJKLMNOP' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('renvoie 401 même sur body invalide (auth fail-fast)', async () => {
    const req = new Request('http://localhost/api/admin/2fa/setup', {
      method: 'POST',
      body: 'pas du json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
