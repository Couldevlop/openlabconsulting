import 'server-only';
import {
  FALLBACK_SECTORS,
  type Sector,
  type SectorSlug,
  type SectorCrossLink,
} from './data/sectors';

/**
 * Helper Server-only : interroge Payload `sectors` et retombe sur le
 * fallback hard-codé (`FALLBACK_SECTORS`) en cas d'erreur (DB down,
 * collection absente) ou de collection vide.
 *
 * Même découpage que `lib/products-server.ts` : les types + le fallback
 * vivent dans `lib/data/sectors.ts` (client-safe), le fetch Payload
 * (Node-only, tire `pg`) est isolé ici derrière `'server-only'`.
 */
export async function getPublishedSectors(): Promise<readonly Sector[]> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'sectors',
      where: { _status: { equals: 'published' } },
      sort: 'order',
      limit: 20,
      depth: 1,
    });
    const sectors = docs
      .map((d) => toSector(d as RawPayloadSector))
      .filter((s): s is Sector => s !== null);
    if (sectors.length === 0) return FALLBACK_SECTORS;
    return sectors;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[sectors] fallback to hard-coded sectors — Payload indisponible:',
        (err as Error).message,
      );
    }
    return FALLBACK_SECTORS;
  }
}

/**
 * Secteur unique par slug, pour /secteurs/[slug]. Retombe sur le secteur
 * hard-codé correspondant si Payload est indisponible ou que le secteur
 * n'est pas (encore) publié en base.
 */
export async function getSectorBySlug(slug: string): Promise<Sector | null> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'sectors',
      where: {
        and: [{ _status: { equals: 'published' } }, { slug: { equals: slug } }],
      },
      limit: 1,
      depth: 1,
    });
    const sector = docs[0] ? toSector(docs[0] as RawPayloadSector) : null;
    if (sector) return sector;
  } catch {
    // fallthrough vers le fallback
  }
  return FALLBACK_SECTORS.find((s) => s.slug === slug) ?? null;
}

interface RawPayloadValueRow {
  value?: unknown;
}

interface RawPayloadCrossLink {
  slug?: unknown;
  title?: unknown;
}

interface RawPayloadSector {
  id?: string | number;
  slug?: unknown;
  iconKey?: unknown;
  name?: unknown;
  tagline?: unknown;
  intro?: unknown;
  enjeux?: RawPayloadValueRow[];
  regulation?: RawPayloadValueRow[];
  produitsLies?: RawPayloadCrossLink[];
  expertisesLies?: RawPayloadCrossLink[];
}

function isSectorSlug(value: unknown): value is SectorSlug {
  return (
    value === 'secteur-public' ||
    value === 'banque-assurance' ||
    value === 'agro-industrie' ||
    value === 'sante' ||
    value === 'telecoms-energie'
  );
}

function toStringList(raw: RawPayloadValueRow[] | undefined): string[] {
  return (raw ?? [])
    .map((r) => (typeof r.value === 'string' ? r.value : null))
    .filter((r): r is string => r !== null);
}

function toCrossLinks(
  raw: RawPayloadCrossLink[] | undefined,
): SectorCrossLink[] {
  return (raw ?? [])
    .map((c): SectorCrossLink | null =>
      typeof c.slug === 'string' && typeof c.title === 'string'
        ? { slug: c.slug, title: c.title }
        : null,
    )
    .filter((c): c is SectorCrossLink => c !== null);
}

function toSector(raw: RawPayloadSector): Sector | null {
  if (
    !isSectorSlug(raw.slug) ||
    typeof raw.iconKey !== 'string' ||
    typeof raw.name !== 'string' ||
    typeof raw.tagline !== 'string' ||
    typeof raw.intro !== 'string'
  ) {
    return null;
  }
  return {
    slug: raw.slug,
    iconKey: raw.iconKey,
    name: raw.name,
    tagline: raw.tagline,
    intro: raw.intro,
    enjeux: toStringList(raw.enjeux),
    regulation: toStringList(raw.regulation),
    produitsLies: toCrossLinks(raw.produitsLies),
    expertisesLies: toCrossLinks(raw.expertisesLies),
  };
}
