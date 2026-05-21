/**
 * Helper Anthropic Claude — CLAUDE.md §7 + §9.5.
 *
 * Trois cas d'usage couverts pour P9-modules :
 *   - `scoreLead(input)` : score 0-100 + résumé 2-3 phrases pour un lead.
 *   - `summarizeArticle(content)` : 3 bullet points pour boost GEO.
 *   - `detectSpam(text)` : booléen + raison, pour filtrage anti-spam.
 *
 * Tous les appels :
 *   - Fail-soft : si `ANTHROPIC_API_KEY` est absent ou Claude renvoie
 *     une erreur, on renvoie un fallback déterministe (pas de throw).
 *   - Coût plafonné : haïku 4.5 par défaut (le plus économique), max
 *     tokens limités, timeout 10 s.
 *   - Anonymisation : aucune PII identifiée n'est envoyée sauf si
 *     explicitement requis (scoring lead = oui, summarize article =
 *     non).
 */

const MODEL = 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = 10_000;

interface Anthropic {
  messages: {
    create: (args: {
      model: string;
      max_tokens: number;
      messages: { role: 'user' | 'assistant'; content: string }[];
      system?: string;
    }) => Promise<{
      content: { type: string; text: string }[];
    }>;
  };
}

let cachedClient: Anthropic | null = null;
let attempted = false;

async function getClient(): Promise<Anthropic | null> {
  if (cachedClient) return cachedClient;
  if (attempted) return null;
  attempted = true;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const mod = (await import('@anthropic-ai/sdk')) as unknown as {
      default: new (opts: { apiKey: string; timeout?: number }) => Anthropic;
    };
    cachedClient = new mod.default({ apiKey, timeout: TIMEOUT_MS });
    return cachedClient;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// 1. Lead scoring
// ────────────────────────────────────────────────────────────

export interface LeadScoreInput {
  source: 'contact' | 'audit-ia' | 'demo-produit' | 'whitepaper' | 'autre';
  name: string;
  email: string;
  organization?: string | null;
  jobTitle?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LeadScoreResult {
  score: number; // 0-100
  summary: string;
}

/**
 * Score un lead 0-100 + résumé court via Claude. Fallback : score
 * heuristique basé sur la présence d'organization + longueur du
 * message + email pro (pas gmail.com).
 */
export async function scoreLead(
  input: LeadScoreInput,
): Promise<LeadScoreResult> {
  const fallback = heuristicScore(input);
  const client = await getClient();
  if (!client) return fallback;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 256,
      system:
        'Tu es analyste commercial chez OpenLab Consulting (cabinet IA Côte d’Ivoire). Score les leads entrants 0-100 selon la qualité du contexte (taille org, titre du contact, clarté de la demande). Réponds STRICTEMENT en JSON { "score": number, "summary": string } sans markdown.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            source: input.source,
            name: input.name,
            email: input.email,
            organization: input.organization ?? null,
            jobTitle: input.jobTitle ?? null,
            message: input.message ?? null,
            metadata: input.metadata ?? null,
          }),
        },
      ],
    });
    const text = res.content.find((c) => c.type === 'text')?.text ?? '';
    const parsed = parseScoreResponse(text);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function parseScoreResponse(text: string): LeadScoreResult | null {
  try {
    // Tolère ```json ... ``` autour du JSON.
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    const obj = JSON.parse(cleaned) as { score?: unknown; summary?: unknown };
    if (typeof obj.score !== 'number' || typeof obj.summary !== 'string') {
      return null;
    }
    return {
      score: Math.max(0, Math.min(100, Math.round(obj.score))),
      summary: obj.summary.slice(0, 800),
    };
  } catch {
    return null;
  }
}

function heuristicScore(input: LeadScoreInput): LeadScoreResult {
  let score = 40; // base
  if (input.organization && input.organization.length >= 3) score += 15;
  if (input.jobTitle && input.jobTitle.length >= 3) score += 10;
  if (input.message && input.message.length >= 100) score += 10;
  if (input.source === 'audit-ia') score += 15;
  if (input.source === 'demo-produit') score += 10;
  // Email pro = pas un des principaux fournisseurs grand public.
  const personalDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
  ];
  const domain = input.email.split('@')[1]?.toLowerCase() ?? '';
  if (domain && !personalDomains.includes(domain)) score += 10;
  return {
    score: Math.min(100, score),
    summary: `Lead ${input.source} — ${input.organization ?? input.email}. Score heuristique (Claude indisponible).`,
  };
}

// ────────────────────────────────────────────────────────────
// 2. Summarize article (GEO §12.4)
// ────────────────────────────────────────────────────────────

/**
 * Résume un article en 3 bullets pour le haut de la page article —
 * boost GEO (LLM crawlers extraient ces bullets).
 */
export async function summarizeArticle(
  content: string,
): Promise<readonly string[]> {
  const client = await getClient();
  if (!client) {
    return ['Synthèse automatique indisponible (mode dev).'];
  }
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system:
        'Tu résumes un article OpenLab Consulting (IA, R&D, conseil pour l’Afrique francophone) en 3 puces très courtes (max 20 mots chacune), factuelles, sans formules creuses. Réponds JSON : { "bullets": string[] }',
      messages: [
        {
          role: 'user',
          content: content.slice(0, 8000), // cap pour le coût
        },
      ],
    });
    const text = res.content.find((c) => c.type === 'text')?.text ?? '';
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    const obj = JSON.parse(cleaned) as { bullets?: unknown };
    if (!Array.isArray(obj.bullets)) return [];
    return obj.bullets
      .filter((b): b is string => typeof b === 'string')
      .slice(0, 3);
  } catch {
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// 3. Spam detection (§10.5)
// ────────────────────────────────────────────────────────────

export interface SpamCheckResult {
  isSpam: boolean;
  reason: string;
}

export async function detectSpam(text: string): Promise<SpamCheckResult> {
  // Heuristique rapide d'abord : si > 5 liens HTTP ou répétitions
  // extrêmes, c'est sans doute du spam. On évite l'appel Claude.
  const links = (text.match(/https?:\/\//g) ?? []).length;
  if (links >= 5) {
    return { isSpam: true, reason: 'Trop de liens externes (≥5).' };
  }

  const client = await getClient();
  if (!client) return { isSpam: false, reason: 'No Claude key in dev mode.' };

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 128,
      system:
        'Tu détectes le spam dans les messages reçus via formulaire de contact d’un cabinet IA. Réponds JSON strict { "isSpam": boolean, "reason": string }.',
      messages: [{ role: 'user', content: text.slice(0, 4000) }],
    });
    const raw = res.content.find((c) => c.type === 'text')?.text ?? '';
    const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    const obj = JSON.parse(cleaned) as { isSpam?: unknown; reason?: unknown };
    if (typeof obj.isSpam !== 'boolean') {
      return { isSpam: false, reason: 'Format Claude invalide.' };
    }
    return {
      isSpam: obj.isSpam,
      reason: typeof obj.reason === 'string' ? obj.reason : '',
    };
  } catch {
    return { isSpam: false, reason: 'Claude indisponible.' };
  }
}
