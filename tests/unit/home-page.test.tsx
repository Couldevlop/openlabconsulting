import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '@/app/page';

describe('HomePage (P0 placeholder)', () => {
  it('rend le titre du scaffold', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        name: /Site OpenLab Consulting — scaffold initial/i,
      }),
    ).toBeInTheDocument();
  });

  it('annonce P0 en eyebrow', () => {
    render(<HomePage />);
    expect(screen.getByText(/P0 — Fondations/i)).toBeInTheDocument();
  });
});
