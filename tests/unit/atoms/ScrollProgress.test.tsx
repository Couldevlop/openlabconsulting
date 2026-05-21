import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScrollProgress } from '@/components/atoms/ScrollProgress';

describe('ScrollProgress atom', () => {
  it('rend une barre fixed en haut de page', () => {
    render(<ScrollProgress />);
    const bar = screen.getByTestId('scroll-progress');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(bar).toHaveAttribute('role', 'presentation');
  });

  it('utilise pointer-events: none (n’intercepte pas les clicks)', () => {
    render(<ScrollProgress />);
    const bar = screen.getByTestId('scroll-progress');
    expect(bar.className).toContain('pointer-events-none');
  });

  it('positionné fixed top-0 avec z-index élevé', () => {
    render(<ScrollProgress />);
    const bar = screen.getByTestId('scroll-progress');
    expect(bar.className).toContain('fixed');
    expect(bar.className).toContain('top-0');
    expect(bar.className).toContain('z-[60]');
  });
});
