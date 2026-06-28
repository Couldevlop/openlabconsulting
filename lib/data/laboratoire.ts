/**
 * Données laboratoire R&D OpenLab — alimentent /laboratoire, /axes,
 * /publications, /partenariats (CLAUDE.md §5).
 */

export interface RdAxe {
  slug: string;
  title: string;
  pitch: string;
  produitsLies: readonly string[];
  exemples: readonly string[];
}

export const RD_AXES: readonly RdAxe[] = [
  {
    slug: 'paie-conformite-ouest-africaine',
    title: 'Paie & conformité ouest-africaine',
    pitch:
      'Cotisations CNPS, ITS, FDFP, diffusion Mobile Money, modélisés comme un domaine métier de premier niveau et pas un module en bout de chaîne.',
    produitsLies: ['NexusRH CI', 'NexusERP'],
    exemples: [
      'Bareme ITS 2024 progressif testé sur 1 200 cas d’employés réels',
      'Diffusion Orange/MTN/Moov Money avec réconciliation comptable',
      'Plug-and-play sur portail e-CNPS sans saisie manuelle',
    ],
  },
  {
    slug: 'detection-fraude-multimodale',
    title: 'Détection de fraude multi-modale',
    pitch:
      'Vision (manipulations pixel), texte (cohérence montants/dates) et métadonnées EXIF combinés en un score expliqué.',
    produitsLies: ['Fraud Shield'],
    exemples: [
      'Score 0-100 + overlay visuel des zones suspectes',
      'Modèles ré-entraînés client par client (multi-tenant strict)',
      'API REST drop-in dans LDM/GED existants',
    ],
  },
  {
    slug: 'agro-precision-cacao-anacarde',
    title: 'Agriculture de précision tropicale',
    pitch:
      'Croisement capteurs IoT terrain + imagerie satellite Sentinel-2 + modèles climatiques CHIRPS/ERA5 pour des recommandations parcelle par parcelle.',
    produitsLies: ['AgroSense CI'],
    exemples: [
      'Prédiction pourriture brune cacao 14 jours avant apparition',
      'Conformité EUDR (déforestation) intégrée nativement',
      'Pipeline LoRaWAN longue portée pour les zones sans 4G',
    ],
  },
  {
    slug: 'temps-reel-distribution-hydrocarbures',
    title: 'Temps réel & supervision distribution',
    pitch:
      "Ingestion Kafka des jauges, pompes et terminaux de paiement ; détection IA d'anomalies de stock avant qu'elles ne deviennent des mancos.",
    produitsLies: ['SYGESCOM v2.0'],
    exemples: [
      'TimescaleDB pour séries temporelles haute fréquence',
      'Modèles isolation forest pour anomaly detection non supervisée',
      'Drill-down groupe → région → station → cuve → événement',
    ],
  },
  {
    slug: 'qms-multi-norme-iso',
    title: 'QMS multi-norme ISO assisté IA',
    pitch:
      'Plate-forme qualité supportant ISO 9001/14001/45001/22000 simultanément, assistance Ishikawa et 5 pourquoi par Claude.',
    produitsLies: ['QualitOS'],
    exemples: [
      'Audit mobile offline-first PWA Angular 18',
      'CAPA bout en bout avec ré-évaluation efficacité à T+3 mois',
      'Référentiel unifié pour entreprises multi-certifiées',
    ],
  },
  {
    slug: 'smart-city-anonymisation',
    title: 'Smart City respectueuse de la vie privée',
    pitch:
      "Fusion CCTV + mobilité + signalements citoyens sans identifier personne, anonymisation différentielle dès l'ingestion.",
    produitsLies: ['Smart City'],
    exemples: [
      'Carte chaleur urbaine prédictive J+7',
      'Anonymisation visages / plaques en edge (avant data center)',
      'Comité éthique trimestriel inclus au programme',
    ],
  },
];

export interface Publication {
  type: 'livre' | 'livre-blanc' | 'article-pair' | 'conference';
  title: string;
  /** Auteurs cités. */
  authors: readonly string[];
  /** Année de parution. */
  year: number;
  /** Lien externe ou interne (PDF, page produit, etc.). */
  href: string;
  /** Pitch en 2-3 phrases (carte liste). */
  summary: string;
  /**
   * Slug optionnel : si présent, la publication a une page de détail
   * `/laboratoire/publications/<slug>` (résumé long + schema Article).
   * Absent (livre, conférence externe) → la carte pointe sur `href`.
   */
  slug?: string;
  /**
   * Résumé long (page de détail). Honnêteté : ce sont de vraies
   * publications/analyses OpenLab (livre blanc, analyse sectorielle) — pas
   * des articles académiques à comité de lecture ; pas de DOI inventé.
   */
  abstract?: string;
}

export const PUBLICATIONS: readonly Publication[] = [
  {
    type: 'livre',
    title:
      'Intégration de l’Intelligence Artificielle dans le développement logiciel',
    authors: ['Debora Ahouma'],
    year: 2026,
    href: '/livre',
    summary:
      '11 chapitres, du ML supervisé aux agents autonomes. Capstone AgroSense CI terrain. À destination des étudiants ingénieurs, data scientists, dirigeants et enseignants.',
  },
  {
    type: 'livre-blanc',
    title: 'L’IA souveraine en Côte d’Ivoire : Feuille de route 2026',
    authors: ['Équipe OpenLab'],
    year: 2026,
    href: '/livres-blancs/ia-souveraine-ci-2026',
    summary:
      'Comment les dirigeants ivoiriens peuvent déployer une IA hébergée en UE conforme RGPD + loi 2013-450, sans dépendre des hyperscalers.',
    slug: 'ia-souveraine-feuille-de-route-2026',
    abstract:
      'Feuille de route pour une IA souveraine en Côte d’Ivoire à l’horizon de la Stratégie Nationale de l’Intelligence Artificielle (SNIA 2030). L’analyse identifie sept verrous structurels, énergie, puissance de calcul, datacenters, données, compétences, cadre réglementaire et fonctionnement en silos, et propose une trajectoire progressive et réaliste : digitaliser via le RAG, spécialiser des modèles open source sur des données nationales, puis bâtir une IA pleinement souveraine. Hébergement en Union européenne conforme RGPD et loi ivoirienne 2013-450, sans dépendance aux hyperscalers.',
  },
  {
    // Lien repointé vers l'article réel (la landing /livres-blancs/
    // conformite-paie-ci-2026 n'existe pas → 404). Même sujet, contenu publié.
    type: 'livre-blanc',
    title: 'Conformité CNPS, ITS, FDFP : guide SIRH 2024-2026',
    authors: ['Équipe NexusRH'],
    year: 2025,
    href: '/insights/cnps-its-fdfp-conformite-sirh-ivoirien',
    summary:
      'Tous les barèmes 2024 commentés, les pièges classiques d’un audit DGI, les obligations Mobile Money en paie.',
    slug: 'conformite-cnps-its-fdfp-sirh-2026',
    abstract:
      'Guide praticien des obligations de paie ivoiriennes (CNPS, ITS, FDFP) attendues d’un SIRH moderne. Barèmes 2024 commentés, pièges classiques d’un audit DGI, obligations de diffusion par Mobile Money, et exigences d’auditabilité (fiches de paie horodatées et immuables). Document issu des déploiements NexusRH en production.',
  },
  {
    type: 'conference',
    title: 'Africa Tech Week 2025 : IA pour l’agro-industrie africaine',
    authors: ['Debora Ahouma'],
    year: 2025,
    href: 'https://africatechfestival.com/',
    summary:
      'Intervention plénière sur AgroSense CI et le rôle des coopératives dans la souveraineté data agricole.',
  },
];

export interface Partenariat {
  slug: string;
  title: string;
  /** Nature : universitaire, public, privé, ONG. */
  type: 'universitaire' | 'public' | 'prive' | 'ong';
  pitch: string;
}

export const PARTENARIATS: readonly Partenariat[] = [
  {
    slug: 'universite-felix-houphouet-boigny',
    title: 'Université Félix Houphouët-Boigny (Cocody)',
    type: 'universitaire',
    pitch:
      "Encadrement d'étudiants en master Big Data & IA, accès aux datasets AgroSense pour leurs mémoires, conférences semestrielles.",
  },
  {
    slug: 'esatic',
    title: 'ESATIC',
    type: 'universitaire',
    pitch:
      'Partenariat sur les modules cybersécurité et IA appliquée, recrutement en alternance, accès labo Fraud Shield.',
  },
  {
    slug: 'sodexam',
    title: 'SODEXAM (Météorologie Côte d’Ivoire)',
    type: 'public',
    pitch:
      'Accès officiel aux séries climatiques nationales pour les modèles AgroSense CI. Co-publication scientifique en cours.',
  },
  {
    slug: 'conseil-cafe-cacao',
    title: 'Conseil du Café-Cacao',
    type: 'public',
    pitch:
      'Échanges sur la conformité EUDR (déforestation) et la traçabilité parcelle pour les coopératives cacao certifiées.',
  },
  {
    slug: 'jeune-afrique-business',
    title: 'Jeune Afrique Business+',
    type: 'prive',
    pitch:
      "Diffusion éditoriale des analyses OpenLab sur l'IA en Afrique francophone : 4 tribunes / an programmées.",
  },
];

export function getAxeBySlug(slug: string): RdAxe | undefined {
  return RD_AXES.find((a) => a.slug === slug);
}
