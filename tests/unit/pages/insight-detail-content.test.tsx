import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Article, ArticleContent } from '@/lib/articles';

vi.mock('@/components/sections/AuditIaCtaServer', () => ({
  AuditIaCtaServer: () => <div data-testid="audit-ia-cta" />,
}));

// Shiki (server-only) mocké : la page crée le rendu de code via
// createCodeRenderer. On évite le chargement réel des grammaires en test.
vi.mock('@/lib/insights/code-highlighter', () => ({
  createCodeRenderer: async () => (code: string) => `<pre>${code}</pre>`,
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

import InsightArticlePage, {
  generateMetadata,
} from '@/app/(site)/insights/[slug]/page';
import { getArticleBySlug } from '@/lib/articles-server';

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

  it('émet un JSON-LD Article', async () => {
    const { container } = render(
      await InsightArticlePage({
        params: Promise.resolve({ slug: 'article-complet' }),
      }),
    );
    const scripts = Array.from(
      container.querySelectorAll('script[type="application/ld+json"]'),
    );
    expect(scripts.some((s) => s.textContent?.includes('"Article"'))).toBe(
      true,
    );
  });
});

describe('generateMetadata /insights/[slug]', () => {
  it('expose title, canonical et openGraph pour un article publié', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'article-complet' }),
    });
    expect(String(meta.title)).toContain('Article complet de test');
    expect(meta.alternates?.canonical).toBe('/insights/article-complet');
    expect((meta.openGraph as { type?: string })?.type).toBe('article');
    expect(meta.robots).toBeUndefined();
  });

  it('retourne un titre « introuvable » si l’article est absent', async () => {
    vi.mocked(getArticleBySlug).mockResolvedValueOnce(null);
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'inconnu' }),
    });
    expect(String(meta.title)).toMatch(/introuvable/i);
  });
});

describe('Page /insights/[slug] — article absent', () => {
  it('déclenche notFound() quand le slug est introuvable', async () => {
    vi.mocked(getArticleBySlug).mockResolvedValueOnce(null);
    await expect(
      InsightArticlePage({ params: Promise.resolve({ slug: 'inconnu' }) }),
    ).rejects.toThrow();
  });
});
