import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Article } from '@/lib/articles';

vi.mock('@/components/sections/AuditIaCta', () => ({
  AuditIaCta: () => <div data-testid="audit-ia-cta" />,
}));

const { getPagedArticlesMock } = vi.hoisted(() => ({
  getPagedArticlesMock: vi.fn(),
}));
vi.mock('@/lib/articles-server', () => ({
  getPagedArticles: getPagedArticlesMock,
}));

import InsightsHubPage from '@/app/(site)/insights/page';

function article(slug: string): Article {
  return {
    slug,
    title: `Titre ${slug}`,
    excerpt: 'Accroche',
    category: 'agents-ia',
    categoryLabel: 'Agents & IA',
    author: 'OpenLab',
    publishedAt: 'Mai 2026',
    isoDate: '2026-05-01',
    cover: { src: null, alt: 'a' },
    summary: [],
    sources: [],
    readingTime: 0,
    content: null,
  };
}

describe('Page /insights — pagination', () => {
  it('page intermédiaire : liens Précédent et Suivant actifs', async () => {
    getPagedArticlesMock.mockResolvedValue({
      articles: [article('a'), article('b')],
      page: 2,
      totalPages: 3,
    });
    render(
      await InsightsHubPage({ searchParams: Promise.resolve({ page: '2' }) }),
    );
    expect(screen.getByText('Page 2 / 3')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Précédent/ }).getAttribute('href'),
    ).toBe('/insights?page=1');
    expect(
      screen.getByRole('link', { name: /Suivant/ }).getAttribute('href'),
    ).toBe('/insights?page=3');
  });

  it('première page : Précédent désactivé (pas de lien)', async () => {
    getPagedArticlesMock.mockResolvedValue({
      articles: [article('a')],
      page: 1,
      totalPages: 3,
    });
    render(await InsightsHubPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.queryByRole('link', { name: /Précédent/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Suivant/ }).getAttribute('href'),
    ).toBe('/insights?page=2');
  });

  it('dernière page : Suivant désactivé (pas de lien)', async () => {
    getPagedArticlesMock.mockResolvedValue({
      articles: [article('a')],
      page: 3,
      totalPages: 3,
    });
    render(
      await InsightsHubPage({ searchParams: Promise.resolve({ page: '3' }) }),
    );
    expect(
      screen.queryByRole('link', { name: /Suivant/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Précédent/ }).getAttribute('href'),
    ).toBe('/insights?page=2');
  });
});
