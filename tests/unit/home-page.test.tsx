import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '@/app/page';

describe('HomePage (P2 — homepage §6)', () => {
  it('rend le Hero comme première section', () => {
    render(<HomePage />);
    expect(screen.getByTestId('hero')).toBeInTheDocument();
  });

  it('rend Reassurance juste après le Hero', () => {
    render(<HomePage />);
    expect(screen.getByTestId('reassurance')).toBeInTheDocument();
  });

  it('rend Expertises après Reassurance', () => {
    render(<HomePage />);
    expect(screen.getByTestId('expertises')).toBeInTheDocument();
  });

  it('rend Laboratoire après Expertises', () => {
    render(<HomePage />);
    expect(screen.getByTestId('laboratoire')).toBeInTheDocument();
  });

  it('respecte l’ordre Hero -> Reassurance -> Expertises -> Laboratoire', () => {
    render(<HomePage />);
    const hero = screen.getByTestId('hero');
    const reassurance = screen.getByTestId('reassurance');
    const expertises = screen.getByTestId('expertises');
    const laboratoire = screen.getByTestId('laboratoire');
    expect(
      hero.compareDocumentPosition(reassurance) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      reassurance.compareDocumentPosition(expertises) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      expertises.compareDocumentPosition(laboratoire) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
