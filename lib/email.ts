import 'server-only';

import {
  esc,
  readConfig,
  row,
  send,
  shell,
  type SendEmailResult,
} from './email-core';

/**
 * Mailer transactionnel côté routes API du site (contact, audit-ia,
 * démo) — Zoho ZeptoMail via l'API HTTP (CLAUDE.md §2.1).
 *
 * Le transport et les helpers de présentation vivent dans
 * `lib/email-core.ts` (sans `server-only`) pour être partagés avec
 * l'email adapter Payload (`lib/email-adapter.ts` → « mot de passe
 * oublié » de /admin). Ce module-ci reste `server-only` : il n'est
 * importé que par les route handlers.
 *
 * Tous les appels sont **fail-soft** : si `ZEPTOMAIL_TOKEN` est absent
 * (dev) ou si ZeptoMail renvoie une erreur, on log et on renvoie
 * `{ ok: false }` sans jamais throw. L'envoi est best-effort, branché
 * APRÈS la réponse 202 du route handler — il ne doit jamais dégrader
 * l'expérience visiteur ni faire échouer une soumission de lead.
 */

export type { SendEmailResult };

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

// ────────────────────────────────────────────────────────────
// 1. Notification interne (vers l'équipe OpenLab)
// ────────────────────────────────────────────────────────────

export interface LeadNotificationInput {
  source: 'contact' | 'audit-ia' | 'demo-produit' | 'whitepaper';
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
    input.source === 'audit-ia'
      ? 'Audit IA'
      : input.source === 'demo-produit'
        ? 'Demande de démo'
        : input.source === 'whitepaper'
          ? 'Téléchargement livre blanc'
          : 'Formulaire de contact';
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
// 1 bis. Rapport d'audit : alerte de relecture (vers l'équipe)
// ────────────────────────────────────────────────────────────

export interface ReportReviewAlertInput {
  reportId: string;
  organization: string;
  aiScore?: number;
  /** true à partir de 24 h sans validation : objet distinct, ton plus direct. */
  overdue?: boolean;
}

/**
 * Alerte l'équipe qu'un brouillon de rapport attend sa relecture.
 *
 * Premier des trois signaux prévus (email, compteur permanent dans
 * l'admin, relance) : c'est le seul qui dépende d'un transport externe,
 * d'où l'existence des deux autres.
 */
export async function sendReportReviewAlert(
  input: ReportReviewAlertInput,
): Promise<SendEmailResult> {
  const cfg = readConfig();
  if (!cfg) return { ok: false, skipped: true };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://openlabconsulting.com';
  const adminUrl = `${siteUrl}/admin/collections/audit-reports/${encodeURIComponent(input.reportId)}`;
  const subject = input.overdue
    ? `Échéance dépassée : rapport d’audit à valider (${input.organization})`
    : `Rapport d’audit à valider : ${input.organization}`;

  const intro = input.overdue
    ? 'Ce rapport attend une validation depuis plus de 24 heures. Le prospect a reçu la promesse d’un rapport sous 24 h ouvrées.'
    : 'Un brouillon de rapport d’audit vient d’être généré et attend votre relecture.';

  const inner = `
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">${esc(intro)}</p>
<table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
${row('Organisation', esc(input.organization))}
${typeof input.aiScore === 'number' ? row('Score IA', `${input.aiScore} / 100`) : ''}
</table>
<a href="${adminUrl}" style="display:inline-block;background:#ff5a00;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">Relire et valider</a>`;

  return send(cfg, {
    to: cfg.team,
    replyTo: cfg.team,
    subject,
    html: shell(subject, inner),
    text: [
      subject,
      '',
      intro,
      `Organisation : ${input.organization}`,
      typeof input.aiScore === 'number'
        ? `Score IA : ${input.aiScore}/100`
        : '',
      '',
      `Relire et valider : ${adminUrl}`,
    ]
      .filter((l) => l !== '')
      .join('\n'),
  });
}

// ────────────────────────────────────────────────────────────
// 1 ter. Rapport d'audit : livraison au prospect
// ────────────────────────────────────────────────────────────

export interface ReportDeliveryInput {
  name: string;
  email: string;
  organization: string;
  downloadUrl: string;
}

/**
 * Livre le rapport d'audit au prospect. Le PDF n'est pas joint : il est
 * servi par une route sous jeton signé, ce qui permet de faire expirer
 * le lien et de le révoquer.
 */
export async function sendReportDelivery(
  input: ReportDeliveryInput,
): Promise<SendEmailResult> {
  const cfg = readConfig();
  if (!cfg) return { ok: false, skipped: true };

  const firstName = input.name.split(' ')[0] || input.name;
  const subject = `Votre rapport d’audit IA : ${input.organization}`;

  const inner = `
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">Bonjour ${esc(firstName)},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">Votre rapport d’audit IA est prêt. Il reprend votre contexte, le format d’intervention que nous recommandons et une feuille de route en quatre temps.</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#1a1d24;">Le lien ci-dessous reste valable 30 jours.</p>
<a href="${esc(input.downloadUrl)}" style="display:inline-block;background:#ff5a00;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">Télécharger mon rapport</a>
<p style="margin:24px 0 0;font-size:13px;color:#5b6170;">Une question sur son contenu ? Répondez simplement à cet email, il arrive directement chez le consultant qui a préparé votre dossier.</p>
<p style="margin:16px 0 0;font-size:13px;color:#5b6170;">L’équipe OpenLab Consulting</p>`;

  const text = `Bonjour ${firstName},

Votre rapport d'audit IA est prêt. Le lien ci-dessous reste valable 30 jours.

${input.downloadUrl}

Une question sur son contenu ? Répondez simplement à cet email.

L'équipe OpenLab Consulting`;

  return send(cfg, {
    to: { address: input.email, name: input.name },
    replyTo: cfg.team,
    subject,
    html: shell(subject, inner),
    text,
  });
}

// ────────────────────────────────────────────────────────────
// 2. Accusé de réception (vers le prospect)
// ────────────────────────────────────────────────────────────

export interface AcknowledgementInput {
  source: 'contact' | 'audit-ia' | 'demo-produit';
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

  const title =
    input.source === 'audit-ia'
      ? 'Votre demande d’audit IA est bien reçue'
      : input.source === 'demo-produit'
        ? 'Votre demande de démo est bien reçue'
        : 'Votre message est bien reçu';
  const delay =
    input.source === 'audit-ia'
      ? 'Votre rapport personnalisé vous parviendra sous 24 h ouvrées.'
      : input.source === 'demo-produit'
        ? 'Un consultant vous recontacte sous 24 h ouvrées pour planifier votre démonstration.'
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

// ────────────────────────────────────────────────────────────
// 3. Livraison d'un livre blanc (vers le visiteur)
// ────────────────────────────────────────────────────────────

export interface WhitepaperDeliveryInput {
  name: string;
  email: string;
  /** Titre lisible du livre blanc (cf. lib/whitepapers.ts). */
  title: string;
  /** URL absolue du PDF (servi depuis /public/whitepapers). */
  downloadUrl: string;
}

/**
 * Envoie au visiteur le lien de téléchargement de son livre blanc. Le PDF
 * est aussi accessible immédiatement côté site ; cet email matérialise la
 * promesse « vous sera également envoyé par email » et garde une trace dans
 * la boîte du prospect. Reply-To = boîte équipe.
 */
export async function sendWhitepaperDelivery(
  input: WhitepaperDeliveryInput,
): Promise<SendEmailResult> {
  const cfg = readConfig();
  if (!cfg) return { ok: false, skipped: true };

  const firstName = input.name.split(' ')[0] || input.name;
  const subject = `Votre livre blanc : ${input.title}`;

  const inner = `
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">Bonjour ${esc(firstName)},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">Merci de votre intérêt. Voici votre exemplaire de «&nbsp;${esc(input.title)}&nbsp;» à télécharger :</p>
<a href="${esc(input.downloadUrl)}" style="display:inline-block;background:#ff5a00;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">Télécharger le PDF</a>
<p style="margin:20px 0 0;font-size:13px;color:#5b6170;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><span style="word-break:break-all;">${esc(input.downloadUrl)}</span></p>
<p style="margin:24px 0 0;font-size:13px;color:#5b6170;">L’équipe OpenLab Consulting</p>`;

  const text = `Bonjour ${firstName},

Merci de votre intérêt. Téléchargez « ${input.title} » : ${input.downloadUrl}

L'équipe OpenLab Consulting`;

  return send(cfg, {
    to: { address: input.email, name: input.name },
    replyTo: cfg.team,
    subject,
    html: shell(subject, inner),
    text,
  });
}
