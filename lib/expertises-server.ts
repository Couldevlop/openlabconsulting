import 'server-only';
import {
  FALLBACK_EXPERTISES,
  type Expertise,
  type ExpertiseSlug,
  type ApproachStep,
  type ExpertiseProduct,
} from './data/expertises';

/**
 * Helper Server-only : interroge Payload `expertises` et retombe sur le
 * fallback hard-codé (`FALLBACK_EXPERTISES`) en cas d'erreur (DB down,
 * collection absente) ou de collection vide.
 *
 * Même découpage que `lib/products-server.ts` : les types + le fallback
 * vivent dans `lib/data/expertises.ts` (client-safe), le fetch Payload
 * (Node-only, tire `pg`) est isolé ici derrière `'server-only'`.
 */
export async function getPublishedExpertises(): Promise<readonly Expertise[]> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'expertises',
      where: { _status: { equals: 'published' } },
      sort: 'order',
      limit: 20,
      depth: 1,
    });
    const expertises = docs
      .map((d) => toExpertise(d as RawPayloadExpertise))
      .filter((e): e is Expertise => e !== null);
    if (expertises.length === 0) return FALLBACK_EXPERTISES;
    return expertises;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[expertises] fallback to hard-coded expertises — Payload indisponible:',
        (err as Error).message,
      );
    }
    return FALLBACK_EXPERTISES;
  }
}

/**
 * Expertise unique par slug, pour /expertises/[slug]. Retombe sur
 * l'expertise hard-codée correspondante si Payload est indisponible ou que
 * l'expertise n'est pas (encore) publiée en base.
 */
export async function getExpertiseBySlug(
  slug: string,
): Promise<Expertise | null> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'expertises',
      where: {
        and: [{ _status: { equals: 'published' } }, { slug: { equals: slug } }],
      },
      limit: 1,
      depth: 1,
    });
    const expertise = docs[0]
      ? toExpertise(docs[0] as RawPayloadExpertise)
      : null;
    if (expertise) return expertise;
  } catch {
    // fallthrough vers le fallback
  }
  return FALLBACK_EXPERTISES.find((e) => e.slug === slug) ?? null;
}

interface RawPayloadValueRow {
  value?: unknown;
}

interface RawPayloadApproachStep {
  step?: unknown;
  title?: unknown;
  body?: unknown;
}

interface RawPayloadExpertiseProduct {
  slug?: unknown;
  name?: unknown;
}

interface RawPayloadExpertise {
  id?: string | number;
  slug?: unknown;
  iconKey?: unknown;
  title?: unknown;
  punchline?: unknown;
  intro?: unknown;
  competences?: RawPayloadValueRow[];
  approche?: RawPayloadApproachStep[];
  produitsLies?: RawPayloadExpertiseProduct[];
}

function isExpertiseSlug(value: unknown): value is ExpertiseSlug {
  return (
    value === 'conseil-strategie' ||
    value === 'agents-automatisation' ||
    value === 'data-gouvernance' ||
    value === 'cybersecurite-ia'
  );
}

function toStringList(raw: RawPayloadValueRow[] | undefined): string[] {
  return (raw ?? [])
    .map((r) => (typeof r.value === 'string' ? r.value : null))
    .filter((r): r is string => r !== null);
}

function toApproach(raw: RawPayloadApproachStep[] | undefined): ApproachStep[] {
  return (raw ?? [])
    .map((a): ApproachStep | null =>
      typeof a.step === 'string' &&
      typeof a.title === 'string' &&
      typeof a.body === 'string'
        ? { step: a.step, title: a.title, body: a.body }
        : null,
    )
    .filter((a): a is ApproachStep => a !== null);
}

function toProduits(
  raw: RawPayloadExpertiseProduct[] | undefined,
): ExpertiseProduct[] {
  return (raw ?? [])
    .map((p): ExpertiseProduct | null =>
      typeof p.slug === 'string' && typeof p.name === 'string'
        ? { slug: p.slug, name: p.name }
        : null,
    )
    .filter((p): p is ExpertiseProduct => p !== null);
}

function toExpertise(raw: RawPayloadExpertise): Expertise | null {
  if (
    !isExpertiseSlug(raw.slug) ||
    typeof raw.iconKey !== 'string' ||
    typeof raw.title !== 'string' ||
    typeof raw.punchline !== 'string' ||
    typeof raw.intro !== 'string'
  ) {
    return null;
  }
  return {
    slug: raw.slug,
    iconKey: raw.iconKey,
    title: raw.title,
    punchline: raw.punchline,
    intro: raw.intro,
    competences: toStringList(raw.competences),
    approche: toApproach(raw.approche),
    produitsLies: toProduits(raw.produitsLies),
  };
}
