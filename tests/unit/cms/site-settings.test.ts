import { describe, it, expect } from 'vitest';
import {
  AUDIT_IA_CTA_FALLBACK,
  FOOTER_FALLBACK,
  HERO_FALLBACK,
  MANIFESTO_FALLBACK,
} from '@/lib/cms/site-settings';

/**
 * Tests des fallbacks site-settings — garantissent la résilience UI
 * quand Payload est indisponible (cf. site-settings-server.ts).
 *
 * Audit P2 §A3 — paramétrage CMS avec fallback hard-codé.
 */
describe('lib/cms/site-settings — fallbacks', () => {
  it('HERO_FALLBACK reflète le manifeste CLAUDE.md §6.1', () => {
    expect(HERO_FALLBACK.headlineLead).toMatch(/L’IA/);
    expect(HERO_FALLBACK.headlineHighlight).toMatch(/africaines/i);
    expect(HERO_FALLBACK.primaryCta.href).toBe('/audit-ia');
    expect(HERO_FALLBACK.secondaryCta.href).toBe('/solutions');
  });

  it('MANIFESTO_FALLBACK : 3 stances + signature Debora', () => {
    expect(MANIFESTO_FALLBACK.stances).toHaveLength(3);
    expect(MANIFESTO_FALLBACK.signature.name).toBe('Debora Ahouma');
    expect(MANIFESTO_FALLBACK.headline).toMatch(/Afrique/i);
  });

  it('AUDIT_IA_CTA_FALLBACK : CTA pointe vers /audit-ia + 3 bullets', () => {
    expect(AUDIT_IA_CTA_FALLBACK.cta.href).toBe('/audit-ia');
    expect(
      AUDIT_IA_CTA_FALLBACK.reassuranceBullets.length,
    ).toBeGreaterThanOrEqual(3);
  });

  it('FOOTER_FALLBACK : 3 colonnes (Cabinet, Écosystème, Publications)', () => {
    const titles = FOOTER_FALLBACK.columns.map((c) => c.title);
    expect(titles).toContain('Cabinet');
    expect(titles).toContain('Écosystème');
    expect(titles).toContain('Publications');
  });

  it('FOOTER_FALLBACK : chaque lien a un href interne ou externe valide', () => {
    for (const col of FOOTER_FALLBACK.columns) {
      for (const link of col.links) {
        expect(link.href.startsWith('/') || link.href.startsWith('http')).toBe(
          true,
        );
      }
    }
  });

  it('FOOTER_FALLBACK : LinkedIn dans socialLinks', () => {
    const platforms = FOOTER_FALLBACK.socialLinks.map((s) => s.platform);
    expect(platforms).toContain('linkedin');
  });
});
