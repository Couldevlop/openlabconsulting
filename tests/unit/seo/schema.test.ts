import { describe, it, expect } from 'vitest';
import {
  articleSchema,
  blogSchema,
  bookSchema,
  breadcrumbSchema,
  faqPageSchema,
  jsonLdString,
  localBusinessSchema,
  organizationSchema,
  personSchema,
  publicationsSchema,
  publicationSchema,
  sectorPageSchema,
  serviceSchema,
  softwareApplicationSchema,
  webSiteSchema,
} from '@/lib/seo/schema';
import { EXPERTISES } from '@/lib/data/expertises';
import { PRODUCTS } from '@/lib/data/products';
import { SECTORS } from '@/lib/data/sectors';
import { PUBLICATIONS } from '@/lib/data/laboratoire';

describe('lib/seo/schema — JSON-LD helpers', () => {
  it('organizationSchema : type Organization avec address Abidjan', () => {
    const s = organizationSchema();
    expect(s['@type']).toBe('Organization');
    expect(s.name).toMatch(/OpenLab/);
    const addr = s.address as { addressLocality?: string };
    expect(addr.addressLocality).toBe('Cocody');
  });

  it('publicationsSchema : ItemList typant chaque publication', () => {
    const s = publicationsSchema(PUBLICATIONS);
    expect(s['@type']).toBe('ItemList');
    const items = s.itemListElement as {
      position: number;
      item: { '@type': string; name: string };
    }[];
    expect(items).toHaveLength(PUBLICATIONS.length);
    expect(items[0]?.position).toBe(1);
    // Le livre est typé Book, la conférence Event.
    const types = items.map((it) => it.item['@type']);
    expect(types).toContain('Book');
    expect(types).toContain('Event');
  });

  it('publicationSchema : page détail (slug) — type Report + abstract + auteur Org', () => {
    const wp = PUBLICATIONS.find((p) => p.slug && p.type === 'livre-blanc')!;
    const s = publicationSchema(wp);
    expect(s['@type']).toBe('Report');
    expect(s.name).toBe(wp.title);
    expect(s.url).toMatch(new RegExp(`/laboratoire/publications/${wp.slug}$`));
    expect(s.description).toBe(wp.abstract);
    const authors = s.author as { '@type': string; name: string }[];
    // « Équipe OpenLab » → Organization.
    expect(authors[0]?.['@type']).toBe('Organization');
    expect((s.mainEntityOfPage as { '@id': string })['@id']).toMatch(
      new RegExp(`/laboratoire/publications/${wp.slug}$`),
    );
  });

  it('publicationSchema : sans slug (conférence) — url = href, auteur Person', () => {
    const conf = PUBLICATIONS.find((p) => p.type === 'conference')!;
    const s = publicationSchema(conf);
    expect(s['@type']).toBe('Event');
    expect(s.url).toBe(conf.href);
    // Description retombe sur le summary quand pas d'abstract.
    expect(s.description).toBe(conf.summary);
    const authors = s.author as { '@type': string }[];
    expect(authors[0]?.['@type']).toBe('Person');
  });

  it('blogSchema : type Blog pointant /insights', () => {
    const s = blogSchema();
    expect(s['@type']).toBe('Blog');
    expect(String(s.url)).toMatch(/\/insights$/);
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

  it('personSchema : type Person + worksFor Organization + nationality CI', () => {
    const s = personSchema({
      name: 'Debora Ahouma',
      jobTitle: 'CEO',
      knowsAbout: ['IA', 'MLOps'],
    });
    expect(s['@type']).toBe('Person');
    expect(s.name).toBe('Debora Ahouma');
    expect(s.jobTitle).toBe('CEO');
    expect(s.knowsAbout).toEqual(['IA', 'MLOps']);
    expect((s.nationality as { name: string } | undefined)?.name).toBe(
      'Côte d’Ivoire',
    );
    expect(s.worksFor).toBeDefined();
  });

  it('faqPageSchema : type FAQPage + mainEntity Q&A', () => {
    const s = faqPageSchema([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ]);
    expect(s['@type']).toBe('FAQPage');
    const main = s.mainEntity as Array<{
      '@type': string;
      name: string;
      acceptedAnswer: { text: string };
    }>;
    expect(main).toHaveLength(2);
    expect(main[0]?.['@type']).toBe('Question');
    expect(main[0]?.acceptedAnswer.text).toBe('A1');
  });

  it('articleSchema : Article enrichi (headline, author Person, dates, publisher)', () => {
    const s = articleSchema({
      slug: 'ia-souveraine-ci',
      headline: 'IA souveraine en Côte d’Ivoire',
      description: 'Pourquoi héberger localement.',
      author: 'Debora Ahouma',
      isoDatePublished: '2026-05-22',
      imageUrl: 'https://example.com/cover.jpg',
      wordCount: 1800,
      category: 'Souveraineté',
    });
    expect(s['@type']).toBe('Article');
    expect(s.headline).toMatch(/souveraine/i);
    expect(s.dateModified).toBe('2026-05-22');
    const author = s.author as { '@type': string; name: string };
    expect(author['@type']).toBe('Person');
    expect(author.name).toBe('Debora Ahouma');
    expect(s.wordCount).toBe(1800);
    expect(s.articleSection).toBe('Souveraineté');
    expect((s.image as string[])[0]).toBe('https://example.com/cover.jpg');
  });

  it('articleSchema : fallback image OG endpoint si imageUrl absent', () => {
    const s = articleSchema({
      slug: 'foo',
      headline: 'Foo',
      description: 'd',
      author: 'X',
      isoDatePublished: '2026-01-01',
    });
    expect((s.image as string[])[0]).toMatch(/\/insights\/foo\/opengraph/);
    expect(s.dateModified).toBe('2026-01-01');
    expect(s.wordCount).toBeUndefined();
    expect(s.articleSection).toBeUndefined();
  });
});
