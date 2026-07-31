import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Transport SMTP.
 *
 * Il prend le pas sur l'API ZeptoMail dès que `SMTP_HOST` est renseigné,
 * ce qui permet de changer de transport par configuration sans toucher
 * au code, notamment quand le compte ZeptoMail est à court de crédit
 * (HTTP 429 observé en production).
 */

const sendMail = vi.fn(async () => ({ messageId: 'x' }));
const createTransport = vi.fn(() => ({ sendMail }));
vi.mock('nodemailer', () => ({ default: { createTransport } }));

const SMTP_KEYS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
] as const;

beforeEach(() => {
  vi.resetModules();
  sendMail.mockClear();
  createTransport.mockClear();
  for (const k of SMTP_KEYS) delete process.env[k];
  delete process.env.ZEPTOMAIL_TOKEN;
});

function configureSmtp(): void {
  Object.assign(process.env, {
    SMTP_HOST: 'smtp.exemple.test',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'compte@exemple.test',
    SMTP_PASS: 'mot-de-passe-application',
    EMAIL_FROM: 'noreply@openlabconsulting.com',
    EMAIL_TEAM: 'waopron@openlabconsulting.com',
  });
}

describe('transport SMTP', () => {
  it('est retenu dès que SMTP_HOST est renseigné, sans token ZeptoMail', async () => {
    configureSmtp();
    const { readConfig, send } = await import('@/lib/email-core');

    const cfg = readConfig();
    expect(cfg?.smtp?.host).toBe('smtp.exemple.test');

    const res = await send(cfg!, {
      to: { address: 'prospect@exemple.test', name: 'Prospect' },
      subject: 'Sujet',
      html: '<p>Corps</p>',
      text: 'Corps',
    });

    expect(res.ok).toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it('transmet le port, la sécurité et l’authentification', async () => {
    configureSmtp();
    const { readConfig, send } = await import('@/lib/email-core');
    await send(readConfig()!, {
      to: { address: 'p@exemple.test' },
      subject: 'S',
      html: 'h',
      text: 't',
    });

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.exemple.test',
        port: 587,
        secure: false,
        auth: expect.objectContaining({ user: 'compte@exemple.test' }),
      }),
    );
  });

  it('reste fail-soft si le serveur SMTP refuse', async () => {
    configureSmtp();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sendMail.mockRejectedValueOnce(new Error('535 authentification refusée'));

    const { readConfig, send } = await import('@/lib/email-core');
    const res = await send(readConfig()!, {
      to: { address: 'p@exemple.test' },
      subject: 'S',
      html: 'h',
      text: 't',
    });

    expect(res.ok).toBe(false);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('laisse la main à ZeptoMail quand SMTP n’est pas configuré', async () => {
    Object.assign(process.env, { ZEPTOMAIL_TOKEN: 'jeton' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 201 })),
    );

    const { readConfig, send } = await import('@/lib/email-core');
    const cfg = readConfig();
    expect(cfg?.smtp).toBeUndefined();

    await send(cfg!, {
      to: { address: 'p@exemple.test' },
      subject: 'S',
      html: 'h',
      text: 't',
    });

    expect(sendMail).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('saute proprement l’envoi quand aucun transport n’est configuré', async () => {
    const { readConfig } = await import('@/lib/email-core');
    expect(readConfig()).toBeNull();
  });
});
