import { describe, it, expect } from 'vitest';
import {
  getAuditIaCtaContent,
  getFooterContent,
  getHeroContent,
  getManifestoContent,
  getMethodologieContent,
  getReassuranceContent,
} from '@/lib/cms/site-settings-server';
import {
  AUDIT_IA_CTA_FALLBACK,
  FOOTER_FALLBACK,
  HERO_FALLBACK,
  MANIFESTO_FALLBACK,
  METHODOLOGIE_FALLBACK,
  REASSURANCE_FALLBACK,
} from '@/lib/cms/site-settings';

/**
 * Tests d'intégration des helpers Global Payload — chemin fallback.
 *
 * En unit tests, le stub `payload` (cf. tests/stubs/payload.ts) lève
 * une erreur dès `getPayload()`. Les helpers attrapent et retombent
 * sur le fallback hard-codé. C'est le comportement attendu pour la
 * résilience DB-down et c'est précisément ce qu'on valide ici.
 */
describe('lib/cms/site-settings-server — fallback path (audit P2 §A3)', () => {
  it('getHeroContent retourne HERO_FALLBACK quand Payload absent', async () => {
    const content = await getHeroContent();
    expect(content).toEqual(HERO_FALLBACK);
  });

  it('getManifestoContent retourne MANIFESTO_FALLBACK', async () => {
    const content = await getManifestoContent();
    expect(content.headline).toBe(MANIFESTO_FALLBACK.headline);
    expect(content.stances).toEqual(MANIFESTO_FALLBACK.stances);
  });

  it('getMethodologieContent retourne METHODOLOGIE_FALLBACK', async () => {
    const content = await getMethodologieContent();
    expect(content.axes).toEqual(METHODOLOGIE_FALLBACK.axes);
    expect(content.cta).toEqual(METHODOLOGIE_FALLBACK.cta);
  });

  it('getAuditIaCtaContent retourne AUDIT_IA_CTA_FALLBACK', async () => {
    const content = await getAuditIaCtaContent();
    expect(content.cta).toEqual(AUDIT_IA_CTA_FALLBACK.cta);
    expect(content.reassuranceBullets).toEqual(
      AUDIT_IA_CTA_FALLBACK.reassuranceBullets,
    );
  });

  it('getFooterContent retourne FOOTER_FALLBACK', async () => {
    const content = await getFooterContent();
    expect(content.columns.length).toBe(FOOTER_FALLBACK.columns.length);
    expect(content.copyright).toBe(FOOTER_FALLBACK.copyright);
  });

  it('getReassuranceContent retourne REASSURANCE_FALLBACK', async () => {
    const content = await getReassuranceContent();
    expect(content.eyebrow).toBe(REASSURANCE_FALLBACK.eyebrow);
    expect(content.partners).toEqual(REASSURANCE_FALLBACK.partners);
  });
});
