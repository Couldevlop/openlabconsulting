import 'server-only';
import {
  RD_AXES,
  PUBLICATIONS,
  PARTENARIATS,
  type RdAxe,
  type Publication,
  type Partenariat,
} from './data/laboratoire';

/**
 * Server-only : lecture des collections Laboratoire (`rd-axes`,
 * `publications`, `partnerships`) avec repli fail-soft sur les fallbacks
 * codés (`RD_AXES`, `PUBLICATIONS`, `PARTENARIATS`) si Payload est
 * indisponible ou la collection vide. Même pattern que `products-server`.
 *
 * OWASP A03/A05/A09 : requêtes paramétrées, pas de secret exposé, log
 * d'erreur en dev seulement.
 */

async function findDocs(
  collection: string,
): Promise<Record<string, unknown>[] | null> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: collection as 'rd-axes',
      sort: 'order',
      limit: 100,
      depth: 0,
    });
    return docs as Record<string, unknown>[];
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[laboratoire] fallback ${collection} — Payload indisponible:`,
        (err as Error).message,
      );
    }
    return null;
  }
}

/** Array Payload [{value}] → string[] (filtre les valeurs vides). */
function toStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((i) =>
      typeof i === 'object' &&
      i !== null &&
      typeof (i as { value?: unknown }).value === 'string'
        ? (i as { value: string }).value
        : '',
    )
    .filter((s) => s.length > 0);
}

function toRdAxe(raw: Record<string, unknown>): RdAxe | null {
  if (
    typeof raw.slug !== 'string' ||
    typeof raw.title !== 'string' ||
    typeof raw.pitch !== 'string'
  ) {
    return null;
  }
  return {
    slug: raw.slug,
    title: raw.title,
    pitch: raw.pitch,
    produitsLies: toStringArray(raw.produitsLies),
    exemples: toStringArray(raw.exemples),
  };
}

function isPublicationType(v: unknown): v is Publication['type'] {
  return (
    v === 'livre' ||
    v === 'livre-blanc' ||
    v === 'article-pair' ||
    v === 'conference'
  );
}

function toPublication(raw: Record<string, unknown>): Publication | null {
  if (
    !isPublicationType(raw.type) ||
    typeof raw.title !== 'string' ||
    typeof raw.year !== 'number' ||
    typeof raw.href !== 'string' ||
    typeof raw.summary !== 'string'
  ) {
    return null;
  }
  return {
    type: raw.type,
    title: raw.title,
    authors: toStringArray(raw.authors),
    year: raw.year,
    href: raw.href,
    summary: raw.summary,
    ...(typeof raw.slug === 'string' && raw.slug.length > 0
      ? { slug: raw.slug }
      : {}),
    ...(typeof raw.abstract === 'string' && raw.abstract.length > 0
      ? { abstract: raw.abstract }
      : {}),
  };
}

function isPartnerType(v: unknown): v is Partenariat['type'] {
  return (
    v === 'universitaire' || v === 'public' || v === 'prive' || v === 'ong'
  );
}

function toPartenariat(raw: Record<string, unknown>): Partenariat | null {
  if (
    typeof raw.slug !== 'string' ||
    typeof raw.title !== 'string' ||
    !isPartnerType(raw.type) ||
    typeof raw.pitch !== 'string'
  ) {
    return null;
  }
  return { slug: raw.slug, title: raw.title, type: raw.type, pitch: raw.pitch };
}

export async function getRdAxes(): Promise<readonly RdAxe[]> {
  const docs = await findDocs('rd-axes');
  if (!docs) return RD_AXES;
  const mapped = docs.map(toRdAxe).filter((a): a is RdAxe => a !== null);
  return mapped.length > 0 ? mapped : RD_AXES;
}

export async function getPublications(): Promise<readonly Publication[]> {
  const docs = await findDocs('publications');
  if (!docs) return PUBLICATIONS;
  const mapped = docs
    .map(toPublication)
    .filter((p): p is Publication => p !== null);
  return mapped.length > 0 ? mapped : PUBLICATIONS;
}

/** Publication unique par slug (page détail /laboratoire/publications/<slug>). */
export async function getPublicationBySlug(
  slug: string,
): Promise<Publication | null> {
  const pubs = await getPublications();
  return pubs.find((p) => p.slug === slug) ?? null;
}

export async function getPartnerships(): Promise<readonly Partenariat[]> {
  const docs = await findDocs('partnerships');
  if (!docs) return PARTENARIATS;
  const mapped = docs
    .map(toPartenariat)
    .filter((p): p is Partenariat => p !== null);
  return mapped.length > 0 ? mapped : PARTENARIATS;
}
