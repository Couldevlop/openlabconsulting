import { z } from 'zod';

/**
 * Schémas Zod pour les formulaires publics (CLAUDE.md §10.3 — validation
 * stricte en entrée, anti-injection).
 *
 * Honeypot : champ `website` invisible côté UI, rempli uniquement par
 * les bots → on rejette si non vide. Pattern complémentaire au CAPTCHA.
 */

// Honeypot — doit être vide ; si rempli c'est un bot.
const honeypot = z.string().max(0, 'honeypot triggered').optional();

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email().max(180),
  organization: z.string().max(180).optional().or(z.literal('')),
  subject: z.enum([
    'audit-ia',
    'demo-produit',
    'conference',
    'partenariat',
    'presse',
    'autre',
  ]),
  message: z.string().min(20).max(4000),
  website: honeypot,
  'cf-turnstile-response': z.string().min(1).max(2048).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const auditIaSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email().max(180),
  organization: z.string().min(2).max(180),
  jobTitle: z.string().min(2).max(120),
  // Maturité IA déclarée par le répondant.
  maturity: z.enum(['decouverte', 'pilote', 'production', 'industrialisation']),
  // Volume d'employés impactés — sert au scoring lead.
  headcount: z.enum(['lt-50', '50-200', '200-1000', 'gt-1000']),
  // Champ libre : ce qu'il attend de l'audit.
  goal: z.string().min(20).max(2000),
  consentRgpd: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .transform((v) => v === true || v === 'on' || v === 'true'),
  website: honeypot,
  'cf-turnstile-response': z.string().min(1).max(2048).optional(),
});

export type AuditIaInput = z.infer<typeof auditIaSchema>;

/**
 * Whitelist des slugs de livres blancs téléchargeables. Empêche un
 * attaquant d'injecter un slug arbitraire pour deviner des chemins
 * ou polluer la collection `leads` avec des sources invalides.
 *
 * Sync avec les whitepapers disponibles dans
 * `app/(site)/livres-blancs/[slug]/page.tsx` (hardcoded en attendant
 * le binding Payload P6+).
 */
export const WHITEPAPER_SLUGS = ['ia-souveraine-ci-2026'] as const;

export const whitepaperRequestSchema = z.object({
  email: z.email().max(180),
  name: z.string().min(2).max(120).optional().or(z.literal('')),
  organization: z.string().max(180).optional().or(z.literal('')),
  slug: z.enum(WHITEPAPER_SLUGS),
  consentRgpd: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .transform((v) => v === true || v === 'on' || v === 'true'),
  website: honeypot,
  'cf-turnstile-response': z.string().min(1).max(2048).optional(),
});

export type WhitepaperRequestInput = z.infer<typeof whitepaperRequestSchema>;

/**
 * Sérialise les erreurs Zod en `{ field: message }` pour les renvoyer
 * tels quels au client (i18n-friendly).
 */
export function flattenZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join('.') || '_root';
    if (!out[path]) out[path] = issue.message;
  }
  return out;
}
