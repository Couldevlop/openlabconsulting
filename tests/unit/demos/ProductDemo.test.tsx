import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductDemo, hasProductDemo } from '@/components/demos/ProductDemo';

describe('ProductDemo (router de démo par slug)', () => {
  it('route vers NexusRhDemo pour le slug "nexusrh"', () => {
    render(<ProductDemo slug="nexusrh" />);
    expect(screen.getByTestId('nexusrh-net')).toBeInTheDocument();
  });

  it('route vers SygescomDemo pour le slug "sygescom"', () => {
    render(<ProductDemo slug="sygescom" />);
    expect(screen.getByText(/Live · 5 stations/i)).toBeInTheDocument();
  });

  it('route vers AgrosenseDemo pour le slug "agrosense"', () => {
    render(<ProductDemo slug="agrosense" />);
    expect(screen.getByText(/Coopérative Daloa/i)).toBeInTheDocument();
  });

  it('route vers FraudShieldDemo pour le slug "fraud-shield"', () => {
    render(<ProductDemo slug="fraud-shield" />);
    expect(screen.getByTestId('fraud-score')).toBeInTheDocument();
  });

  it('route vers QualitOsDemo pour le slug "qualitos"', () => {
    render(<ProductDemo slug="qualitos" />);
    expect(
      screen.getByRole('button', { name: /^Méthode$/ }),
    ).toBeInTheDocument();
  });

  it('route vers NexusErpDemo pour le slug "nexuserp"', () => {
    render(<ProductDemo slug="nexuserp" />);
    expect(screen.getByRole('tab', { name: 'XOF' })).toBeInTheDocument();
  });

  it('route vers SmartCityDemo pour le slug "smart-city"', () => {
    render(<ProductDemo slug="smart-city" />);
    expect(screen.getByText(/modèle prédictif J\+7/i)).toBeInTheDocument();
  });

  it('slug sans démo enregistrée (produit créé depuis l’admin) → rien, pas de crash', () => {
    const { container } = render(<ProductDemo slug="sentinelbtp" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hasProductDemo distingue slugs avec et sans démo', () => {
    expect(hasProductDemo('nexusrh')).toBe(true);
    expect(hasProductDemo('smart-city')).toBe(true);
    expect(hasProductDemo('sentinelbtp')).toBe(false);
    expect(hasProductDemo('')).toBe(false);
  });
});
