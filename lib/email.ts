import 'server-only';

/**
 * Mailer transactionnel — Zoho ZeptoMail via l'API HTTP (CLAUDE.md §2.1).
 *
 * Pourquoi ZeptoMail + API HTTP (et pas SMTP) :
 *   - Le plan Zoho Mail « Forever Free » n'autorise PAS l'accès SMTP
 *     externe ; ZeptoMail est le service transactionnel dédié de Zoho
 *     (tier gratuit ~10k mails/mois), cohérent avec la boîte Zoho de
 *     l'équipe (waopron@, infos@).
 *   - L'API HTTP sort sur le port 443, déjà autorisé par la
 *     NetworkPolicy d'égress (cf. deploy/.../networkpolicy.yaml). Le
 *     SMTP (587/465) serait bloqué.
 *
 * Tous les appels sont **fail-soft** : si `ZEPTOMAIL_TOKEN` est absent
 * (dev) ou si ZeptoMail renvoie une erreur, on log et on renvoie
 * `{ ok: false }` sans jamais throw. L'envoi est best-effort, branché
 * APRÈS la réponse 202 du route handler — il ne doit jamais dégrader
 * l'expérience visiteur ni faire échouer une soumission de lead.
 */

const TIMEOUT_MS = 10_000;

// EU par défaut (compte Zoho créé en zone UE — cf. doc migration Zoho).
const DEFAULT_API_URL = 'https://api.zeptomail.eu/v1.1/email';

interface ZeptoAddress {
  address: string;
  name?: string;
}

interface SendEmailInput {
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

interface MailerConfig {
  token: string;
  apiUrl: string;
  from: ZeptoAddress;
  team: ZeptoAddress;
}

/**
 * Lit la config mailer depuis l'environnement. Renvoie `null` si le
 * token est absent → l'envoi est sauté proprement (mode dev / CI).
 */
function readConfig(): MailerConfig | null {
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
async function send(
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

function logFailure(label: string, detail: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[email] envoi ZeptoMail échoué — ${label}:`, detail);
  }
}

// ────────────────────────────────────────────────────────────
// Helpers de présentation
// ────────────────────────────────────────────────────────────

/** Échappe le HTML pour neutraliser toute injection dans les templates. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SUBJECT_LABELS: Record<string, string> = {
  'audit-ia': 'Audit IA gratuit',
  'demo-produit': 'Démonstration produit',
  conference: 'Conférence / intervention',
  partenariat: 'Partenariat',
  presse: 'Presse',
  autre: 'Autre',
};

function subjectLabel(value: string | undefined): string {
  if (!value) return 'Contact';
  return SUBJECT_LABELS[value] ?? value;
}

/** Coquille HTML minimale, charte OpenLab (night + orange). */
function shell(title: string, inner: string): string {
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

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#5b6170;white-space:nowrap;vertical-align:top;">${esc(label)}</td><td style="padding:6px 0;font-size:14px;color:#1a1d24;">${esc(value)}</td></tr>`;
}

// ────────────────────────────────────────────────────────────
// 1. Notification interne (vers l'équipe OpenLab)
// ────────────────────────────────────────────────────────────

export interface LeadNotificationInput {
  source: 'contact' | 'audit-ia';
  name: string;
  email: string;
  organization?: string | null;
  jobTitle?: string | null;
  subject?: string | null;
  message?: string | null;
  /** Métadonnées additionnelles (maturité IA, effectif…) à afficher. */
  details?: Record<string, string | null | undefined>;
  aiScore?: number;
  aiSummary?: string;
}

/**
 * Notifie l'équipe OpenLab d'un nouveau lead. Reply-To = email du
 * prospect → l'équipe peut répondre directement depuis sa boîte Zoho.
 */
export async function sendLeadNotification(
  input: LeadNotificationInput,
): Promise<SendEmailResult> {
  const cfg = readConfig();
  if (!cfg) return { ok: false, skipped: true };

  const sourceLabel =
    input.source === 'audit-ia' ? 'Audit IA' : 'Formulaire de contact';
  const subjectLine = `Nouveau lead — ${sourceLabel} · ${input.name}`;

  const detailRows = Object.entries(input.details ?? {})
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => row(k, String(v)))
    .join('');

  const scoreRow =
    typeof input.aiScore === 'number'
      ? row('Score IA', `${input.aiScore} / 100`)
      : '';

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
${row('Source', sourceLabel)}
${input.subject ? row('Sujet', subjectLabel(input.subject)) : ''}
${row('Nom', input.name)}
${row('Email', input.email)}
${input.organization ? row('Organisation', input.organization) : ''}
${input.jobTitle ? row('Fonction', input.jobTitle) : ''}
${detailRows}
${scoreRow}
</table>
${
  input.message
    ? `<div style="margin-top:16px;padding:16px;background:#ffffff;border-left:3px solid #ff5a00;border-radius:6px;"><div style="font-size:12px;color:#5b6170;margin-bottom:6px;">Message</div><div style="font-size:14px;line-height:1.6;color:#1a1d24;white-space:pre-wrap;">${esc(input.message)}</div></div>`
    : ''
}
${
  input.aiSummary
    ? `<div style="margin-top:12px;font-size:13px;color:#5b6170;"><strong style="color:#1a1d24;">Synthèse IA :</strong> ${esc(input.aiSummary)}</div>`
    : ''
}
<p style="margin-top:20px;font-size:13px;color:#5b6170;">Répondez à cet email pour contacter directement le prospect (reply-to configuré).</p>`;

  const textParts = [
    `Nouveau lead — ${sourceLabel}`,
    '',
    `Nom : ${input.name}`,
    `Email : ${input.email}`,
    input.organization ? `Organisation : ${input.organization}` : '',
    input.jobTitle ? `Fonction : ${input.jobTitle}` : '',
    input.subject ? `Sujet : ${subjectLabel(input.subject)}` : '',
    ...Object.entries(input.details ?? {})
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k} : ${v}`),
    typeof input.aiScore === 'number' ? `Score IA : ${input.aiScore}/100` : '',
    '',
    input.message ? `Message :\n${input.message}` : '',
    input.aiSummary ? `\nSynthèse IA : ${input.aiSummary}` : '',
  ];

  return send(cfg, {
    to: cfg.team,
    replyTo: { address: input.email, name: input.name },
    subject: subjectLine,
    html: shell(`Nouveau lead — ${sourceLabel}`, inner),
    text: textParts.filter((l) => l !== undefined).join('\n'),
  });
}

// ────────────────────────────────────────────────────────────
// 2. Accusé de réception (vers le prospect)
// ────────────────────────────────────────────────────────────

export interface AcknowledgementInput {
  source: 'contact' | 'audit-ia';
  name: string;
  email: string;
}

/**
 * Confirme au prospect que sa demande est bien reçue. Reply-To =
 * boîte équipe (waopron@) → toute réponse arrive chez OpenLab.
 */
export async function sendLeadAcknowledgement(
  input: AcknowledgementInput,
): Promise<SendEmailResult> {
  const cfg = readConfig();
  if (!cfg) return { ok: false, skipped: true };

  const isAudit = input.source === 'audit-ia';
  const title = isAudit
    ? 'Votre demande d’audit IA est bien reçue'
    : 'Votre message est bien reçu';
  const delay = isAudit
    ? 'Votre rapport personnalisé vous parviendra sous 48 h ouvrées.'
    : 'Notre équipe vous répond sous 24 h ouvrées.';

  const firstName = input.name.split(' ')[0] || input.name;

  const inner = `
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">Bonjour ${esc(firstName)},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">Merci de votre intérêt pour OpenLab Consulting. ${esc(delay)}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#1a1d24;">En attendant, vous pouvez explorer notre écosystème de produits IA et nos publications sur notre site.</p>
<a href="https://openlabconsulting.com" style="display:inline-block;background:#ff5a00;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">Découvrir OpenLab</a>
<p style="margin:24px 0 0;font-size:13px;color:#5b6170;">L’équipe OpenLab Consulting</p>`;

  const text = `Bonjour ${firstName},

Merci de votre intérêt pour OpenLab Consulting. ${delay}

En attendant, explorez notre écosystème IA : https://openlabconsulting.com

L'équipe OpenLab Consulting`;

  return send(cfg, {
    to: { address: input.email, name: input.name },
    replyTo: cfg.team,
    subject: title,
    html: shell(title, inner),
    text,
  });
}
