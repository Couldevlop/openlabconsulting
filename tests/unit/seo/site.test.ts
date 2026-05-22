import { describe, it, expect } from 'vitest';
import {
  HREFLANG_LOCALES,
  SITE,
  absoluteUrl,
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
});
