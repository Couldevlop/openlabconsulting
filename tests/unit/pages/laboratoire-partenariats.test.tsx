import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LaboratoirePartenariatsPage from '@/app/laboratoire/partenariats/page';
import { PARTENARIATS } from '@/lib/data/laboratoire';

describe('Page /laboratoire/partenariats', () => {
  it('rend un h1 mentionnant « ne marchent jamais seules »', () => {
    render(<LaboratoirePartenariatsPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/ne marchent jamais seules/i);
  });

  it('affiche tous les partenaires du dataset', () => {
    render(<LaboratoirePartenariatsPage />);
    for (const p of PARTENARIATS) {
      expect(screen.getByText(p.title)).toBeInTheDocument();
    }
  });

  it('expose un lien retour vers /laboratoire', () => {
    render(<LaboratoirePartenariatsPage />);
    const backLink = screen.getByRole('link', { name: /Hub Laboratoire/i });
    expect(backLink.getAttribute('href')).toBe('/laboratoire');
  });
});
