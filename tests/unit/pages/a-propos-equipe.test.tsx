import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EquipePage from '@/app/(site)/a-propos/equipe/page';

describe('Page /a-propos/equipe (Person schema premium — audit P2 §7 #6)', () => {
  it('rend un h1 « Debora Ahouma »', async () => {
    render(await EquipePage());
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Debora Ahouma');
  });

  it('présente la fonction CEO & Fondatrice', async () => {
    render(await EquipePage());
    expect(screen.getByText(/CEO.*Fondatrice/i)).toBeInTheDocument();
  });

  it('injecte un JSON-LD Person via JsonLd + breadcrumb dans la page', async () => {
    render(await EquipePage());
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const text = Array.from(scripts)
      .map((s) => s.textContent ?? '')
      .join('');
    expect(text).toContain('"Person"');
    expect(text).toContain('Debora Ahouma');
    expect(text).toContain('"BreadcrumbList"');
    expect(text).toContain('Équipe');
  });

  it('liste les 3 publications signature (livre, livre blanc, conférence)', async () => {
    render(await EquipePage());
    // Le titre du livre peut apparaître plusieurs fois (bio + carte pub).
    expect(
      screen.getAllByText(
        /Intégration de l.Intelligence Artificielle dans le développement logiciel/i,
      ).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/IA souveraine en Côte d/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/IA appliquée en Afrique francophone/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('expose un lien vers /livre et vers /contact', async () => {
    render(await EquipePage());
    const livreLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/livre');
    expect(livreLinks.length).toBeGreaterThan(0);
    const contactLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/contact');
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it('affiche le fil d’Ariane Accueil > À propos > Équipe', async () => {
    render(await EquipePage());
    const nav = screen.getByTestId('breadcrumbs');
    expect(nav.textContent).toContain('À propos');
    expect(nav.textContent).toContain('Équipe');
  });
});
