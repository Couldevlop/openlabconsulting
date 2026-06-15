import { describe, it, expect } from 'vitest';
import {
  HREFLANG_LOCALES,
  SITE,
  absoluteUrl,
  alternatesFor,
  hreflangMap,
} from '@/lib/seo/site';

describe('lib/seo/site — constantes + helpers', () => {
  it('SITE.url ne contient pas de trailing slash', () => {
    expect(SITE.url.endsWith('/')).toBe(false);
  });

  it('absoluteUrl ajoute le slash de tête manquant', () => {
    expect(absoluteUrl('foo')).toBe(`${SITE.url}/foo`);
    expect(absoluteUrl('/foo')).toBe(`${SITE.url}/foo`);
  });

  it('HREFLANG_LOCALES contient fr-CI, fr-FR, x-default', () => {
    expect(HREFLANG_LOCALES).toEqual(['fr-CI', 'fr-FR', 'x-default']);
  });

  it('hreflangMap : tous les locales pointent vers le path normalisé', () => {
    const m = hreflangMap('insights');
    expect(m['fr-CI']).toBe('/insights');
    expect(m['fr-FR']).toBe('/insights');
    expect(m['x-default']).toBe('/insights');
  });

  it('hreflangMap respecte un path déjà préfixé /', () => {
    const m = hreflangMap('/livre');
    expect(m['fr-CI']).toBe('/livre');
  });

  it('alternatesFor : canonical + languages hreflang sur le même path', () => {
    const a = alternatesFor('/solutions/sentinelbtp');
    expect(a.canonical).toBe('/solutions/sentinelbtp');
    expect(a.languages['fr-CI']).toBe('/solutions/sentinelbtp');
    expect(a.languages['fr-FR']).toBe('/solutions/sentinelbtp');
    expect(a.languages['x-default']).toBe('/solutions/sentinelbtp');
  });

  it('alternatesFor normalise le slash de tête', () => {
    expect(alternatesFor('contact').canonical).toBe('/contact');
  });
});

describe('hreflang appliqué aux pages (alternates.languages)', () => {
  it('la home (app/layout) expose le hreflang', async () => {
    const { metadata } = await import('@/app/layout');
    const langs = (metadata.alternates?.languages ?? {}) as Record<
      string,
      string
    >;
    expect(langs['fr-CI']).toBeDefined();
    expect(langs['x-default']).toBeDefined();
  });

  it('une page statique (contact) hérite désormais du hreflang', async () => {
    const { metadata } = await import('@/app/(site)/contact/page');
    const langs = (metadata.alternates?.languages ?? {}) as Record<
      string,
      string
    >;
    expect(langs['fr-CI']).toBe('/contact');
  });

  it('le hub Insights garde le flux RSS ET ajoute le hreflang (page 1)', async () => {
    const { generateMetadata } = await import('@/app/(site)/insights/page');
    const meta = await generateMetadata({
      searchParams: Promise.resolve({}),
    });
    const alt = meta.alternates ?? {};
    const langs = (alt.languages ?? {}) as Record<string, string>;
    expect(langs['fr-CI']).toBe('/insights');
    // Le type RSS n'a pas été perdu lors de la fusion.
    const types = (alt.types ?? {}) as Record<string, unknown>;
    expect(types['application/rss+xml']).toBe('/feed.xml');
  });

  it('le hub Insights se canonicalise vers la page paginée (page 2+)', async () => {
    const { generateMetadata } = await import('@/app/(site)/insights/page');
    const meta = await generateMetadata({
      searchParams: Promise.resolve({ page: '2' }),
    });
    const alt = meta.alternates ?? {};
    expect(alt.canonical).toBe('/insights?page=2');
    const langs = (alt.languages ?? {}) as Record<string, string>;
    expect(langs['x-default']).toBe('/insights?page=2');
    expect(String(meta.title)).toMatch(/page 2/);
  });
});
