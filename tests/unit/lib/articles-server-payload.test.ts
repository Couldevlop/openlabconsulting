import { describe, it, expect } from 'vitest';
import { getArticleBySlug, getPublishedArticles } from '@/lib/articles-server';
import { FALLBACK_ARTICLES } from '@/lib/articles';

/**
 * Tests `lib/articles-server` — le chemin "Payload OK + parsing" ne
 * peut être testé en unitaire (alias Vite `@payload-config` throw
 * avant doMock). Couvert en intégration P6. Ici on vérifie le
 * fallback complet + getArticleBySlug.
 */
describe('lib/articles-server — fallback', () => {
  it('getPublishedArticles renvoie le fallback complet quand limit >= taille fallback', async () => {
    const articles = await getPublishedArticles(10);
    // Au minimum, le fallback est retourné (3 articles).
    expect(articles.length).toBeGreaterThanOrEqual(FALLBACK_ARTICLES.length);
  });

  it('getPublishedArticles tronque le fallback selon limit=1', async () => {
    const articles = await getPublishedArticles(1);
    expect(articles).toHaveLength(1);
  });

  it('getArticleBySlug retombe sur le fallback pour un slug connu', async () => {
    const a = await getArticleBySlug('migration-ia-souveraine-k3s-hetzner');
    expect(a).not.toBeNull();
    expect(a?.slug).toBe('migration-ia-souveraine-k3s-hetzner');
  });

  it('getArticleBySlug retourne null pour un slug totalement inconnu', async () => {
    const a = await getArticleBySlug('slug-inconnu-xyz');
    expect(a).toBeNull();
  });
});
