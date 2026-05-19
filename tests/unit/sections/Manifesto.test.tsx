import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Manifesto } from '@/components/sections/Manifesto';

describe('Manifesto (homepage §6.7 — éditorial)', () => {
  it('rend la section labellée par son h2', () => {
    render(<Manifesto />);
    const section = screen.getByRole('region', {
      name: /Cette fois.*l’Afrique n’a plus d’excuse/i,
    });
    expect(section.getAttribute('data-testid')).toBe('manifesto');
  });

  it('porte le titre signature §18', () => {
    render(<Manifesto />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.id).toBe('manifesto-title');
    expect(heading.textContent).toMatch(/Cette fois/);
    expect(heading.textContent).toMatch(/l’Afrique n’a plus d’excuse/);
  });

  it('affiche l’intro et la conclusion en éditorial Fraunces', () => {
    render(<Manifesto />);
    expect(screen.getByText(/Pendant trente ans/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ce n’est pas un manifeste pour 2035/i),
    ).toBeInTheDocument();
  });

  it('rend 3 stances numérotées en réponse à 3 excuses', () => {
    render(<Manifesto />);
    const section = screen.getByTestId('manifesto');
    const list = within(section).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);

    expect(within(section).getByText('01')).toBeInTheDocument();
    expect(within(section).getByText('02')).toBeInTheDocument();
    expect(within(section).getByText('03')).toBeInTheDocument();

    expect(
      within(section).getByText(/On n’a pas les outils/i),
    ).toBeInTheDocument();
    expect(
      within(section).getByText(/On n’a pas la recherche/i),
    ).toBeInTheDocument();
    expect(
      within(section).getByText(/On n’a pas la souveraineté/i),
    ).toBeInTheDocument();
  });

  it('signe par la CEO et la date', () => {
    render(<Manifesto />);
    expect(screen.getByText(/Debora Ahouma/i)).toBeInTheDocument();
    expect(screen.getByText(/Fondatrice.*CEO/i)).toBeInTheDocument();
    expect(screen.getByText(/Abidjan.*Mai 2026/i)).toBeInTheDocument();
  });

  it('utilise <ol> (séquence ordonnée des stances)', () => {
    render(<Manifesto />);
    const section = screen.getByTestId('manifesto');
    const list = within(section).getByRole('list');
    expect(list.tagName).toBe('OL');
  });
});
