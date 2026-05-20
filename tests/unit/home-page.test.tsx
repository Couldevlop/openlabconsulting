import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// CasesCarouselServer est un async Server Component qui interroge Payload.
// Pour le test unitaire de HomePage, on le remplace par un mock sync qui
// délègue au client CasesCarousel (qui utilise déjà FALLBACK_CASE_STUDIES
// par défaut). Le binding réel Payload est couvert par case-studies.test.ts.
vi.mock('@/components/sections/CasesCarouselServer', async () => {
  const { CasesCarousel } = await import('@/components/sections/CasesCarousel');
  return { CasesCarouselServer: () => <CasesCarousel /> };
});

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

  it('rend CasesCarousel après Laboratoire', () => {
    render(<HomePage />);
    expect(screen.getByTestId('cases-carousel')).toBeInTheDocument();
  });

  it('rend Solutions après CasesCarousel', () => {
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

  it('rend AuditIaCta après Insights (dernière section homepage)', () => {
    render(<HomePage />);
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });

  it('respecte l’ordre complet des 10 sections de la homepage §6', () => {
    render(<HomePage />);
    const sections = [
      screen.getByTestId('hero'),
      screen.getByTestId('reassurance'),
      screen.getByTestId('expertises'),
      screen.getByTestId('laboratoire'),
      screen.getByTestId('cases-carousel'),
      screen.getByTestId('solutions'),
      screen.getByTestId('manifesto'),
      screen.getByTestId('livre'),
      screen.getByTestId('insights'),
      screen.getByTestId('audit-ia-cta'),
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
