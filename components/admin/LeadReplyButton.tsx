'use client';

import type { ReactElement } from 'react';
import { useFormFields } from '@payloadcms/ui';

/**
 * Bouton « Répondre par email » affiché dans la fiche d'un Lead (collection
 * `leads`). Demande utilisateur : pouvoir répondre directement au message
 * reçu depuis l'admin.
 *
 * Implémentation volontairement sans backend : un lien `mailto:` pré-rempli
 * (destinataire + objet `Re: …` + amorce de réponse + signature) qui ouvre
 * le client mail par défaut de l'éditeur (Outlook configuré sur le domaine).
 * Zéro dépendance serveur, zéro fuite de données : tout se passe côté poste.
 *
 * Les valeurs (email / name / subject) sont lues sur le formulaire courant
 * via `useFormFields` (réactif : reflète les éventuelles éditions en cours).
 * L'objet et le corps sont `encodeURIComponent`-és → pas d'injection
 * d'en-têtes mail possible (OWASP A03). L'adresse est déjà validée à la
 * création (champ `email` Payload), on l'insère telle quelle.
 */
export default function LeadReplyButton(): ReactElement | null {
  const email = useFormFields(
    ([fields]) => (fields?.email?.value as string | undefined) ?? '',
  );
  const name = useFormFields(
    ([fields]) => (fields?.name?.value as string | undefined) ?? '',
  );
  const subject = useFormFields(
    ([fields]) => (fields?.subject?.value as string | undefined) ?? '',
  );

  // Pas encore d'email (création en cours) → rien à afficher.
  if (!email) return null;

  const replySubject = subject
    ? `Re: ${subject}`
    : 'Votre message — OpenLab Consulting';
  const greeting = name ? `Bonjour ${name},` : 'Bonjour,';
  const body = [
    greeting,
    '',
    'Merci pour votre message. ',
    '',
    '',
    '— ',
    'OpenLab Consulting',
    'https://openlabconsulting.com',
  ].join('\n');

  const href = `mailto:${email}?subject=${encodeURIComponent(
    replySubject,
  )}&body=${encodeURIComponent(body)}`;

  return (
    <div style={{ margin: '0.5rem 0 1.5rem' }}>
      <a
        href={href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.1rem',
          borderRadius: '6px',
          background: '#ff5a00',
          color: '#ffffff',
          fontWeight: 600,
          textDecoration: 'none',
          fontSize: '0.9rem',
          lineHeight: 1.2,
        }}
        aria-label={`Répondre par email à ${email}`}
      >
        ✉ Répondre par email
      </a>
      <p
        style={{
          margin: '0.4rem 0 0',
          fontSize: '0.78rem',
          opacity: 0.7,
        }}
      >
        Ouvre votre messagerie (Outlook) avec un brouillon adressé à{' '}
        <strong>{email}</strong>.
      </p>
    </div>
  );
}
