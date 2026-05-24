import 'server-only';
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext';
import {
  CATEGORY_LABELS,
  FALLBACK_ARTICLES,
  formatArticleDate,
  estimateReadingTime,
  type Article,
  type ArticleCategory,
  type ArticleContent,
  type ArticleSource,
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
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit,
      depth: 1,
      // Perf : la liste n'affiche pas le corps. On ne charge donc ni
      // `content` (Lexical volumineux) ni `sources` — réservés au détail.
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        author: true,
        publishedAt: true,
        cover: true,
        summary: true,
      },
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
 *
 * Mode preview (`draft: true`) — réservé à la prévisualisation admin :
 *   - renvoie la dernière version brouillon (sans filtre `status`) ;
 *   - `overrideAccess: true` est sûr ici car ce mode n'est atteint
 *     QUE via la route /api/preview, elle-même gardée par une
 *     authentification Payload (OWASP A01) puis le draftMode Next.
 *   - en cas d'erreur/absence, retourne null (pas de fallback brouillon).
 */
export async function getArticleBySlug(
  slug: string,
  options: { draft?: boolean } = {},
): Promise<Article | null> {
  const draft = options.draft === true;
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'articles',
      where: draft
        ? { slug: { equals: slug } }
        : {
            and: [
              { slug: { equals: slug } },
              { _status: { equals: 'published' } },
            ],
          },
      draft,
      overrideAccess: draft,
      limit: 1,
      depth: 1,
    });
    const raw = docs[0];
    if (!raw) {
      return draft
        ? null
        : (FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null);
    }
    return toArticle(raw as RawPayloadArticle);
  } catch {
    return draft
      ? null
      : (FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null);
  }
}

interface RawPayloadMedia {
  url?: string | null;
  alt?: string | null;
}

export interface RawPayloadArticle {
  id?: string | number;
  slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  category?: unknown;
  author?: unknown;
  publishedAt?: unknown;
  cover?: RawPayloadMedia | string | number | null;
  summary?: unknown;
  sources?: unknown;
  content?: unknown;
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

/** Array Payload `summary` → liste de points clés non vides. */
function normalizeSummary(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) =>
      row && typeof row === 'object' && 'point' in row
        ? (row as { point?: unknown }).point
        : null,
    )
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
}

/** Array Payload `sources` → liste {label,url} valides (http/https). */
function normalizeSources(value: unknown): readonly ArticleSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row): ArticleSource[] => {
    if (!row || typeof row !== 'object') return [];
    const { label, url } = row as { label?: unknown; url?: unknown };
    if (
      typeof label === 'string' &&
      typeof url === 'string' &&
      /^https?:\/\//.test(url)
    ) {
      return [{ label, url }];
    }
    return [];
  });
}

/** Le richText Payload est un objet { root: ... } ; sinon `null`. */
function normalizeContent(value: unknown): ArticleContent | null {
  if (value && typeof value === 'object' && 'root' in value) {
    return value as ArticleContent;
  }
  return null;
}

/** Temps de lecture estimé depuis le corps Lexical (0 si vide/illisible). */
function computeReadingTime(content: ArticleContent | null): number {
  if (!content) return 0;
  try {
    return estimateReadingTime(convertLexicalToPlaintext({ data: content }));
  } catch {
    return 0;
  }
}

/**
 * Mappe un document Payload brut vers le type domaine `Article`.
 * Exporté pour les tests unitaires (le chemin "Payload up" n'étant pas
 * joignable via les helpers à cause des stubs Vite — cf. tests).
 * Retourne `null` si les champs obligatoires sont absents/invalides.
 */
export function toArticle(raw: RawPayloadArticle): Article | null {
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
  const content = normalizeContent(raw.content);
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
    summary: normalizeSummary(raw.summary),
    sources: normalizeSources(raw.sources),
    readingTime: computeReadingTime(content),
    content,
  };
}
