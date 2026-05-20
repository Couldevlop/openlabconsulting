import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CasesCarousel } from '@/components/sections/CasesCarousel';

describe('CasesCarousel (homepage §6.5 enrichi)', () => {
  it('rend la section et son titre', () => {
    render(<CasesCarousel />);
    const region = screen.getByRole('region', {
      name: /Ce que ça donne sur le terrain/i,
    });
    expect(region.getAttribute('data-testid')).toBe('cases-carousel');
  });

  it('affiche le premier slide (SYGESCOM) par défaut', () => {
    render(<CasesCarousel />);
    expect(
      screen.getByText(/Pertes carburant divisées par 8/i),
    ).toBeInTheDocument();
  });

  it('avance au slide suivant via le bouton ←/→', async () => {
    render(<CasesCarousel />);
    const next = screen.getByRole('button', { name: /Cas suivant/i });
    fireEvent.click(next);
    // AnimatePresence mode="wait" → on attend la transition d'exit/enter.
    // Le slide NexusRH doit apparaître.
    expect(
      await screen.findByText(/Paie CNPS sans surprise d’audit/i),
    ).toBeInTheDocument();
  });

  it('expose 4 dots de navigation (un par cas)', () => {
    render(<CasesCarousel />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
  });

  it('permet la mise en pause manuelle', () => {
    render(<CasesCarousel />);
    const pauseBtn = screen.getByRole('button', { name: /Mettre en pause/i });
    fireEvent.click(pauseBtn);
    // Au clic, le bouton bascule en "Reprendre"
    expect(
      screen.getByRole('button', { name: /Reprendre la rotation/i }),
    ).toBeInTheDocument();
  });
});
