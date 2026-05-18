import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('rend les 4 colonnes thématiques', () => {
    render(<Footer />);
    expect(
      screen.getByRole('navigation', { name: 'Expertises' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Solutions' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Ressources' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'OpenLab' }),
    ).toBeInTheDocument();
  });

  it('expose les coordonnées Abidjan', () => {
    render(<Footer />);
    expect(screen.getByText(/Cocody, Abidjan/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /\+225 07 09 33 42 38/ }),
    ).toHaveAttribute('href', 'tel:+2250709334238');
    expect(
      screen.getByRole('link', { name: /infos@openlabconsulting.com/i }),
    ).toHaveAttribute('href', 'mailto:infos@openlabconsulting.com');
  });

  it('inclut mentions légales et politique de confidentialité', () => {
    render(<Footer />);
    expect(
      screen.getByRole('link', { name: /Mentions légales/i }),
    ).toHaveAttribute('href', '/mentions-legales');
    expect(
      screen.getByRole('link', { name: /Confidentialité/i }),
    ).toHaveAttribute('href', '/politique-confidentialite');
  });

  it('affiche le RCCM', () => {
    render(<Footer />);
    expect(screen.getByText(/CI-ABJ-03-2022-B13-03239/)).toBeInTheDocument();
  });
});
