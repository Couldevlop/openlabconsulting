/**
 * Constantes SEO partagées — utilisées par sitemap, robots,
 * llms.txt, JSON-LD, OG image. Source unique pour éviter les
 * dérives d'URL ou de description.
 *
 * Voir CLAUDE.md §12 (stratégie SEO) et memory
 * project_openlabconsulting_objective_top_3.
 */

export const SITE = {
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://openlabconsulting.com'
  ).replace(/\/$/, ''),
  name: 'OpenLab Consulting',
  legalName: 'OpenLab Consulting SARL',
  rccm: 'CI-ABJ-03-2022-B13-03239',
  description:
    "Cabinet ivoirien d'IA appliquée, R&D produit et publication de référence pour l'Afrique francophone.",
  shortPitch: 'L’IA, au service des réalités africaines.',
  locale: 'fr_CI',
  language: 'fr',
  address: {
    streetAddress: 'Riviera Faya Lauriers 8',
    addressLocality: 'Cocody',
    addressRegion: 'Abidjan',
    addressCountry: 'CI',
  },
  contact: {
    primaryPhone: '+225 07 09 33 42 38',
    secondaryPhone: '+33 06 19 24 53 29',
    email: 'waopron@openlabconsulting.com',
    salesEmail: 'waopron@openlabconsulting.com',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/openlab-consulting',
  },
} as const;

/** Construit une URL absolue à partir d'un chemin relatif. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}

/**
 * Locales cibles pour hreflang — audit P2 §7 item #1.
 *
 * OpenLab vise simultanément le marché ivoirien (fr-CI), la diaspora
 * + clients UEMOA/France (fr-FR), et `x-default` comme fallback Google
 * pour tout autre fr-* ou requête sans préférence régionale.
 *
 * Le site n'a qu'une seule version linguistique — on déclare donc la
 * MÊME URL pour les 3 codes, ce qui signale à Google que la page
 * dessert ces 3 audiences. Pattern recommandé pour mono-locale
 * multi-marchés (cf. Google Search Central, hreflang FAQ).
 */
export const HREFLANG_LOCALES = ['fr-CI', 'fr-FR', 'x-default'] as const;
export type HreflangLocale = (typeof HREFLANG_LOCALES)[number];

/**
 * Construit la map `alternates.languages` pour Next 15 metadata.
 * Utilisé par `app/layout.tsx` au niveau racine et par chaque route
 * qui override `alternates.canonical`.
 */
export function hreflangMap(path: string): Record<HreflangLocale, string> {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return {
    'fr-CI': clean,
    'fr-FR': clean,
    'x-default': clean,
  };
}

/**
 * Bloc `alternates` complet pour le metadata d'une page : `canonical`
 * + `languages` (hreflang fr-CI / fr-FR / x-default).
 *
 * À utiliser à la place de `alternates: { canonical: '...' }` : sinon
 * une page enfant qui ne déclare que `canonical` **écrase** le bloc
 * `alternates` (donc le hreflang) hérité de `app/layout.tsx` — Next 15
 * remplace `alternates` champ par champ au niveau de l'objet entier.
 */
export function alternatesFor(path: string): {
  canonical: string;
  languages: Record<HreflangLocale, string>;
} {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return { canonical: clean, languages: hreflangMap(clean) };
}
