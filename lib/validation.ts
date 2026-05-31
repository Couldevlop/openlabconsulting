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
 * Demande de démo produit (modale page /solutions/[slug]).
 *
 * `productSlug` est validé contre un format strict (slug kebab-case) pour
 * éviter toute injection ; le serveur revérifie que le produit existe
 * (lib/products) avant persistance (OWASP A03/A04). `message` est
 * optionnel — la friction doit rester minimale pour un lead chaud.
 */
export const demoRequestSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email().max(180),
  organization: z.string().min(2).max(180),
  phone: z
    .string()
    .max(32)
    .regex(/^[+()0-9.\s-]{6,32}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  productSlug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Produit invalide'),
  productName: z.string().min(1).max(120),
  message: z.string().max(2000).optional().or(z.literal('')),
  website: honeypot,
  'cf-turnstile-response': z.string().min(1).max(2048).optional(),
});

export type DemoRequestInput = z.infer<typeof demoRequestSchema>;

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
