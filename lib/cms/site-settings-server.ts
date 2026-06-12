import 'server-only';
import {
  ABOUT_FALLBACK,
  AUDIT_IA_CTA_FALLBACK,
  FOOTER_FALLBACK,
  HERO_FALLBACK,
  INSIGHTS_HUB_FALLBACK,
  MANIFESTO_FALLBACK,
  METHODOLOGIE_FALLBACK,
  REASSURANCE_FALLBACK,
  SOLUTIONS_HUB_FALLBACK,
  EXPERTISES_HUB_FALLBACK,
  SECTEURS_HUB_FALLBACK,
  type AboutContent,
  type AuditIaCtaContent,
  type FooterContent,
  type HeroContent,
  type HubHeroContent,
  type InsightsHubContent,
  type ManifestoContent,
  type MethodologieAxis,
  type MethodologieContent,
  type ReassuranceContent,
  type ReassurancePartner,
} from './site-settings';
import { interpolateCounts } from '@/lib/format/product-count';
import { getProductCount } from './product-count-server';

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
  const raw = await readGlobal('hero-settings', HERO_FALLBACK);
  const count = await getProductCount();
  return { ...raw, subtitle: interpolateCounts(raw.subtitle, count) };
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
  const count = await getProductCount();
  const resolved = stances.length > 0 ? stances : MANIFESTO_FALLBACK.stances;
  return {
    ...raw,
    intro: interpolateCounts(raw.intro, count),
    stances: resolved.map((s) => ({
      excuse: s.excuse,
      fact: interpolateCounts(s.fact, count),
    })),
  };
}

export async function getMethodologieContent(): Promise<MethodologieContent> {
  const raw = await readGlobal('methodologie', METHODOLOGIE_FALLBACK);
  // Normalisation des axes : Payload renvoie {id?, index, title, punchline,
  // body}, on garde uniquement les 4 strings non vides. Si un seul champ
  // manque ou si la liste est vide, on retombe sur les 3 axes du fallback.
  const axes = Array.isArray(raw.axes)
    ? raw.axes
        .filter(
          (a): a is MethodologieAxis & Record<string, unknown> =>
            typeof a === 'object' &&
            a !== null &&
            'index' in a &&
            'title' in a &&
            'punchline' in a &&
            'body' in a &&
            typeof (a as { index: unknown }).index === 'string' &&
            typeof (a as { title: unknown }).title === 'string' &&
            typeof (a as { punchline: unknown }).punchline === 'string' &&
            typeof (a as { body: unknown }).body === 'string',
        )
        .map((a) => ({
          index: a.index,
          title: a.title,
          punchline: a.punchline,
          body: a.body,
        }))
    : [];
  return {
    ...raw,
    axes: axes.length > 0 ? axes : METHODOLOGIE_FALLBACK.axes,
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

export async function getAboutContent(): Promise<AboutContent> {
  const raw = await readGlobal('about-settings', ABOUT_FALLBACK);
  // Normalise les piliers : Payload renvoie {id?, title, body} ; on ne garde
  // que les entrées avec title + body non vides, sinon le fallback.
  const pillars = Array.isArray(raw.pillars)
    ? raw.pillars
        .filter(
          (p): p is { title: string; body: string } =>
            typeof p === 'object' &&
            p !== null &&
            typeof (p as { title?: unknown }).title === 'string' &&
            typeof (p as { body?: unknown }).body === 'string' &&
            (p as { title: string }).title.trim().length > 0,
        )
        .map((p) => ({ title: p.title, body: p.body }))
    : [];
  const count = await getProductCount();
  const resolved = pillars.length > 0 ? pillars : ABOUT_FALLBACK.pillars;
  return {
    ...raw,
    pillars: resolved.map((p) => ({
      title: p.title,
      body: interpolateCounts(p.body, count),
    })),
  };
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

export async function getInsightsHubContent(): Promise<InsightsHubContent> {
  return readGlobal('insights-hub-settings', INSIGHTS_HUB_FALLBACK);
}

/**
 * Hero éditorial d'une page hub (Solutions/Expertises/Secteurs). Interpole
 * les tokens de compteur dans `headlineLead` + `description`.
 */
async function getHubHero(
  slug: string,
  fallback: HubHeroContent,
): Promise<HubHeroContent> {
  const raw = await readGlobal(slug, fallback);
  const count = await getProductCount();
  return {
    ...raw,
    headlineLead: interpolateCounts(raw.headlineLead, count),
    description: interpolateCounts(raw.description, count),
  };
}

export async function getSolutionsHubContent(): Promise<HubHeroContent> {
  return getHubHero('solutions-hub-settings', SOLUTIONS_HUB_FALLBACK);
}

export async function getExpertisesHubContent(): Promise<HubHeroContent> {
  return getHubHero('expertises-hub-settings', EXPERTISES_HUB_FALLBACK);
}

export async function getSecteursHubContent(): Promise<HubHeroContent> {
  return getHubHero('secteurs-hub-settings', SECTEURS_HUB_FALLBACK);
}
