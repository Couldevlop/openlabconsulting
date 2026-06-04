import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DemoRequestModal } from '@/components/forms/DemoRequestModal';

/**
 * Tests DemoRequestModal — ouverture/fermeture, a11y dialog, soumission
 * AJAX vers /api/demo, états success / erreur, champs cachés produit.
 */
describe('DemoRequestModal', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  function open(): void {
    render(<DemoRequestModal productSlug="nexusrh" productName="NexusRH CI" />);
    fireEvent.click(screen.getByTestId('demo-modal-trigger'));
  }

  function fillValid(): void {
    fireEvent.change(screen.getByLabelText(/Nom complet/i), {
      target: { value: 'Debora Ahouma' },
    });
    fireEvent.change(screen.getByLabelText(/Email pro/i), {
      target: { value: 'debora@openlabconsulting.com' },
    });
    fireEvent.change(screen.getByLabelText(/Organisation/i), {
      target: { value: 'OpenLab Consulting' },
    });
  }

  it('n’affiche pas la modale tant qu’on ne clique pas', () => {
    render(<DemoRequestModal productSlug="nexusrh" productName="NexusRH CI" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ouvre une modale accessible (role dialog + aria-modal) avec le nom produit', () => {
    open();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(/Découvrez NexusRH CI/i)).toBeInTheDocument();
  });

  it('porte le produit dans des champs cachés', () => {
    open();
    const slug = document.querySelector('input[name="productSlug"]');
    const pname = document.querySelector('input[name="productName"]');
    expect(slug).toHaveValue('nexusrh');
    expect(pname).toHaveValue('NexusRH CI');
  });

  it('ferme via Échap', () => {
    open();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('affiche l’écran de succès sur 202', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 202,
      json: async () => ({
        ok: true,
        message: 'Un consultant vous recontacte.',
      }),
    });
    open();
    fillValid();
    fireEvent.submit(
      screen.getByRole('form', { name: /Demander une démo de NexusRH CI/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Demande envoyée/i)).toBeInTheDocument();
    });
  });

  it('affiche l’erreur de validation sur 400', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 400,
      json: async () => ({
        error: 'validation_failed',
        fields: { email: 'Email invalide' },
      }),
    });
    open();
    fillValid();
    fireEvent.submit(
      screen.getByRole('form', { name: /Demander une démo de NexusRH CI/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Vérifiez les champs/i)).toBeInTheDocument();
    });
  });

  it('affiche le message de rate-limit sur 429', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 429,
      json: async () => ({ retryAfter: 90 }),
    });
    open();
    fillValid();
    fireEvent.submit(
      screen.getByRole('form', { name: /Demander une démo de NexusRH CI/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Trop de demandes/i)).toBeInTheDocument();
    });
  });
});
