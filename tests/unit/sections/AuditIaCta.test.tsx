import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuditIaCta } from '@/components/sections/AuditIaCta';

describe('AuditIaCta (homepage §6.10 — lead magnet final)', () => {
  it('rend la section labellée par son h2', () => {
    render(<AuditIaCta />);
    const section = screen.getByRole('region', {
      name: /Trente minutes pour savoir si l’IA.*vous fera gagner du temps/i,
    });
    expect(section.getAttribute('data-testid')).toBe('audit-ia-cta');
  });

  it('affiche l’eyebrow + le pitch + la mention RGPD', () => {
    render(<AuditIaCta />);
    expect(screen.getByText(/^Audit IA gratuit$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/cadrage gratuit, mené par un consultant senior/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /politique de confidentialité/i }),
    ).toHaveAttribute('href', '/politique-confidentialite');
  });

  it('expose un formulaire pointant vers /audit-ia', () => {
    render(<AuditIaCta />);
    const form = screen.getByRole('form', { name: /Démarrer un audit IA/i });
    expect(form.getAttribute('action')).toBe('/audit-ia');
    expect(form.getAttribute('method')).toBe('get');
  });

  it('demande email pro + secteur (champs requis)', () => {
    render(<AuditIaCta />);
    const email = screen.getByLabelText(/Adresse e-mail professionnelle/i);
    expect(email.getAttribute('type')).toBe('email');
    expect(email.hasAttribute('required')).toBe(true);

    const sector = screen.getByLabelText(/Votre secteur/i);
    expect(sector.tagName).toBe('SELECT');
    expect(sector.hasAttribute('required')).toBe(true);
    // Options principales attendues
    const options = within(sector as HTMLSelectElement).getAllByRole('option');
    const values = options.map((o) => o.getAttribute('value'));
    expect(values).toEqual(
      expect.arrayContaining([
        '',
        'banque-assurance',
        'secteur-public',
        'agro-industrie',
        'sante',
        'telecoms-energie',
        'autre',
      ]),
    );
  });

  it('expose un CTA primaire "Démarrer mon audit"', () => {
    render(<AuditIaCta />);
    const cta = screen.getByRole('button', { name: /Démarrer mon audit/i });
    expect(cta.getAttribute('type')).toBe('submit');
  });

  it('expose le livre blanc comme voie secondaire', () => {
    render(<AuditIaCta />);
    const card = screen.getByTestId('whitepaper-card');
    expect(
      within(card).getByText(/L’IA souveraine en Côte d’Ivoire/i),
    ).toBeInTheDocument();
    expect(
      within(card).getByText(
        /Feuille de route pratique pour les dirigeants en 2026/i,
      ),
    ).toBeInTheDocument();
    expect(within(card).getByText(/Livre blanc · 2026/i)).toBeInTheDocument();

    const dl = within(card).getByRole('link', {
      name: /Télécharger le livre blanc/i,
    });
    expect(dl.getAttribute('href')).toBe(
      '/livres-blancs/ia-souveraine-ci-2026',
    );
  });

  it('ne mentionne PAS Expertise IA / Grasse', () => {
    render(<AuditIaCta />);
    const text = screen.getByTestId('audit-ia-cta').textContent ?? '';
    expect(text).not.toMatch(/EXPERTISE-IA/i);
    expect(text).not.toMatch(/Grasse/i);
  });
});
