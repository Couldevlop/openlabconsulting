import { describe, it, expect } from 'vitest';
import {
  bookSchema,
  breadcrumbSchema,
  jsonLdString,
  localBusinessSchema,
  organizationSchema,
  sectorPageSchema,
  serviceSchema,
  softwareApplicationSchema,
  webSiteSchema,
} from '@/lib/seo/schema';
import { EXPERTISES } from '@/lib/data/expertises';
import { PRODUCTS } from '@/lib/data/products';
import { SECTORS } from '@/lib/data/sectors';

describe('lib/seo/schema — JSON-LD helpers', () => {
  it('organizationSchema : type Organization avec address Abidjan', () => {
    const s = organizationSchema();
    expect(s['@type']).toBe('Organization');
    expect(s.name).toMatch(/OpenLab/);
    const addr = s.address as { addressLocality?: string };
    expect(addr.addressLocality).toBe('Cocody');
  });

  it('localBusinessSchema : type ProfessionalService', () => {
    const s = localBusinessSchema();
    expect(s['@type']).toBe('ProfessionalService');
    expect(s.priceRange).toBe('Sur devis');
  });

  it('webSiteSchema : type WebSite avec publisher rattaché', () => {
    const s = webSiteSchema();
    expect(s['@type']).toBe('WebSite');
    const pub = s.publisher as { '@id': string };
    expect(pub['@id']).toContain('#organization');
  });

  it('breadcrumbSchema : transforme N items en BreadcrumbList', () => {
    const s = breadcrumbSchema([
      { name: 'Accueil', url: '/' },
      { name: 'Expertises', url: '/expertises' },
      { name: 'Conseil', url: '/expertises/conseil-strategie' },
    ]);
    expect(s['@type']).toBe('BreadcrumbList');
    const items = s.itemListElement as { position: number }[];
    expect(items).toHaveLength(3);
    expect(items[0]?.position).toBe(1);
    expect(items[2]?.position).toBe(3);
  });

  it('serviceSchema : type Service avec provider et URL', () => {
    const e = EXPERTISES[0]!;
    const s = serviceSchema(e);
    expect(s['@type']).toBe('Service');
    expect(s.name).toBe(e.title);
    expect(String(s.url)).toContain(`/expertises/${e.slug}`);
  });

  it('softwareApplicationSchema : type SoftwareApplication', () => {
    const p = PRODUCTS[0]!;
    const s = softwareApplicationSchema(p);
    expect(s['@type']).toBe('SoftwareApplication');
    expect(s.name).toBe(p.name);
    expect(String(s.url)).toContain(`/solutions/${p.slug}`);
  });

  it('sectorPageSchema : type WebPage avec inLanguage fr', () => {
    const sec = SECTORS[0]!;
    const s = sectorPageSchema(sec);
    expect(s['@type']).toBe('WebPage');
    expect(s.inLanguage).toBe('fr');
  });

  it('bookSchema : type Book avec author Debora Ahouma', () => {
    const s = bookSchema();
    expect(s['@type']).toBe('Book');
    const author = s.author as { name: string };
    expect(author.name).toBe('Debora Ahouma');
  });

  it('jsonLdString : échappe les chevrons < pour éviter XSS', () => {
    const malicious = {
      '@context': 'https://schema.org' as const,
      '@type': 'X',
      evil: '</script><script>alert(1)</script>',
    };
    const out = jsonLdString(malicious);
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c/script');
  });
});
