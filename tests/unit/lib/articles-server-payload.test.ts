import { describe, it, expect } from 'vitest';
import {
  getArticleBySlug,
  getPublishedArticles,
  toArticle,
  type RawPayloadArticle,
} from '@/lib/articles-server';
import { FALLBACK_ARTICLES } from '@/lib/articles';

/** Contenu Lexical minimal valide pour exercer le calcul de readingTime. */
const sampleContent = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'un deux trois quatre cinq' }],
      },
    ],
  },
} as unknown as RawPayloadArticle['content'];

function baseDoc(): RawPayloadArticle {
  return {
    slug: 'mon-article',
    title: 'Mon article',
    excerpt: 'Une accroche',
    author: 'OpenLab',
    category: 'data-gouvernance',
    publishedAt: '2026-05-10T00:00:00.000Z',
  };
}

describe('toArticle — mapping document Payload', () => {
  it('mappe un document complet et normalise summary/sources/content', () => {
    const a = toArticle({
      ...baseDoc(),
      summary: [{ point: 'Point A' }, { point: '   ' }, { notpoint: 1 }],
      sources: [
        { label: 'Bon', url: 'https://ok.example' },
        { label: 'Mauvais protocole', url: 'ftp://nope' },
        { label: 'Aussi bon', url: 'http://ok2.example' },
        { label: 'Sans url' },
      ],
      content: sampleContent,
      cover: { url: '/img.png', alt: 'Une image' },
    });

    expect(a).not.toBeNull();
    expect(a?.summary).toEqual(['Point A']); // vide + invalide filtrés
    expect(a?.sources).toEqual([
      { label: 'Bon', url: 'https://ok.example' },
      { label: 'Aussi bon', url: 'http://ok2.example' },
    ]);
    expect(a?.content).not.toBeNull();
    expect(a?.readingTime).toBeGreaterThan(0);
    expect(a?.cover).toEqual({ src: '/img.png', alt: 'Une image' });
    expect(a?.categoryLabel).toBe('Data & gouvernance');
  });

  it('renvoie null si un champ obligatoire manque ou est invalide', () => {
    expect(toArticle({ ...baseDoc(), title: undefined })).toBeNull();
    expect(toArticle({ ...baseDoc(), category: 'inexistante' })).toBeNull();
  });

  it('applique des valeurs par défaut quand summary/sources/content sont absents', () => {
    const a = toArticle(baseDoc());
    expect(a?.summary).toEqual([]);
    expect(a?.sources).toEqual([]);
    expect(a?.content).toBeNull();
    expect(a?.readingTime).toBe(0);
  });

  it('ignore summary/sources non tableaux et cover non-média', () => {
    const a = toArticle({
      ...baseDoc(),
      summary: 'pas un tableau' as unknown as RawPayloadArticle['summary'],
      sources: 42 as unknown as RawPayloadArticle['sources'],
      cover: 'media-id-string',
    });
    expect(a?.summary).toEqual([]);
    expect(a?.sources).toEqual([]);
    expect(a?.cover.src).toBeNull();
  });

  it('utilise la date du jour si publishedAt est absent', () => {
    const a = toArticle({ ...baseDoc(), publishedAt: undefined });
    expect(a?.isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

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

  it('getArticleBySlug en mode draft ne retombe pas sur le fallback (Payload down → null)', async () => {
    const a = await getArticleBySlug('migration-ia-souveraine-k3s-hetzner', {
      draft: true,
    });
    expect(a).toBeNull();
  });
});
