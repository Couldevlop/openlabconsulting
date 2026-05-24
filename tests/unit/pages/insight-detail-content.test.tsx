import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Article, ArticleContent } from '@/lib/articles';

vi.mock('@/components/sections/AuditIaCtaServer', () => ({
  AuditIaCtaServer: () => <div data-testid="audit-ia-cta" />,
}));

function text(value: string): Record<string, unknown> {
  return {
    type: 'text',
    text: value,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  };
}

function heading(tag: string, value: string): Record<string, unknown> {
  return {
    type: 'heading',
    tag,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [text(value)],
  };
}

const content = {
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      heading('h2', 'Premier'),
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [text('Un paragraphe de corps.')],
      },
      heading('h2', 'Deuxième'),
    ],
  },
} as unknown as ArticleContent;

const fullArticle: Article = {
  slug: 'article-complet',
  title: 'Article complet de test',
  excerpt: 'Une accroche de test.',
  category: 'data-gouvernance',
  categoryLabel: 'Data & gouvernance',
  author: 'Laboratoire OpenLab',
  publishedAt: 'Mai 2026',
  isoDate: '2026-05-10',
  cover: { src: null, alt: 'alt' },
  summary: ['Point clé un', 'Point clé deux'],
  sources: [{ label: 'Source X', url: 'https://x.example' }],
  readingTime: 5,
  content,
};

vi.mock('@/lib/articles-server', () => ({
  getArticleBySlug: vi.fn(async () => fullArticle),
}));

import InsightArticlePage from '@/app/(site)/insights/[slug]/page';

async function renderPage(): Promise<void> {
  const params = Promise.resolve({ slug: 'article-complet' });
  render(await InsightArticlePage({ params }));
}

describe('Page /insights/[slug] — article avec contenu', () => {
  it('affiche le temps de lecture', async () => {
    await renderPage();
    expect(screen.getByText(/5 min de lecture/)).toBeInTheDocument();
  });

  it('affiche le bloc « À retenir » et ses points', async () => {
    await renderPage();
    expect(screen.getByText('À retenir')).toBeInTheDocument();
    expect(screen.getByText('Point clé un')).toBeInTheDocument();
  });

  it('rend le corps Lexical (titres ancrés)', async () => {
    const { container } = render(
      await InsightArticlePage({
        params: Promise.resolve({ slug: 'article-complet' }),
      }),
    );
    expect(container.querySelector('h2#premier')).not.toBeNull();
    expect(container.querySelector('h2#deuxieme')).not.toBeNull();
  });

  it('affiche un sommaire avec ancres quand ≥ 2 titres', async () => {
    await renderPage();
    expect(screen.getByText('Sommaire')).toBeInTheDocument();
    const toc = screen.getByRole('complementary', { name: 'Sommaire' });
    const links = Array.from(toc.querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toContain('#premier');
    expect(links).toContain('#deuxieme');
  });

  it('liste les sources avec liens sûrs', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { name: 'Sources' }),
    ).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Source X' });
    expect(link.getAttribute('href')).toBe('https://x.example');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer nofollow');
  });
});
