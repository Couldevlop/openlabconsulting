import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Navbar } from '@/components/Navbar';

describe('Navbar', () => {
  it('affiche le logo + boutons mega-menu + liens simples', () => {
    render(<Navbar />);

    expect(
      screen.getByRole('img', { name: /OpenLab Consulting/i }),
    ).toBeInTheDocument();

    // Mega-menus (boutons, pas liens)
    expect(
      screen.getAllByRole('button', { name: /^Expertises$/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: /^Solutions$/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: /^Laboratoire$/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: /^Livre IA$/i }).length,
    ).toBeGreaterThan(0);

    // Liens simples
    expect(
      screen.getAllByRole('link', { name: 'Insights' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'À propos' }).length,
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

  it('ouvre le mega-menu Solutions au click et expose les produits', async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    // Premier bouton Solutions = celui de la nav desktop
    const trigger = screen.getAllByRole('button', { name: /^Solutions$/i })[0]!;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const panel = await screen.findByTestId('mega-menu-solutions');
    expect(panel).toBeInTheDocument();
    // Le panneau doit lister au moins NexusRH (production)
    expect(
      within(panel).getByRole('link', { name: /NexusRH CI/i }),
    ).toBeInTheDocument();
    // Et le lien Vue d'ensemble vers /solutions
    const overview = within(panel).getAllByRole('link', {
      name: /Vue d.ensemble/i,
    })[0]!;
    expect(overview.getAttribute('href')).toBe('/solutions');
  });

  it('le mega-menu Expertises expose un CTA audit IA', async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getAllByRole('button', {
      name: /^Expertises$/i,
    })[0]!;
    await user.click(trigger);

    const panel = await screen.findByTestId('mega-menu-expertises');
    const cta = within(panel).getByRole('link', {
      name: /Demander un audit IA gratuit/i,
    });
    expect(cta.getAttribute('href')).toBe('/audit-ia');
  });
});
