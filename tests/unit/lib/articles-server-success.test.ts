import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Couvre le chemin « Payload disponible » de lib/articles-server, en
 * surchargeant les modules `payload` et `@payload-config` (normalement
 * stubbés pour throw → branche fallback). On vérifie ici le mapping
 * réel, le `select` de la liste et la branche `draft`.
 */
const findMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ find: findMock }),
}));

import {
  getPublishedArticles,
  getArticleBySlug,
  getRelatedArticles,
  getPagedArticles,
} from '@/lib/articles-server';
import { FALLBACK_ARTICLES } from '@/lib/articles';

function rawDoc(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'depuis-payload',
    title: 'Depuis Payload',
    excerpt: 'Accroche',
    author: 'OpenLab',
    category: 'agents-ia',
    publishedAt: '2026-05-01T00:00:00.000Z',
    summary: [{ point: 'Un point' }],
    sources: [{ label: 'Src', url: 'https://src.example' }],
    cover: { url: '/c.png', alt: 'cover' },
    ...overrides,
  };
}

beforeEach(() => {
  findMock.mockReset();
});

describe('getPublishedArticles — Payload disponible', () => {
  it('mappe les documents et applique un select sans le corps', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc()] });
    const articles = await getPublishedArticles(3);
    expect(articles[0]?.slug).toBe('depuis-payload');
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'articles' }),
    );
    // La liste ne demande pas le corps (`content`) mais demande `summary`.
    const arg = findMock.mock.calls[0]?.[0] as
      | { select: Record<string, unknown> }
      | undefined;
    expect(arg?.select.content).toBeUndefined();
    expect(arg?.select.summary).toBe(true);
  });

  it('retombe sur le fallback si la collection est vide', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const articles = await getPublishedArticles(3);
    expect(articles).toEqual(FALLBACK_ARTICLES.slice(0, 3));
  });
});

describe('getArticleBySlug — Payload disponible', () => {
  it('mappe le document publié trouvé', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc()] });
    const a = await getArticleBySlug('depuis-payload');
    expect(a?.title).toBe('Depuis Payload');
    expect(a?.sources).toEqual([{ label: 'Src', url: 'https://src.example' }]);
  });

  it('en mode draft, interroge avec draft + overrideAccess', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ slug: 'brouillon' })] });
    const a = await getArticleBySlug('brouillon', { draft: true });
    expect(a?.slug).toBe('brouillon');
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ draft: true, overrideAccess: true }),
    );
  });

  it('retombe sur le fallback (publié) si aucun document', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const a = await getArticleBySlug('migration-ia-souveraine-k3s-hetzner');
    expect(a?.slug).toBe('migration-ia-souveraine-k3s-hetzner');
  });
});

describe('getRelatedArticles — Payload disponible', () => {
  it('mappe les articles liés trouvés', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ slug: 'lie-1' })] });
    const r = await getRelatedArticles('agents-ia', 'courant', 3);
    expect(r[0]?.slug).toBe('lie-1');
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'articles', limit: 3 }),
    );
  });
});

describe('getPagedArticles — Payload disponible', () => {
  it('retourne la page demandée + le total de pages', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc()], totalPages: 5 });
    const p = await getPagedArticles(2, 9);
    expect(p.page).toBe(2);
    expect(p.totalPages).toBe(5);
    expect(p.articles[0]?.slug).toBe('depuis-payload');
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 9 }),
    );
  });
});
