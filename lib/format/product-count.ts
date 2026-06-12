/**
 * Compteur de produits — formatage + interpolation de tokens.
 *
 * Le nombre de produits propriétaires (« huit logiciels propriétaires… »)
 * ne doit plus être codé en dur : il est dérivé du nombre de produits
 * publiés (cf. `lib/cms/product-count-server.ts`), avec un override admin
 * possible (`SiteSettings`). Ce module est **client-safe** (aucun import
 * Node/`server-only`) pour être consommé aussi bien par des Server que des
 * Client Components.
 *
 * Convention de tokens dans les textes éditables (admin) et les fallbacks :
 *   - `{products}`     → nombre en chiffres (ex. « 8 »)
 *   - `{productsWord}` → nombre en lettres minuscule (ex. « huit »)
 *   - `{Products}` / `{ProductsWord}` → variantes capitalisées (début de
 *     phrase : « Huit logiciels propriétaires. »)
 */

const FRENCH_UNITS = [
  'zéro',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
  'vingt',
] as const;

/**
 * Écrit un entier en toutes lettres (français), de 0 à 20. Au-delà, ou pour
 * une valeur invalide, retombe sur la représentation chiffrée — jamais
 * d'erreur, le rendu reste sûr.
 */
export function spellFrenchCount(n: number): string {
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    return String(n);
  }
  return FRENCH_UNITS[n] ?? String(n);
}

/** Capitalise la première lettre (gère les digraphes accentués simples). */
function capitalize(word: string): string {
  return word.length === 0 ? word : word[0]!.toUpperCase() + word.slice(1);
}

export interface ProductCount {
  /** Nombre de produits (chiffres). */
  count: number;
  /** Nombre en lettres minuscule (ex. « huit »). */
  word: string;
}

/**
 * Remplace les tokens de compteur dans une chaîne. Idempotent et sûr sur du
 * texte sans token (retourne la chaîne inchangée).
 */
export function interpolateCounts(
  text: string,
  { count, word }: ProductCount,
): string {
  if (text.length === 0 || text.indexOf('{') === -1) return text;
  return text
    .replaceAll('{products}', String(count))
    .replaceAll('{productsWord}', word)
    .replaceAll('{Products}', String(count))
    .replaceAll('{ProductsWord}', capitalize(word));
}

/** Construit un `ProductCount` à partir d'un nombre (mot dérivé). */
export function toProductCount(count: number): ProductCount {
  return { count, word: spellFrenchCount(count) };
}
