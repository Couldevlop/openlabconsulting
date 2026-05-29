import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendLeadAcknowledgement, sendLeadNotification } from '@/lib/email';

/**
 * Tests du mailer ZeptoMail (lib/email.ts).
 *
 * Couvre :
 *   - fail-soft « skipped » quand ZEPTOMAIL_TOKEN est absent (dev/CI)
 *   - payload API correct (auth, from, to, reply_to, html/text)
 *   - fail-soft sur erreur réseau et statut HTTP non-2xx
 *   - échappement HTML (anti-injection dans les templates)
 */

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;

function setupEnv(): void {
  process.env.ZEPTOMAIL_TOKEN = 'enc-token-xyz';
  process.env.ZEPTOMAIL_API_URL = 'https://api.zeptomail.eu/v1.1/email';
  process.env.EMAIL_FROM = 'noreply@openlabconsulting.com';
  process.env.EMAIL_FROM_NAME = 'OpenLab Consulting';
  process.env.EMAIL_TEAM = 'waopron@openlabconsulting.com';
}

describe('lib/email — fail-soft sans token', () => {
  beforeEach(() => {
    delete process.env.ZEPTOMAIL_TOKEN;
  });
  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('saute l’envoi (skipped) quand ZEPTOMAIL_TOKEN absent', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const res = await sendLeadNotification({
      source: 'contact',
      name: 'Test',
      email: 'test@enterprise.fr',
    });

    expect(res.ok).toBe(false);
    expect(res.skipped).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('lib/email — envoi ZeptoMail', () => {
  beforeEach(() => {
    setupEnv();
  });
  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('notification équipe : auth, destinataire et reply-to corrects', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 201 } as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const res = await sendLeadNotification({
      source: 'audit-ia',
      name: 'Debora Ahouma',
      email: 'debora@openlabconsulting.com',
      organization: 'OpenLab',
      jobTitle: 'CEO',
      message: 'Audit IA complet pour la banque UEMOA.',
      details: { 'Maturité IA': 'pilote', Effectif: '200-1000' },
    });

    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.zeptomail.eu/v1.1/email');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Zoho-enczapikey enc-token-xyz',
    );

    const body = JSON.parse(init.body as string);
    expect(body.from.address).toBe('noreply@openlabconsulting.com');
    expect(body.to[0].email_address.address).toBe(
      'waopron@openlabconsulting.com',
    );
    // Reply-to = prospect → l'équipe répond directement.
    expect(body.reply_to[0].address).toBe('debora@openlabconsulting.com');
    expect(body.subject).toContain('Debora Ahouma');
    expect(body.htmlbody).toContain('200-1000');
    expect(body.textbody).toContain('Audit IA complet');
  });

  it('accusé prospect : destinataire = prospect, reply-to = équipe', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200 } as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const res = await sendLeadAcknowledgement({
      source: 'contact',
      name: 'Jean Kouassi',
      email: 'jean@example.ci',
    });

    expect(res.ok).toBe(true);
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.to[0].email_address.address).toBe('jean@example.ci');
    expect(body.reply_to[0].address).toBe('waopron@openlabconsulting.com');
    // Prénom extrait pour la personnalisation.
    expect(body.htmlbody).toContain('Jean');
  });

  it('échappe le HTML pour neutraliser une injection', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 201 } as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await sendLeadNotification({
      source: 'contact',
      name: '<script>alert(1)</script>',
      email: 'evil@example.com',
      message: 'Bonjour <img src=x onerror=alert(2)>',
    });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.htmlbody).not.toContain('<script>');
    expect(body.htmlbody).toContain('&lt;script&gt;');
    expect(body.htmlbody).not.toContain('<img src=x');
  });

  it('fail-soft : renvoie ok=false si ZeptoMail répond non-2xx', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'unauthorized',
    } as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const res = await sendLeadAcknowledgement({
      source: 'contact',
      name: 'Test',
      email: 'test@example.com',
    });

    expect(res.ok).toBe(false);
    expect(res.error).toContain('401');
  });

  it('fail-soft : renvoie ok=false sans throw si fetch rejette', async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error('network down'));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const res = await sendLeadNotification({
      source: 'contact',
      name: 'Test',
      email: 'test@example.com',
    });

    expect(res.ok).toBe(false);
    expect(res.error).toBe('network down');
  });

  it('accusé audit-ia : objet et délai spécifiques', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 201 } as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const res = await sendLeadAcknowledgement({
      source: 'audit-ia',
      name: 'Awa',
      email: 'awa@example.ci',
    });

    expect(res.ok).toBe(true);
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.subject).toContain('audit IA');
    expect(body.textbody).toContain('48 h');
  });

  it('notification : champs optionnels (subject/score/résumé) et absences', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 201 } as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    // subject connu + aiScore + aiSummary présents ; org/jobTitle/message absents.
    await sendLeadNotification({
      source: 'contact',
      name: 'Solo',
      email: 'solo@example.com',
      subject: 'presse',
      aiScore: 72,
      aiSummary: 'Lead presse à fort potentiel.',
    });
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.htmlbody).toContain('Presse'); // libellé mappé
    expect(body.htmlbody).toContain('72 / 100');
    expect(body.textbody).toContain('Lead presse à fort potentiel.');
  });

  it('notification : sujet inconnu → libellé brut (fallback subjectLabel)', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 201 } as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await sendLeadNotification({
      source: 'contact',
      name: 'X',
      email: 'x@example.com',
      subject: 'sujet-non-mappe',
    });
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.htmlbody).toContain('sujet-non-mappe');
  });

  it('readConfig : valeurs par défaut quand seules les variables minimales sont définies', async () => {
    delete process.env.ZEPTOMAIL_API_URL;
    delete process.env.EMAIL_FROM;
    delete process.env.EMAIL_FROM_NAME;
    delete process.env.EMAIL_TEAM;
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 201 } as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await sendLeadNotification({
      source: 'contact',
      name: 'Def',
      email: 'def@example.com',
    });
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.zeptomail.eu/v1.1/email');
    const body = JSON.parse(init.body as string);
    expect(body.from.address).toBe('noreply@openlabconsulting.com');
    expect(body.from.name).toBe('OpenLab Consulting');
    expect(body.to[0].email_address.address).toBe(
      'waopron@openlabconsulting.com',
    );
  });
});
