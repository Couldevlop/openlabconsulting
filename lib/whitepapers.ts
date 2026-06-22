/**
 * Ouverture du téléchargement des livres blancs / livres.
 *
 * Certains ouvrages sont **présents sur le site avant l'ouverture du
 * téléchargement** : un compteur décompte le temps restant, puis le
 * formulaire de capture (RGPD) apparaît. La date fait autorité côté
 * serveur (l'API refuse avant l'heure) ET côté client (compteur).
 *
 * Client-safe (aucun import runtime serveur).
 */

/** slug → titre lisible (emails, notifications…). Client-safe. */
export const WHITEPAPER_TITLES: Readonly<Record<string, string>> = {
  'ia-souveraine-ci-2026': 'L’IA souveraine en Côte d’Ivoire',
  'donnez-la-parole-a-vos-donnees': 'Donnez la parole à vos données',
};

/** Titre lisible d'un livre blanc, avec repli neutre si slug inconnu. */
export function whitepaperTitle(slug: string): string {
  return WHITEPAPER_TITLES[slug] ?? 'Livre blanc OpenLab';
}

/** slug → date d'ouverture du téléchargement (ISO UTC). Absent = ouvert. */
export const WHITEPAPER_RELEASE: Readonly<Record<string, string>> = {
  // « Donnez la parole à vos données » : lundi 22 juin 2026, 12:00 Europe/Paris
  // (CEST, UTC+2) = 10:00 UTC.
  'donnez-la-parole-a-vos-donnees': '2026-06-22T10:00:00.000Z',
};

/** Date d'ouverture (ISO) pour un slug, ou null si aucune (téléchargement libre). */
export function downloadReleaseAt(slug: string): string | null {
  return WHITEPAPER_RELEASE[slug] ?? null;
}

/**
 * `true` si le téléchargement est ouvert à l'instant `nowMs` : soit aucune
 * date d'ouverture, soit l'heure est passée.
 */
export function isDownloadOpen(slug: string, nowMs: number): boolean {
  const at = WHITEPAPER_RELEASE[slug];
  if (!at) return true;
  return nowMs >= Date.parse(at);
}
