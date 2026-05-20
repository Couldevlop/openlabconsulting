import { describe, it, expect } from 'vitest';
import {
  auditIaSchema,
  contactSchema,
  flattenZodErrors,
} from '@/lib/validation';

describe('lib/validation — contactSchema', () => {
  const validPayload = {
    name: 'Debora Ahouma',
    email: 'debora@openlabconsulting.com',
    organization: 'OpenLab',
    subject: 'audit-ia',
    message:
      'Bonjour, nous souhaiterions un audit IA pour notre filiale UEMOA.',
  };

  it('valide un payload complet', () => {
    const r = contactSchema.safeParse(validPayload);
    expect(r.success).toBe(true);
  });

  it('rejette un message trop court (< 20 chars)', () => {
    const r = contactSchema.safeParse({ ...validPayload, message: 'court' });
    expect(r.success).toBe(false);
  });

  it('rejette un email invalide', () => {
    const r = contactSchema.safeParse({
      ...validPayload,
      email: 'pas-un-email',
    });
    expect(r.success).toBe(false);
  });

  it('rejette un subject non listé', () => {
    const r = contactSchema.safeParse({
      ...validPayload,
      subject: 'spam' as 'autre',
    });
    expect(r.success).toBe(false);
  });

  it('rejette si honeypot rempli (bot detection)', () => {
    const r = contactSchema.safeParse({
      ...validPayload,
      website: 'http://bot.io',
    });
    expect(r.success).toBe(false);
  });

  it('accepte honeypot vide ou absent', () => {
    expect(
      contactSchema.safeParse({ ...validPayload, website: '' }).success,
    ).toBe(true);
    expect(contactSchema.safeParse(validPayload).success).toBe(true);
  });

  it('accepte le token Turnstile en option', () => {
    const r = contactSchema.safeParse({
      ...validPayload,
      'cf-turnstile-response': 'XXXX.YYYY.ZZZZ',
    });
    expect(r.success).toBe(true);
  });
});

describe('lib/validation — auditIaSchema', () => {
  const valid = {
    name: 'Jean Kouassi',
    email: 'jean.kouassi@example.ci',
    organization: 'Banque Atlantique',
    jobTitle: 'CTO',
    maturity: 'pilote',
    headcount: '200-1000',
    goal: 'Cartographier les cas d’usage IA en banque de détail UEMOA.',
    consentRgpd: 'on',
  };

  it('valide un payload complet avec consentement', () => {
    const r = auditIaSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.success && r.data.consentRgpd).toBe(true);
  });

  it('transforme "on" / true / "true" en booléen true', () => {
    expect(
      auditIaSchema.parse({ ...valid, consentRgpd: 'on' }).consentRgpd,
    ).toBe(true);
    expect(
      auditIaSchema.parse({ ...valid, consentRgpd: true }).consentRgpd,
    ).toBe(true);
    expect(
      auditIaSchema.parse({ ...valid, consentRgpd: 'true' }).consentRgpd,
    ).toBe(true);
  });

  it('rejette une maturity hors énumération', () => {
    const r = auditIaSchema.safeParse({ ...valid, maturity: 'autre' });
    expect(r.success).toBe(false);
  });
});

describe('lib/validation — flattenZodErrors', () => {
  it('aplatit les issues en { field: message }', () => {
    const r = contactSchema.safeParse({});
    if (r.success) throw new Error('expected fail');
    const flat = flattenZodErrors(r.error);
    expect(Object.keys(flat).length).toBeGreaterThan(0);
    // Garantit qu'on n'a pas de clé vide.
    for (const k of Object.keys(flat)) expect(k.length).toBeGreaterThan(0);
  });
});
