import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContactForm } from '@/components/forms/ContactForm';

/**
 * Tests du ContactForm — vérifie le rendu, la soumission AJAX et
 * l'affichage des différents états (success / error / rate-limit).
 */
describe('ContactForm', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Reset fetch mock entre chaque test.
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function fillValidForm(): void {
    fireEvent.change(screen.getByLabelText(/Nom complet/i), {
      target: { value: 'Debora Ahouma' },
    });
    fireEvent.change(screen.getByLabelText(/Email pro/i), {
      target: { value: 'debora@openlabconsulting.com' },
    });
    fireEvent.change(screen.getByLabelText(/Sujet/i), {
      target: { value: 'audit-ia' },
    });
    fireEvent.change(screen.getByLabelText(/^Message$/i), {
      target: { value: 'Bonjour, audit IA pour notre groupe UEMOA.' },
    });
  }

  it('rend tous les champs et le bouton Envoyer', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/Nom complet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email pro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sujet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message$/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Envoyer le message/i }),
    ).toBeInTheDocument();
  });

  it('affiche le message de succès sur 202', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 202,
      json: async () => ({ ok: true, message: 'Reçu' }),
    });
    render(<ContactForm />);
    fillValidForm();
    fireEvent.submit(
      screen.getByRole('form', { name: /Formulaire de contact/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Reçu/i)).toBeInTheDocument();
    });
  });

  it('affiche l’erreur de validation sur 400 fields', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 400,
      json: async () => ({
        error: 'validation_failed',
        fields: { message: 'Trop court' },
      }),
    });
    render(<ContactForm />);
    fillValidForm();
    fireEvent.submit(
      screen.getByRole('form', { name: /Formulaire de contact/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Vérifiez les champs/i)).toBeInTheDocument();
    });
  });

  it('affiche l’erreur captcha sur 400 captcha_failed', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 400,
      json: async () => ({ error: 'captcha_failed' }),
    });
    render(<ContactForm />);
    fillValidForm();
    fireEvent.submit(
      screen.getByRole('form', { name: /Formulaire de contact/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Vérification anti-bot/i)).toBeInTheDocument();
    });
  });

  it('affiche le message de rate-limit sur 429', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 429,
      json: async () => ({ retryAfter: 120 }),
    });
    render(<ContactForm />);
    fillValidForm();
    fireEvent.submit(
      screen.getByRole('form', { name: /Formulaire de contact/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Trop de soumissions/i)).toBeInTheDocument();
    });
  });

  it('affiche l’erreur réseau si fetch throw', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom'),
    );
    render(<ContactForm />);
    fillValidForm();
    fireEvent.submit(
      screen.getByRole('form', { name: /Formulaire de contact/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Connexion impossible/i)).toBeInTheDocument();
    });
  });

  it('affiche l’erreur générique sur 500', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 500,
      json: async () => ({}),
    });
    render(<ContactForm />);
    fillValidForm();
    fireEvent.submit(
      screen.getByRole('form', { name: /Formulaire de contact/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Erreur inattendue/i)).toBeInTheDocument();
    });
  });
});
