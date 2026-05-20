import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST as contactPost } from '@/app/api/contact/route';
import { POST as auditIaPost } from '@/app/api/audit-ia/route';
import { __resetMemoryStore } from '@/lib/rate-limit';

/**
 * Tests des routes API §10 — pipeline complet : rate limit, Zod,
 * Turnstile (bypass dev), réponse 202 / 400 / 429.
 */
describe('POST /api/contact', () => {
  beforeEach(() => {
    __resetMemoryStore();
    delete process.env.REDIS_URL;
    delete process.env.TURNSTILE_SECRET_KEY;
    // NODE_ENV est readonly en TS strict mais writable via Object.assign.
    Object.assign(process.env, { NODE_ENV: 'test' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function buildReq(body: Record<string, unknown>): Request {
    return new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `192.0.2.${Math.floor(Math.random() * 254) + 1}`,
      },
      body: JSON.stringify(body),
    });
  }

  const validBody = {
    name: 'Debora Ahouma',
    email: 'debora@openlabconsulting.com',
    organization: 'OpenLab',
    subject: 'audit-ia',
    message:
      'Bonjour, nous souhaiterions un audit IA pour notre filiale UEMOA.',
  };

  it('renvoie 202 sur soumission valide', async () => {
    const res = await contactPost(buildReq(validBody));
    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('renvoie 400 sur message trop court', async () => {
    const res = await contactPost(buildReq({ ...validBody, message: 'court' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('validation_failed');
    expect(json.fields).toBeDefined();
  });

  it('renvoie 400 si honeypot rempli', async () => {
    const res = await contactPost(
      buildReq({ ...validBody, website: 'http://bot.example' }),
    );
    expect(res.status).toBe(400);
  });

  it('renvoie 429 après 5 soumissions depuis la même IP', async () => {
    const ip = '198.51.100.1';
    const req = (): Request =>
      new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify(validBody),
      });

    for (let i = 0; i < 5; i++) {
      const res = await contactPost(req());
      expect(res.status).toBe(202);
    }
    const blocked = await contactPost(req());
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
  });
});

describe('POST /api/audit-ia', () => {
  beforeEach(() => {
    __resetMemoryStore();
    delete process.env.REDIS_URL;
    delete process.env.TURNSTILE_SECRET_KEY;
    // NODE_ENV est readonly en TS strict mais writable via Object.assign.
    Object.assign(process.env, { NODE_ENV: 'test' });
  });

  const validAudit = {
    name: 'Jean Kouassi',
    email: 'jean@example.ci',
    organization: 'Banque Atlantique',
    jobTitle: 'CTO',
    maturity: 'pilote',
    headcount: '200-1000',
    goal: 'Cartographier les cas d’usage IA en banque de détail UEMOA.',
    consentRgpd: 'on',
  };

  function buildReq(body: Record<string, unknown>): Request {
    return new Request('http://localhost:3000/api/audit-ia', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 254) + 1}`,
      },
      body: JSON.stringify(body),
    });
  }

  it('renvoie 202 sur demande valide', async () => {
    const res = await auditIaPost(buildReq(validAudit));
    expect(res.status).toBe(202);
  });

  it('renvoie 429 après 3 soumissions depuis la même IP (limite plus stricte)', async () => {
    const ip = '203.0.113.99';
    const req = (): Request =>
      new Request('http://localhost:3000/api/audit-ia', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify(validAudit),
      });

    for (let i = 0; i < 3; i++) {
      expect((await auditIaPost(req())).status).toBe(202);
    }
    expect((await auditIaPost(req())).status).toBe(429);
  });
});
