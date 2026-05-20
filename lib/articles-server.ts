import 'server-only';
import {
  CATEGORY_LABELS,
  FALLBACK_ARTICLES,
  formatArticleDate,
  type Article,
  type ArticleCategory,
} from './articles';

/**
 * Server-only : fetch des articles publiés depuis Payload, triés
 * desc par `publishedAt`. Retombe sur le fallback en cas d'erreur.
 *
 * Cf. lib/case-studies-server.ts pour la justification du split
 * client-safe / server-only.
 */
export async function getPublishedArticles(
  limit = 3,
): Promise<readonly Article[]> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'articles',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit,
      depth: 1,
    });
    const articles = docs
      .map((d) => toArticle(d as RawPayloadArticle))
      .filter((a): a is Article => a !== null);
    if (articles.length === 0) return FALLBACK_ARTICLES.slice(0, limit);
    return articles;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[articles] fallback to hard-coded articles — Payload indisponible:',
        (err as Error).message,
      );
    }
    return FALLBACK_ARTICLES.slice(0, limit);
  }
}

/**
 * Récupère un article unique par slug. Retourne null si non trouvé
 * ou DB indisponible.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
      },
      limit: 1,
      depth: 1,
    });
    const raw = docs[0];
    if (!raw) {
      return FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null;
    }
    return toArticle(raw as RawPayloadArticle);
  } catch {
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null;
  }
}

interface RawPayloadMedia {
  url?: string | null;
  alt?: string | null;
}

interface RawPayloadArticle {
  id?: string | number;
  slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  category?: unknown;
  author?: unknown;
  publishedAt?: unknown;
  cover?: RawPayloadMedia | string | number | null;
}

function isCategory(value: unknown): value is ArticleCategory {
  return typeof value === 'string' && value in CATEGORY_LABELS;
}

function normalizeCover(
  cover: RawPayloadArticle['cover'],
  fallbackAlt: string,
): { src: string | null; alt: string } {
  if (cover && typeof cover === 'object' && 'url' in cover) {
    return {
      src: typeof cover.url === 'string' ? cover.url : null,
      alt: typeof cover.alt === 'string' ? cover.alt : fallbackAlt,
    };
  }
  return { src: null, alt: fallbackAlt };
}

function toArticle(raw: RawPayloadArticle): Article | null {
  if (
    typeof raw.slug !== 'string' ||
    typeof raw.title !== 'string' ||
    typeof raw.excerpt !== 'string' ||
    typeof raw.author !== 'string' ||
    !isCategory(raw.category)
  ) {
    return null;
  }
  const isoDate =
    typeof raw.publishedAt === 'string'
      ? raw.publishedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
  return {
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    category: raw.category,
    categoryLabel: CATEGORY_LABELS[raw.category],
    author: raw.author,
    publishedAt: formatArticleDate(isoDate),
    isoDate,
    cover: normalizeCover(raw.cover, `Couverture — ${raw.title}`),
  };
}
