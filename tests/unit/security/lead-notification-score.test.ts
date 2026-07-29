import { describe, it, expect, beforeEach, vi } from 'vitest';
import { __resetMemoryStore } from '@/lib/rate-limit';

/**
 * Écart constaté en production (vérification /audit-ia du 2026-07-29) :
 * le template d'email `sendLeadNotification` sait afficher « Score IA »
 * et « Synthèse IA », mais aucune route ne les transmettait — l'équipe
 * recevait donc la notification sans la qualification visible dans le
 * back-office. `persistLead` renvoie désormais le score, chaque route le
 * reporte dans la notification.
 */

const notifications: Record<string, unknown>[] = [];

vi.mock('@/lib/leads', () => ({
  persistLead: vi.fn(async () => ({
    score: 87,
    summary: 'Lead audit-ia — grande banque, DSI, projet cadré.',
  })),
}));

vi.mock('@/lib/email', () => ({
  sendLeadNotification: vi.fn(async (input: Record<string, unknown>) => {
    notifications.push(input);
    return { ok: true };
  }),
  sendLeadAcknowledgement: vi.fn(async () => ({ ok: true })),
  sendWhitepaperDelivery: vi.fn(async () => ({ ok: true })),
}));

const { POST: auditIaPost } = await import('@/app/api/audit-ia/route');
const { POST: contactPost } = await import('@/app/api/contact/route');

describe('notification équipe — report du score de qualification', () => {
  beforeEach(() => {
    notifications.length = 0;
    __resetMemoryStore();
    delete process.env.REDIS_URL;
    delete process.env.TURNSTILE_SECRET_KEY;
    Object.assign(process.env, { NODE_ENV: 'test' });
  });

  function req(url: string, body: Record<string, unknown>): Request {
    return new Request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 254) + 1}`,
      },
      body: JSON.stringify(body),
    });
  }

  it('/api/audit-ia transmet aiScore + aiSummary à l’équipe', async () => {
    const res = await auditIaPost(
      req('http://localhost:3000/api/audit-ia', {
        name: 'Debora Ahouma',
        email: 'debora@openlabconsulting.com',
        organization: 'OpenLab Consulting',
        jobTitle: 'CEO',
        maturity: 'pilote',
        headcount: '200-1000',
        goal: 'Nous voulons industrialiser notre pilote IA sur la filiale UEMOA.',
        consentRgpd: 'on',
      }),
    );

    expect(res.status).toBe(202);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      source: 'audit-ia',
      aiScore: 87,
      aiSummary: 'Lead audit-ia — grande banque, DSI, projet cadré.',
    });
  });

  it('/api/contact transmet aussi la qualification', async () => {
    const res = await contactPost(
      req('http://localhost:3000/api/contact', {
        name: 'Eugène Benié',
        email: 'eugene@example.ci',
        organization: 'TNA',
        subject: 'audit-ia',
        message: 'Bonjour, nous souhaiterions échanger sur un audit IA.',
      }),
    );

    expect(res.status).toBe(202);
    expect(notifications[0]).toMatchObject({
      aiScore: 87,
      aiSummary: expect.any(String),
    });
  });
});
