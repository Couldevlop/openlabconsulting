import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Payload } from 'payload';
import { firstRecipient, zeptomailAdapter } from '@/lib/email-adapter';
import { Users } from '@/collections/Users';

/**
 * Tests de l'email adapter Payload → ZeptoMail (lib/email-adapter.ts)
 * et du template « mot de passe oublié » FR (collections/Users.ts).
 *
 * Couvre :
 *   - fail-soft « skipped » sans ZEPTOMAIL_TOKEN (jamais de throw → pas
 *     de 500 sur /api/users/forgot-password, OWASP A09)
 *   - normalisation du destinataire nodemailer (string/objet/tableau)
 *   - payload API ZeptoMail correct (auth Zoho-enczapikey, to, subject)
 *   - log serveur sur échec HTTP, réponse fail-soft
 *   - sujet + HTML français du forgot-password (lien reset, échappement)
 */

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;

function makePayloadStub(): {
  payload: Payload;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
} {
  const warn = vi.fn();
  const error = vi.fn();
  const payload = {
    logger: { warn, error, info: vi.fn() },
  } as unknown as Payload;
  return { payload, warn, error };
}

function setupEnv(): void {
  process.env.ZEPTOMAIL_TOKEN = 'enc-token-xyz';
  process.env.ZEPTOMAIL_API_URL = 'https://api.zeptomail.eu/v1.1/email';
  process.env.EMAIL_FROM = 'noreply@openlabconsulting.com';
  process.env.EMAIL_FROM_NAME = 'OpenLab Consulting';
  process.env.EMAIL_TEAM = 'waopron@openlabconsulting.com';
}

afterEach(() => {
  process.env = { ...originalEnv };
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('firstRecipient — normalisation nodemailer', () => {
  it('accepte une string simple', () => {
    expect(firstRecipient('a@b.ci')).toEqual({ address: 'a@b.ci' });
  });

  it('accepte un objet adresse avec nom', () => {
    expect(firstRecipient({ address: 'a@b.ci', name: 'A' })).toEqual({
      address: 'a@b.ci',
      name: 'A',
    });
  });

  it('prend le premier élément d’un tableau', () => {
    expect(firstRecipient(['x@y.ci', 'z@w.ci'])).toEqual({
      address: 'x@y.ci',
    });
  });

  it('renvoie null pour vide/undefined', () => {
    expect(firstRecipient(undefined)).toBeNull();
    expect(firstRecipient('')).toBeNull();
    expect(firstRecipient([])).toBeNull();
    expect(firstRecipient({})).toBeNull();
  });
});

describe('zeptomailAdapter — fail-soft sans token', () => {
  beforeEach(() => {
    delete process.env.ZEPTOMAIL_TOKEN;
  });

  it('saute l’envoi (skipped) et log un warn, sans throw', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const { payload, warn } = makePayloadStub();

    const adapter = zeptomailAdapter()({ payload });
    const res = await adapter.sendEmail({
      to: 'waopron@openlabconsulting.com',
      subject: 'Reset',
      html: '<p>lien</p>',
    });

    expect(res.ok).toBe(false);
    expect(res.skipped).toBe(true);
    expect(warn).toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('zeptomailAdapter — envoi', () => {
  beforeEach(() => {
    setupEnv();
  });

  it('expose nom et from par défaut depuis l’environnement', () => {
    const { payload } = makePayloadStub();
    const adapter = zeptomailAdapter()({ payload });
    expect(adapter.name).toBe('zeptomail');
    expect(adapter.defaultFromAddress).toBe('noreply@openlabconsulting.com');
    expect(adapter.defaultFromName).toBe('OpenLab Consulting');
  });

  it('POST ZeptoMail avec auth Zoho-enczapikey, to et subject corrects', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 201 } as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const { payload } = makePayloadStub();

    const adapter = zeptomailAdapter()({ payload });
    const res = await adapter.sendEmail({
      to: 'waopron@openlabconsulting.com',
      subject: 'Réinitialisation de votre mot de passe — Admin OpenLab',
      html: '<p>Lien de reset</p>',
      text: 'Lien de reset',
    });

    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.zeptomail.eu/v1.1/email');
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Zoho-enczapikey enc-token-xyz');
    const body = JSON.parse(String(init.body)) as {
      to: { email_address: { address: string } }[];
      subject: string;
      htmlbody: string;
    };
    expect(body.to[0]?.email_address.address).toBe(
      'waopron@openlabconsulting.com',
    );
    expect(body.subject).toMatch(/Réinitialisation/);
    expect(body.htmlbody).toContain('Lien de reset');
  });

  it('fail-soft sur HTTP non-2xx : ok=false + logger.error, sans throw', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('unauthorized'),
    } as unknown as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const { payload, error } = makePayloadStub();

    const adapter = zeptomailAdapter()({ payload });
    const res = await adapter.sendEmail({
      to: 'waopron@openlabconsulting.com',
      subject: 'Reset',
      html: '<p>lien</p>',
    });

    expect(res.ok).toBe(false);
    expect(res.error).toBe('HTTP 401');
    expect(error).toHaveBeenCalled();
  });

  it('refuse proprement un message sans destinataire', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const { payload, warn } = makePayloadStub();

    const adapter = zeptomailAdapter()({ payload });
    const res = await adapter.sendEmail({ subject: 'Reset', html: '<p>x</p>' });

    expect(res.ok).toBe(false);
    expect(warn).toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('Users — email « mot de passe oublié » (FR, charte OpenLab)', () => {
  interface ForgotPasswordConfig {
    generateEmailSubject: () => string;
    generateEmailHTML: (args?: {
      token?: string;
      user?: unknown;
    }) => string | Promise<string>;
  }

  function forgotPassword(): ForgotPasswordConfig {
    const auth = Users.auth as { forgotPassword?: ForgotPasswordConfig };
    if (!auth.forgotPassword) {
      throw new Error('auth.forgotPassword manquant sur Users');
    }
    return auth.forgotPassword;
  }

  it('sujet en français', () => {
    expect(forgotPassword().generateEmailSubject()).toMatch(
      /Réinitialisation de votre mot de passe/,
    );
  });

  it('HTML : lien de reset /admin/reset/<token> + texte français', async () => {
    process.env.PAYLOAD_PUBLIC_SERVER_URL = 'https://openlabconsulting.com';
    const html = await forgotPassword().generateEmailHTML({
      token: 'tok-123',
      user: { email: 'waopron@openlabconsulting.com', fullName: 'Thomcoul' },
    });
    expect(html).toContain('https://openlabconsulting.com/admin/reset/tok-123');
    expect(html).toMatch(/Bonjour Thomcoul,/);
    expect(html).toMatch(/valable une heure/);
    expect(html).toMatch(/OpenLab/);
  });

  it('HTML : échappe le fullName (anti-injection, OWASP A03)', async () => {
    const html = await forgotPassword().generateEmailHTML({
      token: 'tok-123',
      user: { fullName: '<script>alert(1)</script>' },
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('HTML : salutation générique sans fullName', async () => {
    const html = await forgotPassword().generateEmailHTML({ token: 't' });
    expect(html).toMatch(/Bonjour,/);
  });
});
