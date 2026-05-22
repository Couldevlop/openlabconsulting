import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LaboratoirePage from '@/app/laboratoire/page';

describe('Page /laboratoire', () => {
  it('rend un h1 mentionnant « qui publie »', () => {
    render(<LaboratoirePage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/qui publie/i);
  });

  it('expose les 3 axes (Solutions, Livre, Recherche appliquée)', () => {
    render(<LaboratoirePage />);
    expect(
      screen.getByText(/Sept logiciels propriétaires/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Édition académique/i)).toBeInTheDocument();
    expect(screen.getByText(/Recherche appliquée/i)).toBeInTheDocument();
  });

  it('expose un lien vers /solutions et /livre', () => {
    render(<LaboratoirePage />);
    const solutionsLinks = screen.getAllByRole('link', {
      name: /Voir l['’]écosystème/i,
    });
    expect(solutionsLinks[0]?.getAttribute('href')).toBe('/solutions');
    const livreLinks = screen.getAllByRole('link', {
      name: /Explorer le livre/i,
    });
    expect(livreLinks[0]?.getAttribute('href')).toBe('/livre');
  });

  it('inclut la section AuditIaCta', () => {
    render(<LaboratoirePage />);
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });
});
