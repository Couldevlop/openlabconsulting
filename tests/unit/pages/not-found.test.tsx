import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFoundPage from '@/app/not-found';

describe('Page 404 — not-found.tsx', () => {
  it('rend un h1 « Ici, c’est le bout du chemin »', () => {
    render(<NotFoundPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/bout du chemin/i);
  });

  it('propose 3 suggestions cliquables', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByRole('link', { name: /Découvrir l’écosystème OpenLab/i }),
    ).toHaveAttribute('href', '/solutions');
    expect(
      screen.getByRole('link', { name: /Le livre IA & Agents Autonomes/i }),
    ).toHaveAttribute('href', '/livre');
    expect(
      screen.getByRole('link', { name: /Demander un audit IA gratuit/i }),
    ).toHaveAttribute('href', '/audit-ia');
  });

  it('expose un CTA « Page d’accueil »', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByRole('link', { name: /Page d’accueil/i }),
    ).toHaveAttribute('href', '/');
  });

  it('le lien de retour pointe vers /', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByRole('link', { name: /Retour à l’accueil/i }),
    ).toHaveAttribute('href', '/');
  });
});
