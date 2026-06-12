import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LaboratoirePartenariatsPage from '@/app/(site)/laboratoire/partenariats/page';
import { PARTENARIATS } from '@/lib/data/laboratoire';

describe('Page /laboratoire/partenariats', () => {
  it('rend un h1 mentionnant « ne marchent jamais seules »', async () => {
    render(await LaboratoirePartenariatsPage());
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/ne marchent jamais seules/i);
  });

  it('affiche tous les partenaires du dataset', async () => {
    render(await LaboratoirePartenariatsPage());
    for (const p of PARTENARIATS) {
      expect(screen.getByText(p.title)).toBeInTheDocument();
    }
  });

  it('expose un lien retour vers /laboratoire', async () => {
    render(await LaboratoirePartenariatsPage());
    const backLink = screen.getByRole('link', { name: /Hub Laboratoire/i });
    expect(backLink.getAttribute('href')).toBe('/laboratoire');
  });
});
