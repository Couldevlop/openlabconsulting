import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Livre } from '@/components/sections/Livre';

describe('Livre (homepage §6.8 — encart livre principal)', () => {
  it('rend la section sur fond night avec aria-labelledby', () => {
    render(<Livre />);
    const section = screen.getByRole('region', {
      name: /Intelligence Artificielle/i,
    });
    expect(section.getAttribute('data-testid')).toBe('livre');
    expect(section.className).toMatch(/bg-\[var\(--color-ol-night\)\]/);
  });

  it('affiche le titre + sous-titre + co-édition', () => {
    render(<Livre />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.id).toBe('livre-title');
    expect(heading.textContent).toMatch(/Intelligence Artificielle/);
    expect(
      screen.getByText(/Du Machine Learning aux Agents Autonomes/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/EXPERTISE-IA.*Grasse.*OpenLab.*Abidjan/i),
    ).toBeInTheDocument();
  });

  it('affiche le placeholder couverture (src null) avec alt explicite', () => {
    render(<Livre />);
    const cover = screen.getByRole('img', {
      name: /Couverture du livre.*Intelligence Artificielle.*capture à venir/i,
    });
    expect(cover).toBeInTheDocument();
    expect(within(cover).getByText(/Couverture du livre/i)).toBeInTheDocument();
  });

  it('expose les 4 publics cibles en badges', () => {
    render(<Livre />);
    const audienceList = screen.getByRole('list', {
      name: /Publics cibles du livre/i,
    });
    expect(within(audienceList).getAllByRole('listitem')).toHaveLength(4);
    expect(
      within(audienceList).getByText(/Étudiants ingénieurs/i),
    ).toBeInTheDocument();
    expect(
      within(audienceList).getByText(/Data scientists/i),
    ).toBeInTheDocument();
    expect(within(audienceList).getByText(/Dirigeants/i)).toBeInTheDocument();
    expect(within(audienceList).getByText(/Enseignants/i)).toBeInTheDocument();
  });

  it('expose les 3 CTAs aux bonnes routes', () => {
    render(<Livre />);
    expect(
      screen.getByRole('link', { name: /Acheter le livre/i }),
    ).toHaveAttribute('href', '/livre/acheter');
    expect(
      screen.getByRole('link', { name: /Lire un extrait gratuit/i }),
    ).toHaveAttribute('href', '/livre/extraits');
    expect(
      screen.getByRole('link', { name: /Réserver une conférence/i }),
    ).toHaveAttribute('href', '/contact?sujet=conference-livre');
  });

  it('respecte la règle "1 CTA primaire" : seul "Acheter" est primaire', () => {
    render(<Livre />);
    // Le CTA primaire utilise la variant orange (bg-ol-orange).
    const primaryCta = screen.getByRole('link', { name: /Acheter le livre/i });
    expect(primaryCta.className).toMatch(/color-ol-orange\)\]/);
  });
});
