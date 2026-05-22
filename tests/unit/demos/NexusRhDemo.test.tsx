import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NexusRhDemo } from '@/components/demos/NexusRhDemo';

describe('NexusRhDemo (simulateur paie)', () => {
  it('rend le formulaire avec brut + statut + enfants', () => {
    render(<NexusRhDemo />);
    expect(screen.getByLabelText(/Salaire brut en F CFA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Statut/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre d['’]enfants/i)).toBeInTheDocument();
  });

  it('affiche le net calculé (data-testid nexusrh-net)', () => {
    render(<NexusRhDemo />);
    expect(screen.getByTestId('nexusrh-net')).toBeInTheDocument();
  });

  it('met à jour le net quand on change le brut', () => {
    render(<NexusRhDemo />);
    const brutInput = screen.getByLabelText(/Salaire brut en F CFA/i);
    const netInitial = screen.getByTestId('nexusrh-net').textContent;
    fireEvent.change(brutInput, { target: { value: '1000000' } });
    const netAfter = screen.getByTestId('nexusrh-net').textContent;
    expect(netAfter).not.toBe(netInitial);
  });

  it('change le statut sans throw', () => {
    render(<NexusRhDemo />);
    const statut = screen.getByLabelText(/Statut/i);
    fireEvent.change(statut, { target: { value: 'apprenti' } });
    expect((statut as HTMLSelectElement).value).toBe('apprenti');
  });

  it('clamp les enfants à 0-10', () => {
    render(<NexusRhDemo />);
    const enfants = screen.getByLabelText(/Nombre d['’]enfants/i);
    fireEvent.change(enfants, { target: { value: '20' } });
    expect((enfants as HTMLInputElement).value).toBe('10');
    fireEvent.change(enfants, { target: { value: '-5' } });
    expect((enfants as HTMLInputElement).value).toBe('0');
  });

  it('le brut tombe à 0 si saisie vide / non numérique', () => {
    render(<NexusRhDemo />);
    const brut = screen.getByLabelText(/Salaire brut en F CFA/i);
    fireEvent.change(brut, { target: { value: '' } });
    expect((brut as HTMLInputElement).value).toBe('0');
  });
});
