import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QualitOsDemo } from '@/components/demos/QualitOsDemo';

describe('QualitOsDemo (Ishikawa 5M)', () => {
  it('rend les 5 branches du diagramme', () => {
    render(<QualitOsDemo />);
    expect(
      screen.getByRole('button', { name: /^Méthode$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Milieu$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Main d['’]œuvre/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Matière$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Matériel$/ }),
    ).toBeInTheDocument();
  });

  it('affiche les causes au clic d’une branche', () => {
    render(<QualitOsDemo />);
    const methode = screen.getByRole('button', { name: /^Méthode$/ });
    fireEvent.click(methode);
    expect(
      screen.getByText(/Procédure ISO non appliquée/i),
    ).toBeInTheDocument();
  });

  it('toggle off au second clic sur la même branche', () => {
    render(<QualitOsDemo />);
    const methode = screen.getByRole('button', { name: /^Méthode$/ });
    fireEvent.click(methode);
    expect(screen.queryByText(/Procédure ISO non appliquée/i)).not.toBeNull();
    fireEvent.click(methode);
    expect(screen.queryByText(/Procédure ISO non appliquée/i)).toBeNull();
  });

  it('liste les 3 analyses IA Claude', () => {
    render(<QualitOsDemo />);
    expect(screen.getByText(/Lot matière hors-spec/i)).toBeInTheDocument();
    expect(screen.getByText(/Calibration capteur pH/i)).toBeInTheDocument();
  });
});
