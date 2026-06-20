import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhitepaperRequestForm } from '@/components/forms/WhitepaperRequestForm';

/**
 * Tests du WhitepaperRequestForm — couvre les 4 branches de
 * handleSubmit (200, 429, 400, network error) + variantes d'affichage
 * (draft vs published) + ARIA error.
 */
describe('WhitepaperRequestForm', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function fillRequired(): void {
    fireEvent.change(screen.getByLabelText(/Email professionnel/i), {
      target: { value: 'cto@banque-atlantique.ci' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /accepte/i }));
  }

  it('rend tous les champs requis + bouton « Recevoir le livre blanc »', () => {
    render(
      <WhitepaperRequestForm slug="ia-souveraine-ci-2026" pageCount={25} />,
    );
    expect(screen.getByLabelText(/Email professionnel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organisation/i)).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /accepte/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /abonner/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Recevoir le livre blanc/i }),
    ).toBeInTheDocument();
  });

  it('change le label du bouton en mode draft', () => {
    render(
      <WhitepaperRequestForm
        slug="ia-souveraine-ci-2026"
        pageCount={25}
        draft
      />,
    );
    expect(
      screen.getByRole('button', { name: /Réserver le PDF dès la sortie/i }),
    ).toBeInTheDocument();
  });

  it('inclut un champ caché slug + un honeypot website', () => {
    const { container } = render(
      <WhitepaperRequestForm slug="ia-souveraine-ci-2026" pageCount={25} />,
    );
    const slug = container.querySelector(
      'input[name="slug"]',
    ) as HTMLInputElement;
    expect(slug?.value).toBe('ia-souveraine-ci-2026');
    expect(
      container.querySelector('input[name="website"]'),
    ).toBeInTheDocument();
  });

  it('redirige et affiche success sur 200 OK', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        ok: true,
        pdfUrl: '/whitepapers/ia-souveraine-ci-2026.pdf',
        redirectTo: '/livres-blancs/ia-souveraine-ci-2026/merci',
      }),
    });
    render(
      <WhitepaperRequestForm slug="ia-souveraine-ci-2026" pageCount={25} />,
    );
    fillRequired();
    fireEvent.submit(
      screen.getByRole('form', { name: /Recevoir le livre blanc/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Demande reçue/i)).toBeInTheDocument();
    });
  });

  it('affiche un message rate-limit sur 429 avec retryAfter', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 429,
      json: async () => ({ error: 'rate_limited', retryAfter: 1800 }),
    });
    render(
      <WhitepaperRequestForm slug="ia-souveraine-ci-2026" pageCount={25} />,
    );
    fillRequired();
    fireEvent.submit(
      screen.getByRole('form', { name: /Recevoir le livre blanc/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Trop de demandes.*1800/i)).toBeInTheDocument();
    });
  });

  it('affiche message spécifique sur captcha_failed (400)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 400,
      json: async () => ({ error: 'captcha_failed' }),
    });
    render(
      <WhitepaperRequestForm slug="ia-souveraine-ci-2026" pageCount={25} />,
    );
    fillRequired();
    fireEvent.submit(
      screen.getByRole('form', { name: /Recevoir le livre blanc/i }),
    );
    await waitFor(() => {
      expect(
        screen.getByText(/Vérification anti-bot échouée/i),
      ).toBeInTheDocument();
    });
  });

  it('affiche les erreurs par champ (validation_failed 400)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 400,
      json: async () => ({
        error: 'validation_failed',
        fields: { email: 'Email invalide.' },
      }),
    });
    render(
      <WhitepaperRequestForm slug="ia-souveraine-ci-2026" pageCount={25} />,
    );
    fillRequired();
    fireEvent.submit(
      screen.getByRole('form', { name: /Recevoir le livre blanc/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Email invalide\./i)).toBeInTheDocument();
    });
  });

  it('affiche une erreur réseau si fetch reject', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('network'),
    );
    render(
      <WhitepaperRequestForm slug="ia-souveraine-ci-2026" pageCount={25} />,
    );
    fillRequired();
    fireEvent.submit(
      screen.getByRole('form', { name: /Recevoir le livre blanc/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Connexion impossible/i)).toBeInTheDocument();
    });
  });

  it('affiche une erreur générique sur status inattendu (500)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 500,
      json: async () => ({}),
    });
    render(
      <WhitepaperRequestForm slug="ia-souveraine-ci-2026" pageCount={25} />,
    );
    fillRequired();
    fireEvent.submit(
      screen.getByRole('form', { name: /Recevoir le livre blanc/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Erreur inattendue/i)).toBeInTheDocument();
    });
  });

  it('désactive le bouton pendant submitting', async () => {
    let resolveFetch!: (v: unknown) => void;
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise((r) => {
        resolveFetch = r;
      }),
    );
    render(
      <WhitepaperRequestForm slug="ia-souveraine-ci-2026" pageCount={25} />,
    );
    fillRequired();
    fireEvent.submit(
      screen.getByRole('form', { name: /Recevoir le livre blanc/i }),
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Envoi/i })).toBeDisabled();
    });
    resolveFetch({
      status: 200,
      json: async () => ({ ok: true, pdfUrl: '/x', redirectTo: '/y' }),
    });
  });
});
