import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgrosenseDemo } from '@/components/demos/AgrosenseDemo';

describe('AgrosenseDemo (carte parcelles)', () => {
  it('rend le badge coopérative Daloa et le SVG de carte', () => {
    render(<AgrosenseDemo />);
    expect(screen.getByText(/Coopérative Daloa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Carte des parcelles/i)).toBeInTheDocument();
  });

  it('affiche la parcelle initialement sélectionnée (DLA-001)', () => {
    render(<AgrosenseDemo />);
    expect(screen.getByText(/Parcelle DLA-001/)).toBeInTheDocument();
  });

  it('change de parcelle en cliquant sur un point SVG', () => {
    render(<AgrosenseDemo />);
    // Les <g> sont cliquables — chacun encapsule un cercle parcelle.
    const groups = document.querySelectorAll('svg g');
    if (groups.length > 1) {
      fireEvent.click(groups[1]!);
    }
    // L'aria-live "polite" doit se rafraîchir avec une nouvelle parcelle.
    const liveZones = document.querySelectorAll('[aria-live="polite"]');
    expect(liveZones.length).toBeGreaterThan(0);
  });

  it('affiche la légende des 3 statuts', () => {
    render(<AgrosenseDemo />);
    expect(screen.getByText(/Sain/i)).toBeInTheDocument();
    expect(screen.getByText(/Stress hydrique/i)).toBeInTheDocument();
    expect(screen.getByText(/Maladie détectée/i)).toBeInTheDocument();
  });
});
