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
    email: 'infos@openlabconsulting.com',
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
