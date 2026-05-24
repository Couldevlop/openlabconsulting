import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

/**
 * GET /api/preview?slug=<slug>&collection=articles
 *
 * Active le « draft mode » Next.js pour prévisualiser un contenu non
 * publié (brouillon/en revue), puis redirige vers la page front.
 * Branché sur le bouton « Aperçu » de l'admin Payload (collection
 * `admin.preview`).
 *
 * Sécurité (OWASP A01 — Broken Access Control) :
 *   - le draftMode n'est activé QUE si la requête provient d'un
 *     utilisateur Payload authentifié (cookie de session validé via
 *     `payload.auth`). Un visiteur anonyme reçoit 401 et ne peut donc
 *     jamais voir un brouillon.
 *   - le cookie draftMode est httpOnly + sameSite par Next.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Construit le chemin front à prévisualiser selon la collection. */
const PREVIEW_PATHS: Record<string, (slug: string) => string> = {
  articles: (slug) => `/insights/${slug}`,
};

async function getAuthenticatedUser(req: Request): Promise<unknown> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: req.headers });
    return user ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  const collection = url.searchParams.get('collection') ?? 'articles';
  const buildPath = PREVIEW_PATHS[collection];

  if (!slug || !buildPath) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  (await draftMode()).enable();
  redirect(buildPath(slug));
}
