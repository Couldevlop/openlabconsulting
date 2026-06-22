import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/email', () => ({
  sendWhitepaperDelivery: vi.fn().mockResolvedValue({ ok: true }),
  sendLeadNotification: vi.fn().mockResolvedValue({ ok: true }),
}));

import { POST as whitepaperPost } from '@/app/api/whitepapers/request/route';
import { sendWhitepaperDelivery, sendLeadNotification } from '@/lib/email';
import { __resetMemoryStore } from '@/lib/rate-limit';

/**
 * Tests POST /api/whitepapers/request — audit P2 §7 #15.
 * Pipeline : rate limit, Zod (slug whitelist, RGPD obligatoire),
 * Turnstile (bypass dev sans secret), persistLead best-effort.
 */
describe('POST /api/whitepapers/request', () => {
  beforeEach(() => {
    __resetMemoryStore();
    vi.clearAllMocks();
    delete process.env.REDIS_URL;
    delete process.env.TURNSTILE_SECRET_KEY;
    Object.assign(process.env, { NODE_ENV: 'test' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function buildReq(
    body: Record<string, unknown>,
    headers: Record<string, string> = {},
  ): Request {
    return new Request('http://localhost:3000/api/whitepapers/request', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 254) + 1}`,
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  const validBody = {
    email: 'dsi@banque-atlantique.ci',
    name: 'Aminata Coulibaly',
    organization: 'Banque Atlantique',
    slug: 'ia-souveraine-ci-2026',
    consentRgpd: 'on',
  };

  it('renvoie 200 + pdfUrl + redirectTo sur soumission valide', async () => {
    const res = await whitepaperPost(buildReq(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.pdfUrl).toBe('/whitepapers/ia-souveraine-ci-2026.pdf');
    expect(json.redirectTo).toBe('/livres-blancs/ia-souveraine-ci-2026/merci');
  });

  it('déclenche la livraison email du PDF + notif équipe (best-effort)', async () => {
    const res = await whitepaperPost(buildReq(validBody));
    expect(res.status).toBe(200);
    expect(sendWhitepaperDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'dsi@banque-atlantique.ci',
        name: 'Aminata Coulibaly',
        title: 'L’IA souveraine en Côte d’Ivoire',
        downloadUrl: expect.stringContaining(
          '/whitepapers/ia-souveraine-ci-2026.pdf',
        ),
      }),
    );
    expect(sendLeadNotification).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'whitepaper' }),
    );
  });

  it('accepte un email sans nom ni organisation (champs optionnels)', async () => {
    const res = await whitepaperPost(
      buildReq({
        email: 'curieux@example.ci',
        slug: 'ia-souveraine-ci-2026',
        consentRgpd: 'on',
      }),
    );
    expect(res.status).toBe(200);
  });

  it('renvoie 400 sur slug non whitelisté (anti enumeration)', async () => {
    const res = await whitepaperPost(
      buildReq({ ...validBody, slug: '../etc/passwd' }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('validation_failed');
    expect(json.fields.slug).toBeDefined();
  });

  it('renvoie 400 sur email invalide', async () => {
    const res = await whitepaperPost(
      buildReq({ ...validBody, email: 'pas-un-email' }),
    );
    expect(res.status).toBe(400);
  });

  it('renvoie 400 si consentement RGPD absent', async () => {
    const { consentRgpd: _omitted, ...rest } = validBody;
    void _omitted;
    const res = await whitepaperPost(buildReq(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields.consentRgpd).toBeDefined();
  });

  it('renvoie 400 si consentement RGPD = false explicite', async () => {
    const res = await whitepaperPost(
      buildReq({ ...validBody, consentRgpd: false }),
    );
    expect(res.status).toBe(400);
  });

  it('renvoie 400 si honeypot rempli (bot)', async () => {
    const res = await whitepaperPost(
      buildReq({ ...validBody, website: 'http://bot.example' }),
    );
    expect(res.status).toBe(400);
  });

  it('renvoie 429 après 3 soumissions depuis la même IP (RATE_LIMITS.whitepaper)', async () => {
    const ip = '198.51.100.42';
    const req = (): Request =>
      new Request('http://localhost:3000/api/whitepapers/request', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify(validBody),
      });

    for (let i = 0; i < 3; i++) {
      const res = await whitepaperPost(req());
      expect(res.status).toBe(200);
    }
    const blocked = await whitepaperPost(req());
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
  });

  it('accepte aussi un body FormData (form HTML classique)', async () => {
    const form = new FormData();
    form.set('email', 'cto@example.ci');
    form.set('slug', 'ia-souveraine-ci-2026');
    form.set('consentRgpd', 'on');
    const req = new Request('http://localhost:3000/api/whitepapers/request', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.200',
      },
      body: form,
    });
    const res = await whitepaperPost(req);
    expect(res.status).toBe(200);
  });

  it('renvoie 400 sur body JSON malformé', async () => {
    const req = new Request('http://localhost:3000/api/whitepapers/request', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '198.51.100.201',
      },
      body: '{not json',
    });
    const res = await whitepaperPost(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid_body');
  });
});
