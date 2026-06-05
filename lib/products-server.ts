import 'server-only';
import {
  FALLBACK_PRODUCTS,
  PRODUCT_SLUG_PATTERN,
  type Product,
  type ProductStatus,
  type ProductFeature,
  type ProductProof,
  type ProductPricing,
  type ProductFaq,
  type ProductExpertise,
} from './data/products';

/**
 * Helper Server-only : interroge Payload `products` et retombe sur le
 * fallback hard-codé (`FALLBACK_PRODUCTS`) en cas d'erreur (DB down,
 * collection absente) ou de collection vide.
 *
 * Pourquoi un fichier séparé du `lib/data/products.ts` "client-safe" :
 *   - Les types + le fallback doivent être importables par des Client
 *     Components (cartes, démos) sans tirer `payload`/`pg` (Node-only).
 *   - L'import dynamique de `payload` + `@payload-config` tire
 *     transitivement `pg`. Webpack le résout statiquement même via
 *     `await import(...)` et casse le bundle client.
 *   - En isolant le fetch ici (et en ajoutant `'server-only'`), on
 *     interdit le bundling côté client. Aligné sur `case-studies-server`.
 */
export async function getPublishedProducts(): Promise<readonly Product[]> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      sort: 'order',
      limit: 20,
      depth: 1,
    });
    const products = docs
      .map((d) => toProduct(d as RawPayloadProduct))
      .filter((p): p is Product => p !== null);
    if (products.length === 0) return FALLBACK_PRODUCTS;
    return products;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[products] fallback to hard-coded products — Payload indisponible:',
        (err as Error).message,
      );
    }
    return FALLBACK_PRODUCTS;
  }
}

/**
 * Produit unique par slug, pour /solutions/[slug]. Retombe sur le produit
 * hard-codé correspondant si Payload est indisponible ou que le produit
 * n'est pas (encore) publié en base.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'products',
      where: {
        and: [{ _status: { equals: 'published' } }, { slug: { equals: slug } }],
      },
      limit: 1,
      depth: 1,
    });
    const product = docs[0] ? toProduct(docs[0] as RawPayloadProduct) : null;
    if (product) return product;
  } catch {
    // fallthrough vers le fallback
  }
  return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

interface RawPayloadFeature {
  iconKey?: unknown;
  title?: unknown;
  body?: unknown;
}

interface RawPayloadStackLine {
  value?: unknown;
}

interface RawPayloadProof {
  value?: unknown;
  label?: unknown;
  source?: unknown;
}

interface RawPayloadPricingDetail {
  value?: unknown;
}

interface RawPayloadPricing {
  model?: unknown;
  headline?: unknown;
  details?: RawPayloadPricingDetail[];
  note?: unknown;
}

interface RawPayloadFaq {
  question?: unknown;
  answer?: unknown;
}

interface RawPayloadExpertise {
  slug?: unknown;
  title?: unknown;
}

interface RawPayloadProduct {
  id?: string | number;
  slug?: unknown;
  iconKey?: unknown;
  name?: unknown;
  tagline?: unknown;
  target?: unknown;
  maturity?: unknown;
  statusLabel?: unknown;
  eyebrow?: unknown;
  intro?: unknown;
  problem?: unknown;
  features?: RawPayloadFeature[];
  stack?: RawPayloadStackLine[];
  proofs?: RawPayloadProof[];
  pricing?: RawPayloadPricing | null;
  faq?: RawPayloadFaq[];
  expertisesLies?: RawPayloadExpertise[];
}

/**
 * Slug libre (plus d'union fermée) : tout kebab-case valide est accepté
 * pour qu'un produit créé depuis l'admin soit servi sans déploiement.
 */
function isProductSlug(value: unknown): value is string {
  return typeof value === 'string' && PRODUCT_SLUG_PATTERN.test(value);
}

function isProductStatus(value: unknown): value is ProductStatus {
  return (
    value === 'production' ||
    value === 'pilot' ||
    value === 'mvp' ||
    value === 'dev'
  );
}

function isPricingModel(value: unknown): value is ProductPricing['model'] {
  return value === 'saas' || value === 'license' || value === 'quote';
}

function toFeatures(raw: RawPayloadFeature[] | undefined): ProductFeature[] {
  return (raw ?? [])
    .map((f): ProductFeature | null =>
      typeof f.iconKey === 'string' &&
      typeof f.title === 'string' &&
      typeof f.body === 'string'
        ? { iconKey: f.iconKey, title: f.title, body: f.body }
        : null,
    )
    .filter((f): f is ProductFeature => f !== null);
}

function toStack(raw: RawPayloadStackLine[] | undefined): string[] {
  return (raw ?? [])
    .map((s) => (typeof s.value === 'string' ? s.value : null))
    .filter((s): s is string => s !== null);
}

function toProofs(raw: RawPayloadProof[] | undefined): ProductProof[] {
  return (raw ?? [])
    .map((p): ProductProof | null =>
      typeof p.value === 'string' &&
      typeof p.label === 'string' &&
      typeof p.source === 'string'
        ? { value: p.value, label: p.label, source: p.source }
        : null,
    )
    .filter((p): p is ProductProof => p !== null);
}

function toPricing(
  raw: RawPayloadPricing | null | undefined,
): ProductPricing | null {
  if (!raw || typeof raw !== 'object') return null;
  if (!isPricingModel(raw.model) || typeof raw.headline !== 'string') {
    return null;
  }
  const details = (raw.details ?? [])
    .map((d) => (typeof d.value === 'string' ? d.value : null))
    .filter((d): d is string => d !== null);
  return {
    model: raw.model,
    headline: raw.headline,
    details,
    ...(typeof raw.note === 'string' && raw.note.length > 0
      ? { note: raw.note }
      : {}),
  };
}

function toFaq(raw: RawPayloadFaq[] | undefined): ProductFaq[] {
  return (raw ?? [])
    .map((f): ProductFaq | null =>
      typeof f.question === 'string' && typeof f.answer === 'string'
        ? { question: f.question, answer: f.answer }
        : null,
    )
    .filter((f): f is ProductFaq => f !== null);
}

function toExpertises(
  raw: RawPayloadExpertise[] | undefined,
): ProductExpertise[] {
  return (raw ?? [])
    .map((e): ProductExpertise | null =>
      typeof e.slug === 'string' && typeof e.title === 'string'
        ? { slug: e.slug, title: e.title }
        : null,
    )
    .filter((e): e is ProductExpertise => e !== null);
}

function toProduct(raw: RawPayloadProduct): Product | null {
  if (
    !isProductSlug(raw.slug) ||
    typeof raw.iconKey !== 'string' ||
    typeof raw.name !== 'string' ||
    typeof raw.tagline !== 'string' ||
    typeof raw.target !== 'string' ||
    !isProductStatus(raw.maturity) ||
    typeof raw.statusLabel !== 'string' ||
    typeof raw.eyebrow !== 'string' ||
    typeof raw.intro !== 'string' ||
    typeof raw.problem !== 'string'
  ) {
    return null;
  }
  const pricing = toPricing(raw.pricing);
  if (!pricing) return null;
  return {
    slug: raw.slug,
    iconKey: raw.iconKey,
    name: raw.name,
    tagline: raw.tagline,
    target: raw.target,
    status: raw.maturity,
    statusLabel: raw.statusLabel,
    eyebrow: raw.eyebrow,
    intro: raw.intro,
    problem: raw.problem,
    features: toFeatures(raw.features),
    stack: toStack(raw.stack),
    proofs: toProofs(raw.proofs),
    pricing,
    faq: toFaq(raw.faq),
    expertisesLies: toExpertises(raw.expertisesLies),
  };
}
