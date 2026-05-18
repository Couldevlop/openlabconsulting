import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '@/app/page';

describe('HomePage (placeholder P1)', () => {
  it('rend le titre principal du shell', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /shell applicatif posé/i,
      }),
    ).toBeInTheDocument();
  });

  it('annonce la phase courante en eyebrow', () => {
    render(<HomePage />);
    expect(screen.getByText(/P1 — Design system/i)).toBeInTheDocument();
  });

  it('expose les deux CTA primaire/secondaire', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('link', { name: /Demander un audit IA/i }),
    ).toHaveAttribute('href', '/audit-ia');
    expect(
      screen.getByRole('link', { name: /Voir l’écosystème produits/i }),
    ).toHaveAttribute('href', '/solutions');
  });
});
