import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Methodologie } from '@/components/sections/Methodologie';

describe('Methodologie (homepage + hub expertises — 3 axes)', () => {
  it('rend la section labellée par son h2', () => {
    render(<Methodologie />);
    const section = screen.getByRole('region', {
      name: /L’IA ne s’installe pas.*Elle s’adopte/i,
    });
    expect(section.getAttribute('data-testid')).toBe('methodologie');
  });

  it('porte le titre signature §18 (lead + highlight)', () => {
    render(<Methodologie />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.id).toBe('methodologie-title');
    expect(heading.textContent).toMatch(/L’IA ne s’installe pas/);
    expect(heading.textContent).toMatch(/Elle s’adopte/);
  });

  it('affiche l’eyebrow « Notre méthode » et l’intro', () => {
    render(<Methodologie />);
    expect(screen.getByText('Notre méthode')).toBeInTheDocument();
    expect(screen.getByText(/avantage compétitif réel/i)).toBeInTheDocument();
  });

  it('rend 3 axes numérotés avec leurs titres', () => {
    render(<Methodologie />);
    const section = screen.getByTestId('methodologie');
    const list = within(section).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);

    expect(within(section).getByText('01')).toBeInTheDocument();
    expect(within(section).getByText('02')).toBeInTheDocument();
    expect(within(section).getByText('03')).toBeInTheDocument();

    expect(
      within(section).getByText('Audit de maturité digitale'),
    ).toBeInTheDocument();
    expect(
      within(section).getByText('Choix des données & des secteurs'),
    ).toBeInTheDocument();
    expect(
      within(section).getByText('Stratégie d’adoption effective'),
    ).toBeInTheDocument();
  });

  it('utilise <ol> (séquence ordonnée des axes)', () => {
    render(<Methodologie />);
    const section = screen.getByTestId('methodologie');
    const list = within(section).getByRole('list');
    expect(list.tagName).toBe('OL');
  });

  it('expose le CTA primaire vers /audit-ia', () => {
    render(<Methodologie />);
    const cta = screen.getByRole('link', { name: /Demander un audit IA/i });
    expect(cta.getAttribute('href')).toBe('/audit-ia');
  });
});
