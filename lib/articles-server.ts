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
 * Champs chargés pour les listes/cartes (sans le corps Lexical ni les
 * sources, réservés au détail). Factorisé pour toutes les requêtes liste.
 */
const LIST_SELECT = {
  slug: true,
  title: true,
  excerpt: true,
  category: true,
  author: true,
  publishedAt: true,
  cover: true,
  summary: true,
} as const;

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
      select: LIST_SELECT,
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
 * Articles liés : même catégorie, hors article courant, publiés.
 * Sert le bloc « À lire aussi » de /insights/[slug] (anti cul-de-sac §4.9).
 * Fallback : filtre les FALLBACK_ARTICLES.
 */
export async function getRelatedArticles(
  category: ArticleCategory,
  excludeSlug: string,
  limit = 3,
): Promise<readonly Article[]> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { category: { equals: category } },
          { slug: { not_equals: excludeSlug } },
        ],
      },
      sort: '-publishedAt',
      limit,
      depth: 1,
      select: LIST_SELECT,
    });
    const articles = docs
      .map((d) => toArticle(d as RawPayloadArticle))
      .filter((a): a is Article => a !== null);
    if (articles.length > 0) return articles;
  } catch {
    // fallthrough vers le fallback
  }
  return FALLBACK_ARTICLES.filter(
    (a) => a.category === category && a.slug !== excludeSlug,
  ).slice(0, limit);
}

export interface PagedArticles {
  articles: readonly Article[];
  /** Page courante (1-indexée). */
  page: number;
  totalPages: number;
}

/**
 * Pagination SSR du hub /insights (pas de JS client, bon pour le SEO).
 * `page` 1-indexée ; `perPage` = taille de page (grille 3×N).
 */
export async function getPagedArticles(
  page = 1,
  perPage = 9,
): Promise<PagedArticles> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: 'articles',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      page: safePage,
      limit: perPage,
      depth: 1,
      select: LIST_SELECT,
    });
    const articles = res.docs
      .map((d) => toArticle(d as RawPayloadArticle))
      .filter((a): a is Article => a !== null);
    if (articles.length > 0) {
      return {
        articles,
        page: safePage,
        totalPages: typeof res.totalPages === 'number' ? res.totalPages : 1,
      };
    }
  } catch {
    // fallthrough vers le fallback
  }
  const totalPages = Math.max(1, Math.ceil(FALLBACK_ARTICLES.length / perPage));
  const start = (safePage - 1) * perPage;
  return {
    articles: FALLBACK_ARTICLES.slice(start, start + perPage),
    page: safePage,
    totalPages,
  };
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

/**
 * Rend une URL média relative à l'origine.
 *
 * Payload préfixe les URLs d'upload par `serverURL` (ex.
 * `http://localhost:3000/api/media/file/x.png`). En relativisant
 * (`/api/media/file/x.png`), `next/image` l'accepte sans qu'on ait à
 * whitelister chaque domaine (dev, preprod, prod) dans next.config.
 */
function toRelativeMediaUrl(url: string): string {
  try {
    return /^https?:\/\//i.test(url) ? new URL(url).pathname : url;
  } catch {
    return url;
  }
}

function normalizeCover(
  cover: RawPayloadArticle['cover'],
  fallbackAlt: string,
): { src: string | null; alt: string } {
  if (cover && typeof cover === 'object' && 'url' in cover) {
    return {
      src: typeof cover.url === 'string' ? toRelativeMediaUrl(cover.url) : null,
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
