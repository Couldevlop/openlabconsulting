import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FraudShieldDemo } from '@/components/demos/FraudShieldDemo';

describe('FraudShieldDemo (analyse documents)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rend les 3 cas représentatifs', () => {
    render(<FraudShieldDemo />);
    expect(screen.getByText(/CNI conforme/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Attestation bancaire douteuse/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Facture manipulée/i)).toBeInTheDocument();
  });

  it('affiche le score initial 94 (CNI conforme)', () => {
    render(<FraudShieldDemo />);
    expect(screen.getByTestId('fraud-score')).toBeInTheDocument();
  });

  it('lance l’analyse au clic d’un cas', () => {
    render(<FraudShieldDemo />);
    const fraudCase = screen.getByText(/Facture manipulée/i);
    fireEvent.click(fraudCase);
    // En cours d'analyse → progressbar visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('termine l’analyse après ~1500ms', () => {
    render(<FraudShieldDemo />);
    const fraudCase = screen.getByText(/Facture manipulée/i);
    fireEvent.click(fraudCase);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // L'analyse est terminée → plus de progressbar.
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
