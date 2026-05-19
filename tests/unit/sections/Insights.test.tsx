import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Insights } from '@/components/sections/Insights';

const EXPECTED_ARTICLES = [
  {
    slug: 'migration-ia-souveraine-k3s-hetzner',
    title: /Migration vers une IA souveraine/i,
    category: /Souveraineté/i,
    author: /Debora Ahouma/i,
    iso: '2026-05-01',
  },
  {
    slug: 'cnps-its-fdfp-conformite-sirh-ivoirien',
    title: /CNPS, ITS, FDFP/i,
    category: /Conformité RH/i,
    author: /Équipe NexusRH/i,
    iso: '2026-04-15',
  },
  {
    slug: 'fraude-documentaire-ia-banques-assurances',
    title: /Détection de fraude documentaire/i,
    category: /Cybersécurité/i,
    author: /Équipe Fraud Shield/i,
    iso: '2026-03-20',
  },
];

describe('Insights (homepage §6.9)', () => {
  it('rend la section labellée par son h2', () => {
    render(<Insights />);
    const section = screen.getByRole('region', {
      name: /Notre lecture du.*terrain africain/i,
    });
    expect(section.getAttribute('data-testid')).toBe('insights');
  });

  it('affiche eyebrow + baseline + CTA "Tous les insights"', () => {
    render(<Insights />);
    expect(screen.getByText(/^Insights$/i)).toBeInTheDocument();
    expect(screen.getByText(/Pas des billets d’opinion/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Tous les insights/i }),
    ).toHaveAttribute('href', '/insights');
  });

  it('rend exactement 3 articles dans une <ul>', () => {
    render(<Insights />);
    const section = screen.getByTestId('insights');
    const list = within(section).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it.each(EXPECTED_ARTICLES)(
    'article "$slug" : titre + href + catégorie + auteur',
    ({ slug, title, category, author }) => {
      render(<Insights />);
      const link = screen.getByRole('link', { name: title });
      expect(link.getAttribute('href')).toBe(`/insights/${slug}`);

      const card = link.querySelector('article');
      expect(card).not.toBeNull();
      expect(within(card!).getByText(category)).toBeInTheDocument();
      expect(within(card!).getByText(author)).toBeInTheDocument();
    },
  );

  it('chaque article a une <time datetime> sémantique', () => {
    render(<Insights />);
    const section = screen.getByTestId('insights');
    const times = section.querySelectorAll('time[datetime]');
    expect(times).toHaveLength(3);
    for (const a of EXPECTED_ARTICLES) {
      const t = Array.from(times).find(
        (el) => el.getAttribute('datetime') === a.iso,
      );
      expect(t).toBeDefined();
    }
  });

  it('chaque article a une couverture en MediaPlaceholder (src null)', () => {
    render(<Insights />);
    const section = screen.getByTestId('insights');
    const articles = within(section).getAllByRole('article');
    expect(articles).toHaveLength(3);
    for (const article of articles) {
      // Le MediaPlaceholder rend un div role=img avec aria-label terminant
      // par "capture à venir".
      const cover = within(article).getByRole('img');
      expect(cover.getAttribute('aria-label') ?? '').toMatch(
        /capture à venir/i,
      );
    }
  });
});
