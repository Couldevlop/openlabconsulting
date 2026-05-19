import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CasClient } from '@/components/sections/CasClient';

describe('CasClient (homepage §6.5 — SYGESCOM avant/après)', () => {
  it('rend la section labellée par son h2', () => {
    render(<CasClient />);
    const section = screen.getByRole('region', {
      name: /Un réseau de stations.*remis sous contrôle/i,
    });
    expect(section.getAttribute('data-testid')).toBe('cas-client');
  });

  it('affiche l’eyebrow "Cas client · SYGESCOM"', () => {
    render(<CasClient />);
    expect(screen.getByText(/Cas client · SYGESCOM/i)).toBeInTheDocument();
  });

  it('affiche le secteur et la durée', () => {
    render(<CasClient />);
    expect(
      screen.getByText(/Distribution d’hydrocarbures.*Afrique de l’Ouest/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Déploiement en moins de 3 mois/i),
    ).toBeInTheDocument();
  });

  it('rend 2 figures avant/après en placeholders (src null)', () => {
    render(<CasClient />);
    const section = screen.getByTestId('cas-client');
    // Le placeholder est un div role=img — on s'attend à au moins 2 dans la section.
    const placeholders = within(section).getAllByRole('img');
    expect(placeholders.length).toBeGreaterThanOrEqual(2);
    expect(within(section).getByText(/Capture avant/i)).toBeInTheDocument();
    expect(within(section).getByText(/Capture après/i)).toBeInTheDocument();
  });

  it('expose les 3 résultats sourcés (aucun chiffre rond non sourcé)', () => {
    render(<CasClient />);
    // On vérifie via les valeurs + sources qui sont uniques au bandeau
    // résultats (les libellés peuvent réapparaître dans la narration).
    expect(screen.getByText(/−12 %/)).toBeInTheDocument();
    expect(screen.getByText(/sur 3 mois d’exploitation/i)).toBeInTheDocument();

    expect(screen.getByText(/< 3 mois/)).toBeInTheDocument();
    expect(screen.getByText(/retour sur investissement/i)).toBeInTheDocument();
    expect(screen.getByText(/CAPEX déploiement amorti/i)).toBeInTheDocument();

    expect(screen.getByText(/24\/7/)).toBeInTheDocument();
    expect(screen.getByText(/stations supervisées/i)).toBeInTheDocument();
    expect(screen.getByText(/temps réel centralisé/i)).toBeInTheDocument();
  });

  it('expose le CTA secondaire vers /solutions/sygescom', () => {
    render(<CasClient />);
    const cta = screen.getByRole('link', { name: /Voir le cas complet/i });
    expect(cta.getAttribute('href')).toBe('/solutions/sygescom');
  });
});
