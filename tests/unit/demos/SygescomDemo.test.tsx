import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SygescomDemo } from '@/components/demos/SygescomDemo';

describe('SygescomDemo (supervision temps réel)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rend le badge live et le bouton pause', () => {
    render(<SygescomDemo />);
    expect(screen.getByText(/Live · 5 stations/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
  });

  it('affiche les 5 stations initiales', () => {
    render(<SygescomDemo />);
    expect(screen.getByText(/Cocody Riviera 3/)).toBeInTheDocument();
    expect(screen.getByText(/Yopougon Maroc/)).toBeInTheDocument();
    expect(screen.getByText(/Bouaké Belleville/)).toBeInTheDocument();
  });

  it('toggle pause/resume au clic du bouton', () => {
    render(<SygescomDemo />);
    const btn = screen.getByRole('button', { name: /Pause/i });
    fireEvent.click(btn);
    expect(
      screen.getByRole('button', { name: /Reprendre/i }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Reprendre/i }));
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
  });

  it('met à jour les volumes après tick du timer', () => {
    render(<SygescomDemo />);
    const initialKpi = document.body.textContent;
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // Quelque chose a bougé (volumes diminués / total vendu en hausse).
    expect(document.body.textContent).not.toBe(initialKpi);
  });
});
