import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST as contactPost } from '@/app/api/contact/route';
import { POST as auditIaPost } from '@/app/api/audit-ia/route';
import { __resetMemoryStore } from '@/lib/rate-limit';

/**
 * Tests des chemins « edge » des routes /api/contact et /api/audit-ia :
 *   - parsing FormData (content-type différent de JSON)
 *   - body invalide → 400 invalid_body
 *   - audit-ia : consentRgpd absent → 400 spécifique
 *   - captcha_failed quand TURNSTILE_SECRET_KEY est défini + token invalide
 */
describe('Routes API — chemins edge', () => {
  beforeEach(() => {
    __resetMemoryStore();
    delete process.env.REDIS_URL;
    delete process.env.TURNSTILE_SECRET_KEY;
    Object.assign(process.env, { NODE_ENV: 'test' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/contact (FormData + edge)', () => {
    it('accepte FormData (content-type=multipart)', async () => {
      const form = new FormData();
      form.set('name', 'Debora Ahouma');
      form.set('email', 'debora@openlabconsulting.com');
      form.set('organization', 'OpenLab');
      form.set('subject', 'audit-ia');
      form.set(
        'message',
        'Bonjour, demande audit IA pour notre cabinet UEMOA.',
      );
      const req = new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.0.2.50' },
        body: form,
      });
      const res = await contactPost(req);
      expect(res.status).toBe(202);
    });

    it('renvoie 400 invalid_body si JSON malformé', async () => {
      const req = new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '192.0.2.51',
        },
        body: '{ pas un json',
      });
      const res = await contactPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('invalid_body');
    });
  });

  describe('POST /api/audit-ia (consentRgpd + FormData)', () => {
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

    it('accepte FormData', async () => {
      const form = new FormData();
      for (const [k, v] of Object.entries(validAudit)) {
        form.set(k, String(v));
      }
      const req = new Request('http://localhost/api/audit-ia', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.50' },
        body: form,
      });
      const res = await auditIaPost(req);
      expect(res.status).toBe(202);
    });

    it('renvoie 400 invalid_body si JSON malformé', async () => {
      const req = new Request('http://localhost/api/audit-ia', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.51',
        },
        body: '{ corrupt',
      });
      const res = await auditIaPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('invalid_body');
    });

    it('renvoie 400 validation_failed sur champs manquants', async () => {
      const req = new Request('http://localhost/api/audit-ia', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.52',
        },
        body: JSON.stringify({ name: '' }),
      });
      const res = await auditIaPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('validation_failed');
    });
  });

  describe('POST /api/audit-ia (consentRgpd false)', () => {
    it('renvoie 400 si consentRgpd reste false après transform', async () => {
      const req = new Request('http://localhost/api/audit-ia', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.60',
        },
        body: JSON.stringify({
          name: 'Test',
          email: 'test@enterprise.fr',
          organization: 'Test SA',
          jobTitle: 'CTO',
          maturity: 'pilote',
          headcount: '200-1000',
          goal: 'Cartographier nos cas d’usage IA pour 2026.',
          consentRgpd: false,
        }),
      });
      const res = await auditIaPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('validation_failed');
      expect(json.fields?.consentRgpd).toBeTruthy();
    });
  });

  describe('POST /api/audit-ia (captcha_failed)', () => {
    it('renvoie 400 captcha_failed si Turnstile rejette', async () => {
      process.env.TURNSTILE_SECRET_KEY = 'secret-test';
      // Site key publique configurée → on exerce le chemin strict de vérif
      // (sans elle, verifyTurnstile bypass par parité client/serveur).
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: async () => ({ success: false }),
      } as unknown as Response);
      try {
        const req = new Request('http://localhost/api/audit-ia', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '203.0.113.70',
          },
          body: JSON.stringify({
            name: 'Test',
            email: 'test@enterprise.fr',
            organization: 'Test SA',
            jobTitle: 'CTO',
            maturity: 'pilote',
            headcount: '200-1000',
            goal: 'Cartographier nos cas d’usage IA pour 2026.',
            consentRgpd: 'on',
            'cf-turnstile-response': 'bad-token',
          }),
        });
        const res = await auditIaPost(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('captcha_failed');
      } finally {
        globalThis.fetch = originalFetch;
        delete process.env.TURNSTILE_SECRET_KEY;
        delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      }
    });
  });

  describe('POST /api/contact (captcha_failed)', () => {
    it('renvoie 400 captcha_failed quand Turnstile rejette le token', async () => {
      process.env.TURNSTILE_SECRET_KEY = 'secret-test';
      // Site key publique configurée → chemin strict (cf. bypass parité).
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
      // Mock global fetch pour simuler la réponse Cloudflare = invalid.
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
      } as unknown as Response);
      try {
        const req = new Request('http://localhost/api/contact', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '192.0.2.99',
          },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@enterprise.fr',
            subject: 'autre',
            message:
              'Message suffisamment long pour passer le min Zod (20 chars).',
            'cf-turnstile-response': 'bad-token',
          }),
        });
        const res = await contactPost(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('captcha_failed');
      } finally {
        globalThis.fetch = originalFetch;
        delete process.env.TURNSTILE_SECRET_KEY;
        delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      }
    });
  });
});
