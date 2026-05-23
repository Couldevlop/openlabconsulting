import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuditIaQuizWizard } from '@/components/forms/AuditIaQuizWizard';

/**
 * Tests du AuditIaQuizWizard — chantier audit P2 §7 #14.
 *
 * Couvre la traversée complète : 5 questions → recommandation →
 * formulaire → submit (success, 400, 429, error réseau).
 */
describe('AuditIaQuizWizard', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  async function answerAllQuestions(): Promise<void> {
    const user = userEvent.setup();
    // Q1 maturity
    await user.click(screen.getByText(/On en parle, on explore/i));
    // Q2 sector
    await user.click(await screen.findByText(/Banque & assurance/i));
    // Q3 headcount
    await user.click(await screen.findByText(/^Moins de 50$/i));
    // Q4 scope
    await user.click(await screen.findByText(/Un cas d.usage précis/i));
    // Q5 urgency
    await user.click(await screen.findByText(/Phase d.exploration/i));
  }

  it('rend la barre de progression et la 1re question au démarrage', () => {
    render(<AuditIaQuizWizard />);
    expect(screen.getByText(/Question 1 sur 5/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('passe à la 2e question après sélection de la 1re', async () => {
    const user = userEvent.setup();
    render(<AuditIaQuizWizard />);
    await user.click(screen.getByText(/On en parle, on explore/i));
    expect(await screen.findByText(/Question 2 sur 5/i)).toBeInTheDocument();
  });

  it('après les 5 questions, affiche la recommandation contextuelle', async () => {
    render(<AuditIaQuizWizard />);
    await answerAllQuestions();
    const reco = await screen.findByTestId('audit-ia-recommendation');
    expect(reco).toBeInTheDocument();
    // Découverte + exploration → atelier
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      /Atelier/i,
    );
  });

  it('le bouton « Modifier mes réponses » revient à la 5e question', async () => {
    const user = userEvent.setup();
    render(<AuditIaQuizWizard />);
    await answerAllQuestions();
    await user.click(screen.getByText(/Modifier mes réponses/i));
    expect(await screen.findByText(/Question 5 sur 5/i)).toBeInTheDocument();
  });

  it('« Demander cet audit » bascule sur le formulaire de coordonnées', async () => {
    const user = userEvent.setup();
    render(<AuditIaQuizWizard />);
    await answerAllQuestions();
    await user.click(screen.getByTestId('audit-ia-continue-to-form'));
    expect(await screen.findByTestId('audit-ia-form')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom complet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email professionnel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fonction/i)).toBeInTheDocument();
  });

  async function reachFormAndFill(): Promise<HTMLFormElement> {
    const user = userEvent.setup();
    await answerAllQuestions();
    await user.click(screen.getByTestId('audit-ia-continue-to-form'));
    await screen.findByTestId('audit-ia-form');

    fireEvent.change(screen.getByLabelText(/Nom complet/i), {
      target: { value: 'Aminata Coulibaly' },
    });
    fireEvent.change(screen.getByLabelText(/Email professionnel/i), {
      target: { value: 'aminata@example.ci' },
    });
    fireEvent.change(screen.getByLabelText(/Organisation/i), {
      target: { value: 'Banque Atlantique' },
    });
    fireEvent.change(screen.getByLabelText(/Fonction/i), {
      target: { value: 'CTO' },
    });
    await user.click(screen.getByRole('checkbox'));
    return screen.getByTestId('audit-ia-form') as HTMLFormElement;
  }

  it('submit OK (202) → affiche l’écran de succès', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 202,
      json: async () => ({ ok: true, message: 'Demande reçue OK' }),
    });
    render(<AuditIaQuizWizard />);
    const form = await reachFormAndFill();
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByTestId('audit-ia-success')).toBeInTheDocument();
    });
    expect(screen.getByText(/Demande reçue OK/i)).toBeInTheDocument();
  });

  it('submit 429 → affiche le message rate-limit avec retryAfter', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 429,
      json: async () => ({ error: 'rate_limited', retryAfter: 1800 }),
    });
    render(<AuditIaQuizWizard />);
    const form = await reachFormAndFill();
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText(/Trop de demandes.*1800/i)).toBeInTheDocument();
    });
  });

  it('submit 400 captcha_failed → message anti-bot', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 400,
      json: async () => ({ error: 'captcha_failed' }),
    });
    render(<AuditIaQuizWizard />);
    const form = await reachFormAndFill();
    fireEvent.submit(form);
    await waitFor(() => {
      expect(
        screen.getByText(/Vérification anti-bot échouée/i),
      ).toBeInTheDocument();
    });
  });

  it('submit échec réseau → message connexion impossible', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('network'),
    );
    render(<AuditIaQuizWizard />);
    const form = await reachFormAndFill();
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText(/Connexion impossible/i)).toBeInTheDocument();
    });
  });

  it('submit status inattendu (500) → message générique', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 500,
      json: async () => ({}),
    });
    render(<AuditIaQuizWizard />);
    const form = await reachFormAndFill();
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText(/Erreur inattendue/i)).toBeInTheDocument();
    });
  });

  it('le payload envoyé à /api/audit-ia inclut maturity/headcount/goal pré-remplis', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      status: 202,
      json: async () => ({ ok: true }),
    });
    render(<AuditIaQuizWizard />);
    const form = await reachFormAndFill();
    fireEvent.submit(form);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    const callArgs = fetchMock.mock.calls[0]!;
    expect(callArgs[0]).toBe('/api/audit-ia');
    const formData = (callArgs[1] as { body: FormData }).body;
    expect(formData.get('maturity')).toBe('decouverte');
    expect(formData.get('headcount')).toBe('lt-50');
    expect(String(formData.get('goal'))).toMatch(/Recommandation issue/);
  });
});
