import 'server-only';
import { BOOK } from '@/lib/data/book';

/**
 * Server-only : métadonnées du livre, global `book-settings` fusionné par
 * champ sur le fallback `BOOK` (lib/data/book.ts). Tout champ vide côté
 * Payload garde la valeur codée (couverture, chapitres, schema SEO restent
 * servis). Fail-soft : Payload indisponible → `BOOK`.
 */

type BookData = typeof BOOK;

function toStringArray(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const items = raw
    .map((i) =>
      typeof i === 'object' &&
      i !== null &&
      typeof (i as { value?: unknown }).value === 'string'
        ? (i as { value: string }).value
        : '',
    )
    .filter((s) => s.length > 0);
  return items.length > 0 ? items : null;
}

function toAudiences(
  raw: unknown,
): { label: string; description: string }[] | null {
  if (!Array.isArray(raw)) return null;
  const items = raw
    .map((a) =>
      typeof a === 'object' &&
      a !== null &&
      typeof (a as { label?: unknown }).label === 'string' &&
      typeof (a as { description?: unknown }).description === 'string'
        ? {
            label: (a as { label: string }).label,
            description: (a as { description: string }).description,
          }
        : null,
    )
    .filter((a): a is { label: string; description: string } => a !== null);
  return items.length > 0 ? items : null;
}

export async function getBook(): Promise<BookData> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const doc = (await payload.findGlobal({
      slug: 'book-settings',
      depth: 0,
    })) as Record<string, unknown>;

    const str = (k: string): string | undefined =>
      typeof doc[k] === 'string' && (doc[k] as string).trim().length > 0
        ? (doc[k] as string)
        : undefined;
    const num = (k: string): number | undefined =>
      typeof doc[k] === 'number' ? (doc[k] as number) : undefined;

    const longPitch = toStringArray(doc.longPitch);
    const audiences = toAudiences(doc.audiences);

    return {
      ...BOOK,
      title: str('title') ?? BOOK.title,
      subtitle: str('subtitle') ?? BOOK.subtitle,
      edition: str('edition') ?? BOOK.edition,
      isbn: str('isbn') ?? BOOK.isbn,
      pageCount: num('pageCount') ?? BOOK.pageCount,
      publicationYear: num('publicationYear') ?? BOOK.publicationYear,
      longPitch: longPitch ?? BOOK.longPitch,
      audiences: audiences ?? BOOK.audiences,
    } as BookData;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[cms] fallback Global book-settings — Payload indisponible:',
        (err as Error).message,
      );
    }
    return BOOK;
  }
}
