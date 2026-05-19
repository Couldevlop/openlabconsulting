import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Laboratoire } from '@/components/sections/Laboratoire';

describe('Laboratoire (homepage §6.4 — section signature)', () => {
  it('rend la section sur fond night avec aria-labelledby', () => {
    render(<Laboratoire />);
    const section = screen.getByRole('region', {
      name: /Un cabinet qui code, qui édite, qui publie/i,
    });
    expect(section.getAttribute('data-testid')).toBe('laboratoire');
    expect(section.className).toMatch(/bg-\[var\(--color-ol-night\)\]/);
  });

  it('affiche l’eyebrow + le h2 + la citation Fraunces', () => {
    render(<Laboratoire />);
    expect(screen.getByText(/Le Laboratoire OpenLab/i)).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.id).toBe('laboratoire-title');
    expect(screen.getByText(/data est votre pétrole/i)).toBeInTheDocument();
  });

  it('rend exactement 3 axes R&D dans une liste', () => {
    render(<Laboratoire />);
    const section = screen.getByTestId('laboratoire');
    const list = within(section).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('expose les 3 micro-CTA vers les bonnes routes', () => {
    render(<Laboratoire />);
    expect(
      screen.getByRole('link', { name: /Voir l’écosystème/i }),
    ).toHaveAttribute('href', '/solutions');
    expect(
      screen.getByRole('link', { name: /Explorer le livre/i }),
    ).toHaveAttribute('href', '/livre');
    expect(
      screen.getByRole('link', { name: /Découvrir la R&D/i }),
    ).toHaveAttribute('href', '/laboratoire');
  });

  it('expose un CTA primaire "Visiter le laboratoire" vers /laboratoire', () => {
    render(<Laboratoire />);
    const cta = screen.getByRole('link', { name: /Visiter le laboratoire/i });
    expect(cta.getAttribute('href')).toBe('/laboratoire');
  });

  it('ne contient aucun chiffre rond non sourcé (règle §4.10)', () => {
    render(<Laboratoire />);
    const text = screen.getByTestId('laboratoire').textContent ?? '';
    // Le seul "chiffre" attendu est "Sept" (écrit en lettres, sourcé §1.3).
    // Si un "100%", "50+", "10000 clients" apparaît, c'est un échec.
    expect(text).not.toMatch(/\b\d{2,}\s*%|\d{3,}\+|\b1\d{3,}\b/);
  });
});
