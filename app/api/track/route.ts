import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { getRequestIp } from '@/lib/request-ip';
import {
  computeVisitorHash,
  normalizeCountry,
  visitDayHour,
} from '@/lib/visit-tracking';

/**
 * POST /api/track — enregistre une visite (collection `visits`).
 *
 * Appelé par un beacon client (`components/analytics/VisitTracker`) une
 * fois par chargement de page publique. Comptage « visiteur unique /
 * jour » : la ligne n'est créée que la première fois qu'un visiteur est
 * vu dans la journée (dédup par index unique day+visitorHash).
 *
 * Garanties :
 *   - RGPD §10.6 : aucune PII stockée (hash anonyme à rotation
 *     quotidienne, pays seulement, pas d'IP, pas de cookie).
 *   - Fail-soft total : toute erreur (Redis, DB, parsing) renvoie 204 —
 *     l'analytics ne doit JAMAIS dégrader l'expérience visiteur.
 *   - Rate limit fail-open (anti-flood léger, ne bloque pas le site).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_CONTENT = new NextResponse(null, { status: 204 });

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const ip = getRequestIp(req);

    const rl = await rateLimit(`track:${ip}`, RATE_LIMITS.track);
    if (!rl.ok) return NO_CONTENT;

    const secret = process.env.PAYLOAD_SECRET ?? 'dev-secret';
    const userAgent = req.headers.get('user-agent') ?? 'unknown';
    const country = normalizeCountry(req.headers.get('cf-ipcountry'));
    const { day, hour } = visitDayHour(new Date());
    const visitorHash = computeVisitorHash(secret, day, ip, userAgent);

    const payload = await getPayload({ config });

    // Dédup « 1 visiteur / jour » : ne crée qu'à la première vue du jour.
    const existing = await payload.find({
      collection: 'visits',
      where: {
        and: [
          { day: { equals: day } },
          { visitorHash: { equals: visitorHash } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (existing.totalDocs === 0) {
      try {
        await payload.create({
          collection: 'visits',
          data: { day, hour, country, visitorHash },
          overrideAccess: true,
        });
      } catch {
        // Course possible entre deux onglets → l'index unique rejette le
        // doublon. C'est exactement le comportement voulu : on ignore.
      }
    }

    return NO_CONTENT;
  } catch {
    // Fail-soft : l'analytics ne casse jamais une navigation.
    return NO_CONTENT;
  }
}
