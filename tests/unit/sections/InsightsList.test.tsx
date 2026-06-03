import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InsightsList } from '@/components/sections/InsightsList';
import type { Article } from '@/lib/articles';

function makeArticle(n: number): Article {
  return {
    slug: `article-${n}`,
    title: `Article ${n}`,
    excerpt: `Accroche ${n}`,
    category: 'souverainete',
    categoryLabel: 'Souveraineté',
    author: 'OpenLab',
    publishedAt: 'janvier 2026',
    isoDate: '2026-01-01',
    cover: { src: null, alt: `Couverture ${n}` },
    summary: [],
    sources: [],
    readingTime: 3,
    content: null,
  };
}

describe('InsightsList — pagination « Voir plus »', () => {
  it('n’affiche que 3 cartes quand il y en a plus, avec un bouton', () => {
    render(
      <InsightsList
        articles={Array.from({ length: 7 }, (_, i) => makeArticle(i))}
      />,
    );
    expect(document.querySelectorAll('article')).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: /4 articles supplémentaires/i }),
    ).toBeInTheDocument();
  });

  it('révèle le reste des articles au clic sur « Voir plus »', () => {
    render(
      <InsightsList
        articles={Array.from({ length: 7 }, (_, i) => makeArticle(i))}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /articles supplémentaires/i }),
    );
    expect(document.querySelectorAll('article')).toHaveLength(7);
    // Le bouton disparaît une fois tout révélé.
    expect(
      screen.queryByRole('button', { name: /articles supplémentaires/i }),
    ).toBeNull();
  });

  it('n’affiche pas de bouton quand il y a 3 articles ou moins', () => {
    render(<InsightsList articles={[makeArticle(0), makeArticle(1)]} />);
    expect(document.querySelectorAll('article')).toHaveLength(2);
    expect(
      screen.queryByRole('button', { name: /articles supplémentaires/i }),
    ).toBeNull();
  });
});
