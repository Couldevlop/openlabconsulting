import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Article } from '@/lib/articles';

vi.mock('@/components/sections/AuditIaCtaServer', () => ({
  AuditIaCtaServer: () => <div data-testid="audit-ia-cta" />,
}));

// Shiki (server-only) mocké : évite le chargement réel des grammaires.
vi.mock('@/lib/insights/code-highlighter', () => ({
  createCodeRenderer: async () => (code: string) => `<pre>${code}</pre>`,
}));

// draftMode activé → la page doit afficher la bannière de prévisualisation.
vi.mock('next/headers', () => ({
  headers: async () => new Headers(),
  cookies: async () => new Map(),
  draftMode: async () => ({
    isEnabled: true,
    enable: vi.fn(),
    disable: vi.fn(),
  }),
}));

const draftArticle: Article = {
  slug: 'brouillon',
  title: 'Article en brouillon',
  excerpt: 'Pas encore publié.',
  category: 'agents-ia',
  categoryLabel: 'Agents & IA',
  author: 'OpenLab',
  publishedAt: 'Mai 2026',
  isoDate: '2026-05-20',
  cover: { src: null, alt: 'alt' },
  summary: [],
  sources: [],
  readingTime: 0,
  content: null,
};

vi.mock('@/lib/articles-server', () => ({
  getArticleBySlug: vi.fn(async () => draftArticle),
  getRelatedArticles: vi.fn(async () => []),
}));

import InsightArticlePage, {
  generateMetadata,
} from '@/app/(site)/insights/[slug]/page';

describe('generateMetadata — mode prévisualisation', () => {
  it('ajoute robots noindex/nofollow pour un brouillon', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'brouillon' }),
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});

describe('Page /insights/[slug] — mode prévisualisation', () => {
  it('affiche la bannière brouillon + lien de sortie', async () => {
    render(
      await InsightArticlePage({
        params: Promise.resolve({ slug: 'brouillon' }),
      }),
    );
    expect(screen.getByText(/Mode prévisualisation/)).toBeInTheDocument();
    const exit = screen.getByRole('link', { name: /Quitter l’aperçu/ });
    expect(exit.getAttribute('href')).toBe('/api/preview/exit');
  });

  it('affiche la boîte de repli quand le contenu est absent', async () => {
    render(
      await InsightArticlePage({
        params: Promise.resolve({ slug: 'brouillon' }),
      }),
    );
    expect(screen.getByText(/Contenu complet en ligne/)).toBeInTheDocument();
  });

  it('n’émet pas de JSON-LD Article sur un brouillon (noindex)', async () => {
    const { container } = render(
      await InsightArticlePage({
        params: Promise.resolve({ slug: 'brouillon' }),
      }),
    );
    const scripts = Array.from(
      container.querySelectorAll('script[type="application/ld+json"]'),
    );
    expect(scripts.some((s) => s.textContent?.includes('"Article"'))).toBe(
      false,
    );
  });
});
