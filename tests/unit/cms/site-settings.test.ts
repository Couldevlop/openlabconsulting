import { describe, it, expect } from 'vitest';
import {
  AUDIT_IA_CTA_FALLBACK,
  FOOTER_FALLBACK,
  HERO_FALLBACK,
  MANIFESTO_FALLBACK,
  METHODOLOGIE_FALLBACK,
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

  it('MANIFESTO_FALLBACK : 3 stances + signature Debora + headline highlight Afrique', () => {
    expect(MANIFESTO_FALLBACK.stances).toHaveLength(3);
    expect(MANIFESTO_FALLBACK.signature.name).toBe('Debora Ahouma');
    expect(MANIFESTO_FALLBACK.headlineHighlight).toMatch(/Afrique/i);
    expect(MANIFESTO_FALLBACK.stances[0]?.excuse).toMatch(/outils/i);
    // Le compteur est tokenisé (interpolé au rendu serveur, cf. product-count).
    expect(MANIFESTO_FALLBACK.stances[0]?.fact).toMatch(
      /\{ProductsWord\} logiciels/,
    );
    expect(MANIFESTO_FALLBACK.signature.locationDate).toContain('Abidjan');
  });

  it('METHODOLOGIE_FALLBACK : 3 axes ordonnés + CTA /audit-ia', () => {
    expect(METHODOLOGIE_FALLBACK.eyebrow).toBe('Notre méthode');
    expect(METHODOLOGIE_FALLBACK.axes).toHaveLength(3);
    expect(METHODOLOGIE_FALLBACK.axes.map((a) => a.index)).toEqual([
      '01',
      '02',
      '03',
    ]);
    expect(METHODOLOGIE_FALLBACK.axes[0]?.title).toMatch(/Audit de maturité/i);
    expect(METHODOLOGIE_FALLBACK.cta.href).toBe('/audit-ia');
  });

  it('AUDIT_IA_CTA_FALLBACK : CTA pointe vers /audit-ia + 3 bullets', () => {
    expect(AUDIT_IA_CTA_FALLBACK.cta.href).toBe('/audit-ia');
    expect(
      AUDIT_IA_CTA_FALLBACK.reassuranceBullets.length,
    ).toBeGreaterThanOrEqual(3);
  });

  it('FOOTER_FALLBACK : 4 colonnes (Expertises, Solutions, Ressources, OpenLab)', () => {
    const titles = FOOTER_FALLBACK.columns.map((c) => c.title);
    expect(titles).toEqual([
      'Expertises',
      'Solutions',
      'Ressources',
      'OpenLab',
    ]);
    expect(FOOTER_FALLBACK.copyright).toContain('RCCM');
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
