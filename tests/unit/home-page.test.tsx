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

  it('rend CasClient après Laboratoire', () => {
    render(<HomePage />);
    expect(screen.getByTestId('cas-client')).toBeInTheDocument();
  });

  it('rend Solutions après CasClient', () => {
    render(<HomePage />);
    expect(screen.getByTestId('solutions')).toBeInTheDocument();
  });

  it('rend Manifesto après Solutions', () => {
    render(<HomePage />);
    expect(screen.getByTestId('manifesto')).toBeInTheDocument();
  });

  it('rend Livre après Manifesto', () => {
    render(<HomePage />);
    expect(screen.getByTestId('livre')).toBeInTheDocument();
  });

  it('rend Insights après Livre', () => {
    render(<HomePage />);
    expect(screen.getByTestId('insights')).toBeInTheDocument();
  });

  it('respecte l’ordre Hero -> Reassurance -> Expertises -> Laboratoire -> CasClient -> Solutions -> Manifesto -> Livre -> Insights', () => {
    render(<HomePage />);
    const sections = [
      screen.getByTestId('hero'),
      screen.getByTestId('reassurance'),
      screen.getByTestId('expertises'),
      screen.getByTestId('laboratoire'),
      screen.getByTestId('cas-client'),
      screen.getByTestId('solutions'),
      screen.getByTestId('manifesto'),
      screen.getByTestId('livre'),
      screen.getByTestId('insights'),
    ];
    for (let i = 0; i < sections.length - 1; i++) {
      expect(
        sections[i]!.compareDocumentPosition(sections[i + 1]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
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
