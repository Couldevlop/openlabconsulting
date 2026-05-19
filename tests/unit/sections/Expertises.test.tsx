import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Expertises } from '@/components/sections/Expertises';

const EXPECTED = [
  { title: /Conseil & stratégie IA/i, href: '/expertises/conseil-strategie' },
  {
    title: /Agents & automatisation/i,
    href: '/expertises/agents-automatisation',
  },
  { title: /Data & gouvernance/i, href: '/expertises/data-gouvernance' },
  { title: /Cybersécurité augmentée/i, href: '/expertises/cybersecurite-ia' },
];

describe('Expertises (homepage §6.3)', () => {
  it('rend la section labellée par son h2', () => {
    render(<Expertises />);
    const section = screen.getByRole('region', {
      name: /faire de l’IA un.*levier mesurable/i,
    });
    expect(section.getAttribute('data-testid')).toBe('expertises');
  });

  it('affiche l’eyebrow + le h2 + la baseline', () => {
    render(<Expertises />);
    expect(screen.getByText(/Ce que nous transformons/i)).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.id).toBe('expertises-title');
    expect(screen.getByText(/Pas un PoC en sandbox/i)).toBeInTheDocument();
  });

  it('expose 4 cards dans une <ul>', () => {
    render(<Expertises />);
    const section = screen.getByTestId('expertises');
    const list = within(section).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
  });

  it.each(EXPECTED)(
    'card "$href" pointe vers la bonne page expertise',
    ({ title, href }) => {
      render(<Expertises />);
      const link = screen.getByRole('link', { name: title });
      expect(link.getAttribute('href')).toBe(href);
    },
  );

  it('chaque card a une icône Lucide (svg)', () => {
    render(<Expertises />);
    const section = screen.getByTestId('expertises');
    const articles = within(section).getAllByRole('article');
    expect(articles).toHaveLength(4);
    for (const article of articles) {
      expect(article.querySelector('svg')).not.toBeNull();
    }
  });

  it('affiche le micro-CTA "Voir le détail" dans chaque card', () => {
    render(<Expertises />);
    expect(screen.getAllByText(/Voir le détail/i)).toHaveLength(4);
  });
});
