/**
 * Cœur du mailer transactionnel — Zoho ZeptoMail via l'API HTTP
 * (CLAUDE.md §2.1). Volontairement SANS `import 'server-only'` : ce
 * module est partagé entre les routes API du site (`lib/email.ts`) et
 * l'email adapter Payload (`lib/email-adapter.ts`), lui-même importé
 * par `payload.config.ts` — qui est chargé par les scripts CLI tsx
 * (migrate, importmap) hors contexte React Server.
 *
 * Pourquoi ZeptoMail + API HTTP (et pas SMTP) :
 *   - Le plan Zoho Mail « Forever Free » n'autorise PAS l'accès SMTP
 *     externe ; ZeptoMail est le service transactionnel dédié de Zoho
 *     (tier gratuit ~10k mails/mois).
 *   - L'API HTTP sort sur le port 443, déjà autorisé par la
 *     NetworkPolicy d'égress. Le SMTP (587/465) serait bloqué.
 *
 * Tous les appels sont **fail-soft** : si `ZEPTOMAIL_TOKEN` est absent
 * (dev) ou si ZeptoMail renvoie une erreur, on log et on renvoie
 * `{ ok: false }` sans jamais throw.
 */

const TIMEOUT_MS = 10_000;

// Région GLOBALE (.com) : le compte ZeptoMail est sur smtp.zeptomail.com
// (cf. capture console ZeptoMail). Le token est lié à la région — l'envoyer à
// l'endpoint .eu renvoie 401 et l'email échoue en silence (fail-soft).
// Override via ZEPTOMAIL_API_URL si le compte change de data center.
const DEFAULT_API_URL = 'https://api.zeptomail.com/v1.1/email';

export interface ZeptoAddress {
  address: string;
  name?: string;
}

export interface SendEmailInput {
  to: ZeptoAddress;
  subject: string;
  html: string;
  text: string;
  replyTo?: ZeptoAddress;
}

export interface SendEmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export interface MailerConfig {
  token: string;
  apiUrl: string;
  from: ZeptoAddress;
  team: ZeptoAddress;
}

/**
 * Lit la config mailer depuis l'environnement. Renvoie `null` si le
 * token est absent → l'envoi est sauté proprement (mode dev / CI).
 */
export function readConfig(): MailerConfig | null {
  const token = process.env.ZEPTOMAIL_TOKEN;
  if (!token) return null;
  return {
    token,
    apiUrl: process.env.ZEPTOMAIL_API_URL || DEFAULT_API_URL,
    from: {
      address: process.env.EMAIL_FROM || 'noreply@openlabconsulting.com',
      name: process.env.EMAIL_FROM_NAME || 'OpenLab Consulting',
    },
    team: {
      address: process.env.EMAIL_TEAM || 'waopron@openlabconsulting.com',
      name: 'OpenLab Consulting',
    },
  };
}

/**
 * Envoi bas niveau via l'API ZeptoMail. Fail-soft, jamais de throw.
 */
export async function send(
  cfg: MailerConfig,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const body = {
    from: { address: cfg.from.address, name: cfg.from.name },
    to: [
      {
        email_address: {
          address: input.to.address,
          ...(input.to.name ? { name: input.to.name } : {}),
        },
      },
    ],
    subject: input.subject,
    htmlbody: input.html,
    textbody: input.text,
    ...(input.replyTo
      ? {
          reply_to: [
            {
              address: input.replyTo.address,
              ...(input.replyTo.name ? { name: input.replyTo.name } : {}),
            },
          ],
        }
      : {}),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(cfg.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // ZeptoMail attend le préfixe littéral `Zoho-enczapikey`.
        Authorization: `Zoho-enczapikey ${cfg.token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      logFailure(`HTTP ${res.status}`, detail);
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    logFailure('fetch failed', (err as Error).message);
    return { ok: false, error: (err as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

export function logFailure(label: string, detail: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[email] envoi ZeptoMail échoué — ${label}:`, detail);
  }
}

// ────────────────────────────────────────────────────────────
// Helpers de présentation (charte OpenLab)
// ────────────────────────────────────────────────────────────

/** Échappe le HTML pour neutraliser toute injection dans les templates. */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Coquille HTML minimale, charte OpenLab (night + orange). */
export function shell(title: string, inner: string): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#0a0e1a;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1a1d24;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:32px 0;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#faf8f5;border-radius:12px;overflow:hidden;">
<tr><td style="background:#0a0e1a;padding:24px 32px;">
<span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">OpenLab<span style="color:#ff5a00;">.</span>Consulting</span>
</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#0a0e1a;">${esc(title)}</h1>
${inner}
</td></tr>
<tr><td style="padding:20px 32px;background:#e8eaf0;font-size:12px;color:#5b6170;">
OpenLab Consulting SARL · Abidjan, Cocody, Riviera Faya Lauriers 8 · openlabconsulting.com
</td></tr>
</table></td></tr></table></body></html>`;
}

/** Ligne label/valeur pour les tableaux récapitulatifs. */
export function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#5b6170;white-space:nowrap;vertical-align:top;">${esc(label)}</td><td style="padding:6px 0;font-size:14px;color:#1a1d24;">${esc(value)}</td></tr>`;
}
