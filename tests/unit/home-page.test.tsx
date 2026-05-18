import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '@/app/page';

describe('HomePage (P2 — homepage §6)', () => {
  it('rend le Hero comme première section', () => {
    render(<HomePage />);
    expect(screen.getByTestId('hero')).toBeInTheDocument();
  });

  it('expose un seul h1 (le titre du Hero)', () => {
    render(<HomePage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toMatch(/L’IA, au service/);
  });

  it('le main porte l’ancre #main pour le skip-link', () => {
    render(<HomePage />);
    expect(screen.getByRole('main').id).toBe('main');
  });
});
