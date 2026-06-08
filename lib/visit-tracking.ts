import 'server-only';
import { createHash } from 'node:crypto';

/**
 * Helpers de comptage de visites (collection `visits`). Isolés ici pour
 * être testables indépendamment du route handler. Pas de PII : le hash
 * visiteur intègre le jour et n'inclut jamais l'IP en clair persistée.
 */

/** Jour (AAAA-MM-JJ) + heure (0–23) en UTC à partir d'une date. */
export function visitDayHour(date: Date): { day: string; hour: number } {
  return {
    day: date.toISOString().slice(0, 10),
    hour: date.getUTCHours(),
  };
}

/**
 * Empreinte anonyme et NON réversible d'un visiteur pour un jour donné.
 * Le `day` dans le condensat assure une rotation quotidienne (un même
 * visiteur produit un hash différent chaque jour → non corrélable).
 */
export function computeVisitorHash(
  secret: string,
  day: string,
  ip: string,
  userAgent: string,
): string {
  return createHash('sha256')
    .update(`${secret}|${day}|${ip}|${userAgent}`)
    .digest('hex');
}

/**
 * Normalise un code pays ISO 3166-1 alpha-2 venu d'un en-tête proxy
 * (Cloudflare `CF-IPCountry`). Renvoie « XX » si absent/invalide. CF
 * renvoie « XX » (inconnu) ou « T1 » (Tor) que l'on neutralise en « XX ».
 */
export function normalizeCountry(raw: string | null | undefined): string {
  if (typeof raw !== 'string') return 'XX';
  const code = raw.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code) && code !== 'T1') return code;
  return 'XX';
}
