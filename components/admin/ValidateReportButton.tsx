'use client';

import { useState, type ReactElement } from 'react';
import { useDocumentInfo } from '@payloadcms/ui';

/**
 * Bouton « Valider et envoyer » de la fiche d'un rapport d'audit.
 *
 * L'action réelle vit dans /api/audit-report/validate, qui revérifie
 * l'authentification et le rôle : masquer un bouton ne protège rien
 * (OWASP A01). Ce composant ne fait que déclencher et rendre compte.
 *
 * Le message de succès distingue explicitement « envoyé au prospect » de
 * « enregistré mais email refusé par le transport » : le consultant doit
 * savoir si le prospect a réellement reçu quelque chose.
 */

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; emailSent: boolean }
  | { kind: 'error'; message: string };

export default function ValidateReportButton(): ReactElement | null {
  const { id } = useDocumentInfo();
  const [state, setState] = useState<State>({ kind: 'idle' });

  if (!id) return null;

  async function validate(): Promise<void> {
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/audit-report/validate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: String(id) }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        emailSent?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setState({
          kind: 'error',
          message:
            data.error === 'lead_sans_email'
              ? 'La demande liée n’a pas d’adresse email : impossible d’envoyer.'
              : (data.error ?? `Erreur ${res.status}`),
        });
        return;
      }
      setState({ kind: 'done', emailSent: data.emailSent === true });
    } catch {
      setState({
        kind: 'error',
        message: 'Requête impossible. Vérifiez votre connexion.',
      });
    }
  }

  if (state.kind === 'done') {
    return (
      <p style={{ margin: '0 0 16px', fontSize: 13 }}>
        {state.emailSent
          ? 'Rapport envoyé au prospect. Le lien de téléchargement expire dans 30 jours.'
          : 'Rapport enregistré comme envoyé, mais le transport email l’a refusé. Vérifiez la configuration ZeptoMail avant de considérer le prospect comme prévenu.'}
      </p>
    );
  }

  return (
    <div style={{ margin: '0 0 16px' }}>
      <button
        type="button"
        className="btn btn--style-primary"
        disabled={state.kind === 'sending'}
        onClick={() => {
          const ok = window.confirm(
            'Le rapport va être envoyé au prospect. Confirmer ?',
          );
          if (ok) void validate();
        }}
      >
        {state.kind === 'sending' ? 'Envoi en cours…' : 'Valider et envoyer'}
      </button>
      {state.kind === 'error' ? (
        <p style={{ marginTop: 8, fontSize: 13, color: '#c0392b' }}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
