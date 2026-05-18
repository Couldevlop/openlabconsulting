import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Hero } from '@/components/sections/Hero';

describe('Hero (homepage §6.1)', () => {
  it('rend le titre principal en h1 avec aria-labelledby', () => {
    render(<Hero />);
    const section = screen.getByRole('region', { name: /L’IA, au service/i });
    expect(section.getAttribute('data-testid')).toBe('hero');
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.id).toBe('hero-title');
    expect(heading.textContent).toMatch(/L’IA, au service/);
    expect(heading.textContent).toMatch(/des réalités africaines/);
  });

  it('expose l’eyebrow "L’écosystème OpenLab"', () => {
    render(<Hero />);
    expect(screen.getByText(/L’écosystème OpenLab/i)).toBeInTheDocument();
  });

  it('décrit l’offre dans un paragraphe accessible', () => {
    render(<Hero />);
    expect(
      screen.getByText(/Cabinet ivoirien d’IA appliquée/i),
    ).toBeInTheDocument();
  });

  it('expose un CTA primaire vers /audit-ia', () => {
    render(<Hero />);
    const cta = screen.getByRole('link', {
      name: /Demander un audit IA gratuit/i,
    });
    expect(cta.getAttribute('href')).toBe('/audit-ia');
  });

  it('expose un CTA secondaire vers /solutions', () => {
    render(<Hero />);
    const cta = screen.getByRole('link', {
      name: /Découvrir l’écosystème produits/i,
    });
    expect(cta.getAttribute('href')).toBe('/solutions');
  });

  it('respecte la règle "1 CTA primaire par section" (§4.2)', () => {
    render(<Hero />);
    // Le CTA primaire est porté par le seul lien explicitement nommé audit.
    const primary = screen.getAllByRole('link', { name: /audit IA gratuit/i });
    expect(primary).toHaveLength(1);
  });

  it('ne rend PAS le slot de fond sans prop background', () => {
    render(<Hero />);
    expect(screen.queryByTestId('hero-background-slot')).toBeNull();
  });

  it('rend le slot aria-hidden quand la prop background est fournie', () => {
    render(<Hero background={<div data-testid="my-bg">CANVAS</div>} />);
    const slot = screen.getByTestId('hero-background-slot');
    expect(slot).toBeInTheDocument();
    expect(slot.getAttribute('aria-hidden')).toBe('true');
    expect(slot.querySelector('[data-testid="my-bg"]')).not.toBeNull();
  });
});
