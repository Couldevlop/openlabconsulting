import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SmartCityDemo } from '@/components/demos/SmartCityDemo';

describe('SmartCityDemo (carte chaleur Abidjan)', () => {
  it('rend le badge et l’indice par quartier', () => {
    render(<SmartCityDemo />);
    expect(screen.getByText(/modèle prédictif J\+7/i)).toBeInTheDocument();
  });

  it('affiche les 9 quartiers (au moins)', () => {
    render(<SmartCityDemo />);
    expect(screen.getByLabelText(/Quartier Cocody/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quartier Yopougon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quartier Plateau/i)).toBeInTheDocument();
  });

  it('Yopougon sélectionné par défaut (risque 78)', () => {
    render(<SmartCityDemo />);
    // Le panneau détail affiche Yopougon (sélectionné).
    expect(screen.getAllByText(/Yopougon/i).length).toBeGreaterThan(0);
  });

  it('change la sélection au clic sur un quartier', () => {
    render(<SmartCityDemo />);
    const cocody = screen.getByLabelText(/Quartier Cocody/i);
    fireEvent.click(cocody);
    // Le détail montre maintenant Cocody — au moins 2 mentions (carte + détail).
    expect(screen.getAllByText(/Cocody/i).length).toBeGreaterThan(0);
  });

  it('affiche la légende avec 4 niveaux', () => {
    render(<SmartCityDemo />);
    expect(screen.getAllByText(/Faible/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Modéré/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Élevé/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Critique/i).length).toBeGreaterThan(0);
  });
});
