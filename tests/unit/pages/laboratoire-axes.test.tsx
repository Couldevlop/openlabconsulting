import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LaboratoireAxesPage from '@/app/(site)/laboratoire/axes/page';
import { RD_AXES } from '@/lib/data/laboratoire';

describe('Page /laboratoire/axes', () => {
  it('rend un h1 « Six pistes, huit produits »', () => {
    render(<LaboratoireAxesPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/Six pistes/i);
  });

  it('affiche tous les axes du dataset RD_AXES', () => {
    render(<LaboratoireAxesPage />);
    for (const axe of RD_AXES) {
      expect(screen.getByText(axe.title)).toBeInTheDocument();
    }
  });

  it('expose un lien retour vers /laboratoire', () => {
    render(<LaboratoireAxesPage />);
    const backLink = screen.getByRole('link', { name: /Hub Laboratoire/i });
    expect(backLink.getAttribute('href')).toBe('/laboratoire');
  });

  it('expose un lien vers les publications', () => {
    render(<LaboratoireAxesPage />);
    const link = screen.getByRole('link', { name: /Toutes les publications/i });
    expect(link.getAttribute('href')).toBe('/laboratoire/publications');
  });
});
