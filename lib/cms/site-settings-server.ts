import 'server-only';
import {
  AUDIT_IA_CTA_FALLBACK,
  FOOTER_FALLBACK,
  HERO_FALLBACK,
  MANIFESTO_FALLBACK,
  REASSURANCE_FALLBACK,
  type AuditIaCtaContent,
  type FooterContent,
  type HeroContent,
  type ManifestoContent,
  type ReassuranceContent,
  type ReassurancePartner,
} from './site-settings';

/**
 * Server-only : helpers de lecture des Globals Payload (CLAUDE.md §9).
 *
 * Clean architecture : la UI ne parle JAMAIS directement à Payload.
 * Les server components consomment ces helpers, qui :
 *   1. Tentent de fetch le Global via `payload.findGlobal({...})`
 *   2. Fusionnent avec un fallback hard-codé (résilience DB down)
 *   3. Retournent une forme typée stable (voir `./site-settings.ts`).
 *
 * Même pattern que articles-server.ts / case-studies-server.ts.
 *
 * OWASP A03 : Payload requêtes paramétrées → pas d'injection SQL.
 * OWASP A05 : pas de leak de secrets, juste des champs UI publics.
 * OWASP A09 : log d'erreur uniquement en dev, pas de stack en prod.
 */

async function readGlobal<T extends object>(
  slug: string,
  fallback: T,
): Promise<T> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const doc = await payload.findGlobal({ slug, depth: 1 });
    return mergeWithFallback(doc as Record<string, unknown>, fallback);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[cms] fallback Global ${slug} — Payload indisponible:`,
        (err as Error).message,
      );
    }
    return fallback;
  }
}

/**
 * Fusion champ-par-champ entre la valeur Payload et le fallback.
 * Si un champ est `null`/`undefined`/`''` côté Payload, on prend le
 * fallback. Préserve les listes non vides côté Payload. Fusion 1
 * niveau pour les groupes Payload (primaryCta, signature, cta).
 */
function mergeWithFallback<T extends object>(
  source: Record<string, unknown>,
  fallback: T,
): T {
  const merged = { ...fallback } as Record<string, unknown>;
  for (const key of Object.keys(fallback)) {
    const value = source[key];
    if (value === null || value === undefined || value === '') {
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length > 0) merged[key] = value;
      continue;
    }
    if (typeof value === 'object') {
      merged[key] = {
        ...(fallback[key as keyof T] as object),
        ...(value as object),
      };
      continue;
    }
    merged[key] = value;
  }
  return merged as T;
}

/** Normalise un tableau Payload [{text: ...}] en string[]. */
function normalizeTextArray(
  source: unknown,
  fallback: readonly string[],
): readonly string[] {
  if (!Array.isArray(source)) return fallback;
  const items = source
    .map((item) =>
      typeof item === 'string'
        ? item
        : typeof item === 'object' && item !== null && 'text' in item
          ? String((item as { text: unknown }).text)
          : '',
    )
    .filter((s) => s.length > 0);
  return items.length > 0 ? items : fallback;
}

export async function getHeroContent(): Promise<HeroContent> {
  return readGlobal('hero-settings', HERO_FALLBACK);
}

export async function getManifestoContent(): Promise<ManifestoContent> {
  const raw = await readGlobal('manifesto-settings', MANIFESTO_FALLBACK);
  // Normalisation des stances : Payload renvoie {id?, excuse, fact},
  // on garde uniquement excuse + fact (strings non vides).
  const stances = Array.isArray(raw.stances)
    ? raw.stances
        .filter(
          (
            s,
          ): s is { excuse: string; fact: string } & Record<string, unknown> =>
            typeof s === 'object' &&
            s !== null &&
            'excuse' in s &&
            'fact' in s &&
            typeof (s as { excuse: unknown }).excuse === 'string' &&
            typeof (s as { fact: unknown }).fact === 'string',
        )
        .map((s) => ({ excuse: s.excuse, fact: s.fact }))
    : [];
  return {
    ...raw,
    stances: stances.length > 0 ? stances : MANIFESTO_FALLBACK.stances,
  };
}

export async function getAuditIaCtaContent(): Promise<AuditIaCtaContent> {
  const raw = await readGlobal('audit-ia-cta-settings', AUDIT_IA_CTA_FALLBACK);
  return {
    ...raw,
    reassuranceBullets: normalizeTextArray(
      raw.reassuranceBullets,
      AUDIT_IA_CTA_FALLBACK.reassuranceBullets,
    ),
  };
}

export async function getFooterContent(): Promise<FooterContent> {
  return readGlobal('footer-settings', FOOTER_FALLBACK);
}

interface RawMedia {
  url?: string | null;
  width?: number | null;
  height?: number | null;
}

interface RawPartner {
  name?: unknown;
  logo?: RawMedia | string | number | null;
}

/**
 * Payload préfixe les URLs d'upload par `serverURL`. On relativise pour
 * que `next/image` les accepte sans whitelister de domaine (mirror de
 * lib/team-server.ts / articles-server.ts).
 */
function toRelativeMediaUrl(url: string): string {
  try {
    return /^https?:\/\//i.test(url) ? new URL(url).pathname : url;
  } catch {
    return url;
  }
}

/** Mappe un item Payload {name, logo:media} → ReassurancePartner, ou null. */
function toPartner(raw: RawPartner): ReassurancePartner | null {
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const media =
    raw.logo && typeof raw.logo === 'object' ? (raw.logo as RawMedia) : null;
  const url = media?.url ? toRelativeMediaUrl(media.url) : '';
  if (!name || !url) return null;
  return {
    name,
    src: url,
    // Media expose width/height ; défauts sûrs si absents.
    width: typeof media?.width === 'number' ? media.width : 160,
    height: typeof media?.height === 'number' ? media.height : 48,
  };
}

/**
 * Bandeau réassurance (CLAUDE.md §6.2). Fetch le global `reassurance-settings`,
 * résout les logos uploadés (Media), retombe sur les logos par défaut si le
 * global est vide ou Payload indisponible.
 */
export async function getReassuranceContent(): Promise<ReassuranceContent> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const doc = (await payload.findGlobal({
      slug: 'reassurance-settings',
      depth: 1,
    })) as { eyebrow?: unknown; partners?: unknown };

    const eyebrow =
      typeof doc.eyebrow === 'string' && doc.eyebrow.trim()
        ? doc.eyebrow.trim()
        : REASSURANCE_FALLBACK.eyebrow;

    const partners = Array.isArray(doc.partners)
      ? doc.partners
          .map((p) => toPartner(p as RawPartner))
          .filter((p): p is ReassurancePartner => p !== null)
      : [];

    return {
      eyebrow,
      partners: partners.length > 0 ? partners : REASSURANCE_FALLBACK.partners,
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[cms] fallback Global reassurance-settings — Payload indisponible:',
        (err as Error).message,
      );
    }
    return REASSURANCE_FALLBACK;
  }
}
