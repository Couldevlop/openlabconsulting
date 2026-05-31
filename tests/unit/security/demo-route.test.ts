import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST as demoPost } from '@/app/api/demo/route';
import { __resetMemoryStore } from '@/lib/rate-limit';

/**
 * Tests route /api/demo — demande de démo produit (§7, §10).
 * Pipeline : rate limit, Zod, Turnstile (bypass dev), revalidation produit
 * serveur (A04), 202 / 400 / 404 / 429.
 */
describe('POST /api/demo', () => {
  beforeEach(() => {
    __resetMemoryStore();
    delete process.env.REDIS_URL;
    delete process.env.TURNSTILE_SECRET_KEY;
    Object.assign(process.env, { NODE_ENV: 'test' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function buildReq(body: Record<string, unknown>): Request {
    return new Request('http://localhost:3000/api/demo', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `192.0.2.${Math.floor(Math.random() * 254) + 1}`,
      },
      body: JSON.stringify(body),
    });
  }

  // nexusrh existe dans les FALLBACK_PRODUCTS (lib/data/products).
  const validBody = {
    name: 'Debora Ahouma',
    email: 'debora@openlabconsulting.com',
    organization: 'OpenLab Consulting',
    phone: '+225 07 09 33 42 38',
    productSlug: 'nexusrh',
    productName: 'NexusRH CI',
    message: 'Nous aimerions voir le module CNPS sur nos bulletins réels.',
  };

  it('renvoie 202 sur demande valide', async () => {
    const res = await demoPost(buildReq(validBody));
    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('accepte une demande sans téléphone ni message (champs optionnels)', async () => {
    const res = await demoPost(
      buildReq({
        name: 'Jean Kouassi',
        email: 'jean@example.ci',
        organization: 'Banque Atlantique',
        productSlug: 'fraud-shield',
        productName: 'Fraud Shield',
      }),
    );
    expect(res.status).toBe(202);
  });

  it('renvoie 400 sur email invalide', async () => {
    const res = await demoPost(
      buildReq({ ...validBody, email: 'pas-un-email' }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('validation_failed');
    expect(json.fields).toBeDefined();
  });

  it('renvoie 400 si honeypot rempli', async () => {
    const res = await demoPost(
      buildReq({ ...validBody, website: 'http://bot.example' }),
    );
    expect(res.status).toBe(400);
  });

  it('renvoie 400 sur productSlug au format invalide (anti-injection)', async () => {
    const res = await demoPost(
      buildReq({ ...validBody, productSlug: '../../etc/passwd' }),
    );
    expect(res.status).toBe(400);
  });

  it('renvoie 404 sur produit inexistant (revalidation serveur A04)', async () => {
    const res = await demoPost(
      buildReq({ ...validBody, productSlug: 'produit-fantome' }),
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('unknown_product');
  });

  it('renvoie 429 après 5 soumissions depuis la même IP', async () => {
    const ip = '198.51.100.7';
    const req = (): Request =>
      new Request('http://localhost:3000/api/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
        body: JSON.stringify(validBody),
      });

    for (let i = 0; i < 5; i++) {
      expect((await demoPost(req())).status).toBe(202);
    }
    const blocked = await demoPost(req());
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
  });
});
