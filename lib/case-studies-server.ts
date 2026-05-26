import 'server-only';
import {
  FALLBACK_CASE_STUDIES,
  type CaseStudy,
  type CaseStudyResult,
  type ProductSlug,
} from './case-studies';

/**
 * Helper Server-only : interroge Payload `caseStudies` et retombe sur
 * le fallback hard-codé en cas d'erreur (DB down, collection absente).
 *
 * Pourquoi un fichier séparé du `case-studies.ts` "client-safe" :
 *   - Les types + le fallback doivent être importables par
 *     `CasesCarousel` (`'use client'`) pour le rendu déterministe.
 *   - Mais l'import dynamique de `payload` + `@payload-config` tire
 *     transitivement `pg` (Node-only). Webpack le résout statiquement
 *     même via `await import(...)` et casse le bundle client.
 *   - En isolant le fetch ici (et en ajoutant `'server-only'`), on
 *     interdit le bundling côté client et on rétablit la compilation.
 */
export async function getPublishedCaseStudies(): Promise<readonly CaseStudy[]> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'caseStudies',
      where: { status: { equals: 'published' } },
      sort: 'order',
      limit: 8,
      depth: 1,
    });
    const studies = docs
      .map((d) => toCaseStudy(d as RawPayloadCaseStudy))
      .filter((s): s is CaseStudy => s !== null);
    if (studies.length === 0) return FALLBACK_CASE_STUDIES;
    return studies;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[case-studies] fallback to hard-coded cases — Payload indisponible:',
        (err as Error).message,
      );
    }
    return FALLBACK_CASE_STUDIES;
  }
}

/**
 * Cas client associé à un produit (section §7.1 « Témoignage ou cas
 * client » de /solutions/[slug]). Retourne null si aucun cas réel n'existe
 * pour ce produit — on n'affiche jamais de témoignage fabriqué.
 */
export async function getCaseStudyForProduct(
  productSlug: ProductSlug,
): Promise<CaseStudy | null> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'caseStudies',
      where: {
        and: [
          { status: { equals: 'published' } },
          { productSlug: { equals: productSlug } },
        ],
      },
      sort: 'order',
      limit: 1,
      depth: 1,
    });
    const study = docs[0] ? toCaseStudy(docs[0] as RawPayloadCaseStudy) : null;
    if (study) return study;
  } catch {
    // fallthrough vers le fallback
  }
  return (
    FALLBACK_CASE_STUDIES.find((s) => s.productSlug === productSlug) ?? null
  );
}

interface RawPayloadResult {
  value?: unknown;
  label?: unknown;
}

interface RawPayloadMedia {
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
}

interface RawPayloadCaseStudy {
  id?: string | number;
  headline?: unknown;
  punchline?: unknown;
  body?: unknown;
  sector?: unknown;
  client?: unknown;
  productSlug?: unknown;
  results?: RawPayloadResult[];
  image?: RawPayloadMedia | string | number | null;
  order?: unknown;
  status?: unknown;
}

function isProductSlug(value: unknown): value is ProductSlug {
  return (
    value === 'nexusrh' ||
    value === 'nexuserp' ||
    value === 'sygescom' ||
    value === 'agrosense' ||
    value === 'qualitos' ||
    value === 'fraud-shield' ||
    value === 'smart-city'
  );
}

function normalizeImage(image: RawPayloadCaseStudy['image']): {
  url: string | null;
  alt: string | null;
} {
  if (image && typeof image === 'object' && 'url' in image) {
    return {
      url: typeof image.url === 'string' ? image.url : null,
      alt: typeof image.alt === 'string' ? image.alt : null,
    };
  }
  return { url: null, alt: null };
}

function toCaseStudy(raw: RawPayloadCaseStudy): CaseStudy | null {
  if (
    typeof raw.headline !== 'string' ||
    typeof raw.punchline !== 'string' ||
    typeof raw.body !== 'string' ||
    typeof raw.sector !== 'string' ||
    typeof raw.client !== 'string' ||
    !isProductSlug(raw.productSlug)
  ) {
    return null;
  }
  const results = (raw.results ?? [])
    .map((r): CaseStudyResult | null =>
      typeof r.value === 'string' && typeof r.label === 'string'
        ? { value: r.value, label: r.label }
        : null,
    )
    .filter((r): r is CaseStudyResult => r !== null);
  if (results.length < 3) return null;
  const { url, alt } = normalizeImage(raw.image);
  return {
    id: String(raw.id ?? `${raw.productSlug}-${raw.headline}`),
    sector: raw.sector,
    client: raw.client,
    headline: raw.headline,
    punchline: raw.punchline,
    body: raw.body,
    results: results.slice(0, 3),
    productSlug: raw.productSlug,
    imageUrl: url,
    imageAlt: alt,
    href: `/solutions/${raw.productSlug}`,
  };
}
