import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Navbar } from '@/components/Navbar';

describe('Navbar', () => {
  it('affiche le logo et les liens principaux', () => {
    render(<Navbar />);
    expect(
      screen.getByRole('img', { name: /OpenLab Consulting/i }),
    ).toBeInTheDocument();
    // 1 occurrence desktop + 1 mobile (mobile-nav rendu en DOM mais masqué visuellement).
    expect(
      screen.getAllByRole('link', { name: 'Expertises' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'Solutions' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'Livre IA' }).length,
    ).toBeGreaterThan(0);
  });

  it('expose un CTA Audit IA gratuit', () => {
    render(<Navbar />);
    const ctas = screen.getAllByRole('link', { name: /Audit IA gratuit/i });
    expect(ctas.length).toBeGreaterThan(0);
    expect(ctas[0]?.getAttribute('href')).toBe('/audit-ia');
  });

  it('le menu mobile s’ouvre et se ferme', async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const toggle = screen.getByRole('button', { name: /Ouvrir le menu/i });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await user.click(toggle);
    expect(
      screen
        .getByRole('button', { name: /Fermer le menu/i })
        .getAttribute('aria-expanded'),
    ).toBe('true');
  });
});
