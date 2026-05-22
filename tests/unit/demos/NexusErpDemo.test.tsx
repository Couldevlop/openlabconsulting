import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NexusErpDemo } from '@/components/demos/NexusErpDemo';

describe('NexusErpDemo (dashboard multi-devises)', () => {
  it('rend le dashboard avec les 3 onglets devise', () => {
    render(<NexusErpDemo />);
    expect(screen.getByRole('tab', { name: 'XOF' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'EUR' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'USD' })).toBeInTheDocument();
  });

  it('XOF sélectionnée par défaut', () => {
    render(<NexusErpDemo />);
    const xof = screen.getByRole('tab', { name: 'XOF' });
    expect(xof.getAttribute('aria-selected')).toBe('true');
  });

  it('bascule sur EUR au clic', () => {
    render(<NexusErpDemo />);
    const eur = screen.getByRole('tab', { name: 'EUR' });
    fireEvent.click(eur);
    expect(eur.getAttribute('aria-selected')).toBe('true');
  });

  it('affiche les 3 KPIs (CA, marge, encours)', () => {
    render(<NexusErpDemo />);
    expect(screen.getByText(/CA consolidé/i)).toBeInTheDocument();
    expect(screen.getByText(/Marge brute/i)).toBeInTheDocument();
    expect(screen.getByText(/Encours clients/i)).toBeInTheDocument();
  });
});
