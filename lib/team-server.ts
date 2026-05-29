import 'server-only';
import {
  FALLBACK_TEAM_MEMBERS,
  SIGNATURE_PUBLICATIONS,
  type TeamMember,
  type TeamPublication,
} from './data/team';

/**
 * Helper Server-only : interroge Payload `teamMembers` / `teamPublications`
 * et retombe sur le fallback hard-codé (`FALLBACK_TEAM_MEMBERS` /
 * `SIGNATURE_PUBLICATIONS`) en cas d'erreur (DB down, collection absente)
 * ou de collection vide.
 *
 * Même découpage que `lib/products-server.ts` : les types + le fallback
 * vivent dans `lib/data/team.ts` (client-safe), le fetch Payload (Node-only,
 * tire `pg`) est isolé ici derrière `'server-only'`.
 *
 * Portrait : l'`image` CMS (relationTo media) est relativisée comme dans
 * `lib/articles-server.ts`. Si aucune image n'est rattachée, on conserve
 * l'`imagePath` du domaine (placeholder côté page).
 */
export async function getTeamMembers(): Promise<readonly TeamMember[]> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'teamMembers',
      where: { _status: { equals: 'published' } },
      sort: 'order',
      limit: 50,
      depth: 1,
    });
    const members = docs
      .map((d) => toTeamMember(d as RawPayloadTeamMember))
      .filter((m): m is TeamMember => m !== null);
    if (members.length === 0) return FALLBACK_TEAM_MEMBERS;
    return members;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[team] fallback to hard-coded team members — Payload indisponible:',
        (err as Error).message,
      );
    }
    return FALLBACK_TEAM_MEMBERS;
  }
}

/**
 * Membre unique par `memberId` (slug stable). Retombe sur le membre hard-codé
 * correspondant si Payload est indisponible ou que le membre n'est pas
 * (encore) publié en base.
 */
export async function getTeamMemberById(
  id: string,
): Promise<TeamMember | null> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'teamMembers',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { memberId: { equals: id } },
        ],
      },
      limit: 1,
      depth: 1,
    });
    const member = docs[0]
      ? toTeamMember(docs[0] as RawPayloadTeamMember)
      : null;
    if (member) return member;
  } catch {
    // fallthrough vers le fallback
  }
  return FALLBACK_TEAM_MEMBERS.find((m) => m.id === id) ?? null;
}

/**
 * Publications signature, triées par `order`. Retombe sur les publications
 * hard-codées si Payload est indisponible ou que la collection est vide.
 */
export async function getSignaturePublications(): Promise<
  readonly TeamPublication[]
> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'teamPublications',
      where: { _status: { equals: 'published' } },
      sort: 'order',
      limit: 50,
      depth: 0,
    });
    const publications = docs
      .map((d) => toTeamPublication(d as RawPayloadTeamPublication))
      .filter((p): p is TeamPublication => p !== null);
    if (publications.length === 0) return SIGNATURE_PUBLICATIONS;
    return publications;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[team] fallback to hard-coded publications — Payload indisponible:',
        (err as Error).message,
      );
    }
    return SIGNATURE_PUBLICATIONS;
  }
}

interface RawPayloadValueRow {
  value?: unknown;
}

interface RawPayloadMedia {
  url?: string | null;
}

export interface RawPayloadTeamMember {
  id?: string | number;
  memberId?: unknown;
  name?: unknown;
  jobTitle?: unknown;
  shortBio?: unknown;
  bio?: RawPayloadValueRow[];
  image?: RawPayloadMedia | string | number | null;
  quote?: unknown;
  focusAreas?: RawPayloadValueRow[];
  sameAs?: RawPayloadValueRow[];
}

export interface RawPayloadTeamPublication {
  id?: string | number;
  pubType?: unknown;
  title?: unknown;
  year?: unknown;
  description?: unknown;
  href?: unknown;
}

/**
 * Rend une URL média relative à l'origine.
 *
 * Payload préfixe les URLs d'upload par `serverURL` (ex.
 * `http://localhost:3000/api/media/file/x.png`). En relativisant
 * (`/api/media/file/x.png`), `next/image` l'accepte sans qu'on ait à
 * whitelister chaque domaine. Mirror de `lib/articles-server.ts`.
 */
function toRelativeMediaUrl(url: string): string {
  try {
    return /^https?:\/\//i.test(url) ? new URL(url).pathname : url;
  } catch {
    return url;
  }
}

/** Array Payload `{ value }[]` → liste de chaînes non vides. */
function toStringList(raw: RawPayloadValueRow[] | undefined): string[] {
  return (raw ?? [])
    .map((r) => (typeof r.value === 'string' ? r.value : null))
    .filter((r): r is string => r !== null && r.trim().length > 0);
}

/**
 * Résout le chemin d'image affiché : URL média CMS relativisée si une image
 * est rattachée, sinon `imagePath` du fallback (placeholder côté page).
 */
function resolveImagePath(
  image: RawPayloadTeamMember['image'],
  fallbackPath: string,
): string {
  if (image && typeof image === 'object' && 'url' in image) {
    const { url } = image;
    if (typeof url === 'string' && url.length > 0) {
      return toRelativeMediaUrl(url);
    }
  }
  return fallbackPath;
}

function isPublicationType(value: unknown): value is TeamPublication['type'] {
  return (
    value === 'Livre' ||
    value === 'Livre blanc' ||
    value === 'Conférence' ||
    value === 'Article pair-évalué'
  );
}

/**
 * Mappe un document Payload brut vers le type domaine `TeamMember`.
 * Exporté pour les tests unitaires. Retourne `null` si les champs
 * obligatoires sont absents/invalides.
 */
export function toTeamMember(raw: RawPayloadTeamMember): TeamMember | null {
  if (
    typeof raw.memberId !== 'string' ||
    typeof raw.name !== 'string' ||
    typeof raw.jobTitle !== 'string' ||
    typeof raw.shortBio !== 'string' ||
    typeof raw.quote !== 'string'
  ) {
    return null;
  }
  // Le fallback porte l'`imagePath` (placeholder) du même membre s'il existe.
  const fallbackPath =
    FALLBACK_TEAM_MEMBERS.find((m) => m.id === raw.memberId)?.imagePath ?? '';
  return {
    id: raw.memberId,
    name: raw.name,
    jobTitle: raw.jobTitle,
    shortBio: raw.shortBio,
    bio: toStringList(raw.bio),
    imagePath: resolveImagePath(raw.image, fallbackPath),
    quote: raw.quote,
    focusAreas: toStringList(raw.focusAreas),
    sameAs: toStringList(raw.sameAs),
  };
}

/**
 * Mappe un document Payload brut vers le type domaine `TeamPublication`.
 * Exporté pour les tests unitaires. Retourne `null` si invalide.
 */
export function toTeamPublication(
  raw: RawPayloadTeamPublication,
): TeamPublication | null {
  if (
    !isPublicationType(raw.pubType) ||
    typeof raw.title !== 'string' ||
    typeof raw.year !== 'number' ||
    typeof raw.description !== 'string' ||
    typeof raw.href !== 'string'
  ) {
    return null;
  }
  return {
    type: raw.pubType,
    title: raw.title,
    year: raw.year,
    description: raw.description,
    href: raw.href,
  };
}
