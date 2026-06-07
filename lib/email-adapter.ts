import type { EmailAdapter } from 'payload';

import { readConfig, send, type SendEmailResult } from './email-core';

/**
 * Email adapter Payload → Zoho ZeptoMail (API HTTP, port 443).
 *
 * Branche l'envoi d'emails du back-office sur le transport
 * transactionnel existant (`lib/email-core.ts`) : « mot de passe
 * oublié » (/admin → forgot password), vérification d'email et tout
 * futur envoi déclenché par Payload.
 *
 * Fail-soft : si `ZEPTOMAIL_TOKEN` est absent (dev, CI, tests), l'envoi
 * est sauté avec un warn — jamais de throw, sinon l'endpoint
 * forgot-password renverrait un 500 et divulguerait l'état du mailer
 * (OWASP A09 : on log côté serveur, réponse client inchangée).
 */

interface AddressLike {
  address?: string;
  name?: string;
}

/** Normalise le champ `to` nodemailer (string | objet | tableau). */
export function firstRecipient(
  to: string | AddressLike | (string | AddressLike)[] | undefined,
): { address: string; name?: string } | null {
  const first = Array.isArray(to) ? to[0] : to;
  if (!first) return null;
  if (typeof first === 'string') {
    const address = first.trim();
    return address ? { address } : null;
  }
  if (typeof first.address === 'string' && first.address.trim()) {
    return {
      address: first.address.trim(),
      ...(first.name ? { name: first.name } : {}),
    };
  }
  return null;
}

export const zeptomailAdapter = (): EmailAdapter<SendEmailResult> => {
  return ({ payload }) => ({
    name: 'zeptomail',
    defaultFromAddress:
      process.env.EMAIL_FROM || 'noreply@openlabconsulting.com',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'OpenLab Consulting',
    sendEmail: async (message): Promise<SendEmailResult> => {
      const cfg = readConfig();
      if (!cfg) {
        payload.logger.warn(
          '[email-adapter] ZEPTOMAIL_TOKEN absent — email Payload non envoyé.',
        );
        return { ok: false, skipped: true };
      }

      const to = firstRecipient(
        message.to as Parameters<typeof firstRecipient>[0],
      );
      if (!to) {
        payload.logger.warn(
          '[email-adapter] destinataire manquant — email Payload non envoyé.',
        );
        return { ok: false, error: 'missing recipient' };
      }

      const subject = message.subject ?? 'OpenLab Consulting';
      const html =
        typeof message.html === 'string' && message.html.length > 0
          ? message.html
          : `<p>${typeof message.text === 'string' ? message.text : ''}</p>`;
      const text =
        typeof message.text === 'string' && message.text.length > 0
          ? message.text
          : '';

      const result = await send(cfg, { to, subject, html, text });
      if (!result.ok) {
        // Trace serveur (A09) — la réponse HTTP de Payload reste inchangée.
        payload.logger.error(
          `[email-adapter] envoi ZeptoMail échoué — ${result.error ?? 'inconnu'}`,
        );
      }
      return result;
    },
  });
};
