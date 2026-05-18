import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '@/components/atoms/Logo';

describe('Logo', () => {
  it('rend le SVG avec aria-label', () => {
    render(<Logo />);
    expect(
      screen.getByRole('img', { name: /OpenLab Consulting/i }),
    ).toBeInTheDocument();
  });

  it('affiche le wordmark par défaut', () => {
    render(<Logo />);
    expect(screen.getByText(/OpenLab/)).toBeInTheDocument();
  });

  it('masque le wordmark si withWordmark=false', () => {
    render(<Logo withWordmark={false} />);
    expect(screen.queryByText(/OpenLab/)).not.toBeInTheDocument();
  });
});
