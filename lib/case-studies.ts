/**
 * Cas clients du carrousel homepage §6.5 — types + fallback client-safe.
 *
 * Source de vérité : la collection Payload `caseStudies`. Quand la DB
 * est indisponible (build statique, dev sans docker, premier déploiement)
 * ou que la collection est vide, on retombe sur les 4 cas fondateurs
 * hard-codés ci-dessous.
 *
 * Ce fichier est volontairement **client-safe** : aucun import Payload
 * ou Node-only ici. Le fetch dynamique vit dans `lib/case-studies-server.ts`
 * pour ne pas être inclus dans les bundles côté client par webpack.
 *
 * Les images (capture produit, mockup réel, photo terrain) sont gérées
 * via le champ `image` de la collection Payload → upload sur MinIO via
 * `s3Storage` plugin. Si aucune image n'est fournie, le carrousel
 * retombe sur le mockup SVG par défaut associé au `productSlug`.
 */

export type ProductSlug =
  | 'nexusrh'
  | 'nexuserp'
  | 'sygescom'
  | 'agrosense'
  | 'qualitos'
  | 'fraud-shield'
  | 'smart-city';

export interface CaseStudyResult {
  value: string;
  label: string;
}

export interface CaseStudy {
  /** Identifiant stable (slug ou ID Payload). */
  id: string;
  sector: string;
  client: string;
  headline: string;
  punchline: string;
  body: string;
  results: readonly CaseStudyResult[];
  productSlug: ProductSlug;
  /** URL absolue ou relative vers l'image (MinIO via Payload). Null si
   *  le carrousel doit retomber sur le mockup SVG par défaut. */
  imageUrl: string | null;
  /** Texte alternatif accessibilité. */
  imageAlt: string | null;
  /** Lien `/solutions/<productSlug>` calculé. */
  href: string;
}

/**
 * Fallback hard-codé — utilisé tant que la collection Payload n'a pas
 * été peuplée par l'admin. 4 cas représentatifs de l'écosystème.
 */
export const FALLBACK_CASE_STUDIES: readonly CaseStudy[] = [
  {
    id: 'sygescom-stations',
    sector: 'Distribution hydrocarbures',
    client: 'Réseau de stations CI',
    headline: 'Pertes carburant divisées par 8.',
    punchline: 'Vos volumes. Sous contrôle, en temps réel.',
    body: 'Centralisation des flux station par station, détection IA d’écarts de stock, dashboard exécutif drill-down par cuve. Les écarts ne se cachent plus derrière les rapports J+1.',
    results: [
      { value: '−12 %', label: 'pertes carburant 3 mois' },
      { value: '< 3 mois', label: 'ROI déploiement' },
      { value: '24/7', label: 'supervision temps réel' },
    ],
    productSlug: 'sygescom',
    imageUrl: null,
    imageAlt: null,
    href: '/solutions/sygescom',
  },
  {
    id: 'nexusrh-paie',
    sector: 'PME tertiaire',
    client: 'Groupe RH ivoirien',
    headline: 'Paie CNPS sans surprise d’audit.',
    punchline: 'Cotisations, ITS, FDFP : natifs.',
    body: 'Modules paie multi-statuts (CDI, CDD, journaliers), diffusion Mobile Money, bordereau CNPS prêt à téléverser. L’inspecteur du travail repart en 20 minutes.',
    results: [
      { value: '+247', label: 'agents payés en MoMo' },
      { value: '0', label: 'pénalité ITS depuis 24 mois' },
      { value: '< 1h', label: 'audit annuel' },
    ],
    productSlug: 'nexusrh',
    imageUrl: null,
    imageAlt: null,
    href: '/solutions/nexusrh',
  },
  {
    id: 'agrosense-cacao',
    sector: 'Coopérative cacao',
    client: 'Daloa · 47 parcelles',
    headline: 'Maladie isolée 14 jours avant l’œil humain.',
    punchline: 'Le cacao se voit. La météo se prévoit.',
    body: 'Capteurs IoT sol + imagerie satellite Sentinel-2 + modèles CHIRPS/ERA5. L’alerte parcelle arrive avant la pourriture brune, pas après.',
    results: [
      { value: '47', label: 'parcelles instrumentées' },
      { value: 'J+14', label: 'horizon de prédiction' },
      { value: '86 %', label: 'confiance modèles' },
    ],
    productSlug: 'agrosense',
    imageUrl: null,
    imageAlt: null,
    href: '/solutions/agrosense',
  },
  {
    id: 'fraud-shield-bank',
    sector: 'Banque · Assurance',
    client: 'Établissement UEMOA',
    headline: 'Fraude documentaire rendue visible.',
    punchline: 'La fraude se cache. L’IA la rend visible.',
    body: 'Détection multi-modale (vision pixel, cohérence texte, métadonnées EXIF). Score d’authenticité expliqué avec overlay visuel — pas de boîte noire pour l’auditeur.',
    results: [
      { value: '× 3', label: 'cas détectés / contrôleur' },
      { value: '< 2 s', label: 'temps d’analyse / document' },
      { value: '99 %', label: 'signature dupliquée — confiance' },
    ],
    productSlug: 'fraud-shield',
    imageUrl: null,
    imageAlt: null,
    href: '/solutions/fraud-shield',
  },
] as const;
