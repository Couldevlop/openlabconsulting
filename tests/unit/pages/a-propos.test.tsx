import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AProposPage from '@/app/a-propos/page';

describe('Page /a-propos (async server)', () => {
  it('rend un h1 mentionnant « Cabinet ivoirien »', async () => {
    render(await AProposPage());
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/Cabinet ivoirien/i);
  });

  it('expose les 3 piliers (Conseil, R&D, Édition)', async () => {
    render(await AProposPage());
    expect(screen.getByText(/Conseil & Intégration IA/i)).toBeInTheDocument();
    expect(screen.getByText(/R&D Produits/i)).toBeInTheDocument();
    expect(screen.getByText(/Édition académique/i)).toBeInTheDocument();
  });

  it('expose un lien vers /contact', async () => {
    render(await AProposPage());
    const contactLinks = screen.getAllByRole('link', {
      name: /Nous contacter/i,
    });
    expect(contactLinks.length).toBeGreaterThan(0);
    expect(contactLinks[0]?.getAttribute('href')).toBe('/contact');
  });

  it('inclut la section AuditIaCta', async () => {
    render(await AProposPage());
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });
});
