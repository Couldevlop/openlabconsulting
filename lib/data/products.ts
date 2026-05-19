import type { ComponentType, SVGProps } from 'react';
import {
  BadgeCheck,
  Building2,
  Fuel,
  Radar,
  ScanSearch,
  Sprout,
  Users,
} from 'lucide-react';

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type ProductSlug =
  | 'nexusrh'
  | 'nexuserp'
  | 'sygescom'
  | 'agrosense'
  | 'qualitos'
  | 'fraud-shield'
  | 'smart-city';

export type ProductStatus = 'production' | 'pilot' | 'mvp' | 'dev';

export interface ProductFeature {
  Icon: LucideIcon;
  title: string;
  body: string;
}

export interface ProductProof {
  value: string;
  label: string;
  /** Source obligatoire — §4.10 : aucun chiffre rond non sourcé. */
  source: string;
}

export interface ProductExpertise {
  slug: string;
  title: string;
}

export interface Product {
  slug: ProductSlug;
  Icon: LucideIcon;
  /** Nom public, ex : "NexusRH CI" ou "OpenLab Fraud Shield". */
  name: string;
  /** Tagline §18 — homepage card + meta description courte. */
  tagline: string;
  /** Cible marché concrète (CLAUDE.md §1.3). */
  target: string;
  status: ProductStatus;
  statusLabel: string;
  /** Eyebrow + sous-titre Fraunces affichés en page détail. */
  eyebrow: string;
  /** Pitch hero page détail — 2-3 phrases. */
  intro: string;
  /** Storytelling « avant » / problème — 2-3 phrases. */
  problem: string;
  /** 4-6 fonctionnalités phares avec icône. */
  features: readonly ProductFeature[];
  /** Stack technique côté produit (3-6 lignes). */
  stack: readonly string[];
  /** Stats sourcées — optionnel, uniquement quand documenté §7.2. */
  proofs?: readonly ProductProof[];
  /** Expertises OpenLab pertinentes pour ce produit (cross-link). */
  expertisesLies: readonly ProductExpertise[];
}

/**
 * Source unique de vérité pour les 7 produits propriétaires (CLAUDE.md §1.3).
 * Consommée par :
 *   - `components/sections/Solutions.tsx` (homepage §6.6)
 *   - `app/solutions/page.tsx` (hub)
 *   - `app/solutions/[slug]/page.tsx` (pages détaillées)
 *
 * Le template §7.1 du CLAUDE.md prévoit 10 sections — pour P4 on en livre
 * 7 (hero, stats, problème, features, stack, expertises liées, CTA final).
 * Démo interactive et FAQ Schema.org sont deferées à des features dédiées.
 */
export const PRODUCTS: readonly Product[] = [
  {
    slug: 'nexusrh',
    Icon: Users,
    name: 'NexusRH CI',
    tagline: 'La paie ivoirienne sans friction. CNPS, ITS, FDFP, Mobile Money.',
    target: 'PME & grandes entreprises · Côte d’Ivoire',
    status: 'production',
    statusLabel: 'En production',
    eyebrow: 'SIRH IA · Côte d’Ivoire',
    intro:
      "NexusRH gère la paie ivoirienne nativement : cotisations CNPS, retenues ITS, FDFP, prime d'ancienneté, congés payés. Le module Mobile Money diffuse les salaires sans passer par la banque pour les agents non bancarisés.",
    problem:
      "Trois feuilles Excel, un fichier de virement, un compte CNPS qui n'ouvre que le mardi. À chaque embauche, un encodage triple. À chaque modification du barème ITS, un risque de pénalité.",
    features: [
      {
        Icon: Users,
        title: 'Paie multi-statuts',
        body: 'CDI, CDD, journaliers, stagiaires. Chaque statut a ses règles de cotisation et NexusRH les applique sans intervention manuelle.',
      },
      {
        Icon: BadgeCheck,
        title: 'Conformité CNPS, ITS, FDFP native',
        body: 'Mise à jour automatique des barèmes à chaque changement réglementaire. Bordereau CNPS prêt à téléverser sur le portail.',
      },
      {
        Icon: Building2,
        title: 'Mobile Money intégré',
        body: 'Diffusion salariale Orange Money, MTN Mobile Money, Moov Money — réconciliation automatique.',
      },
      {
        Icon: ScanSearch,
        title: 'Audit annuel sans surprise',
        body: 'Toutes les fiches de paie horodatées, immuables, exportables en quelques secondes. L’inspecteur du travail repart en 20 minutes.',
      },
    ],
    stack: [
      'Spring Boot 3 · Java 21',
      'PostgreSQL 17 · Drizzle',
      'Worker FastAPI pour les calculs paie complexes',
      'K3s Hetzner · Helm chart proprietaire',
      'Authentification Keycloak SSO',
    ],
    expertisesLies: [
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
  {
    slug: 'nexuserp',
    Icon: Building2,
    name: 'NexusERP',
    tagline:
      'ERP SYSCOHADA nouvelle génération. Multi-devises, multi-pays, natif.',
    target: 'PME multi-secteurs · France · UEMOA',
    status: 'production',
    statusLabel: 'En production',
    eyebrow: 'ERP SYSCOHADA · UEMOA · France',
    intro:
      "NexusERP couvre les besoins d'une PME multi-pays sans rustines : comptabilité SYSCOHADA conforme, ventes, achats, stock, RH, projets. Multi-devises natif (FCFA, EUR, USD), réconciliation automatique des écarts de change.",
    problem:
      "Un module compta français qui ne reconnaît pas le plan SYSCOHADA. Un ERP nigérian qui ne gère pas le franc CFA. Un Excel qui compense entre les deux. Et l'expert-comptable qui découvre les écarts en mars.",
    features: [
      {
        Icon: BadgeCheck,
        title: 'Comptabilité SYSCOHADA + PCG',
        body: 'Plans comptables ivoirien et français en parallèle, traduction automatique des écritures, états financiers conformes aux deux référentiels.',
      },
      {
        Icon: Building2,
        title: 'Ventes, achats, stock, projets',
        body: 'Pipeline commercial, devis-facture, GRC clients, gestion projet par affaire (heures, marge, facturation à l’avancement).',
      },
      {
        Icon: ScanSearch,
        title: 'Dashboard exécutif multi-devises',
        body: 'CA consolidé temps réel en FCFA, EUR, USD. Drill-down par BU, pays, période. Alertes sur dérive de marge.',
      },
      {
        Icon: Users,
        title: 'Module RH intégré',
        body: 'Embauches, contrats, congés, fiches de paie SYSCOHADA. Bascule simple vers NexusRH si conformité CI requise.',
      },
    ],
    stack: [
      'Spring Boot 3 · Java 21 (modules métier)',
      'Angular 18 · TypeScript strict (back-office)',
      'PostgreSQL 17 · multi-tenant schema-per-org',
      'Module reporting FastAPI Python (états SYSCOHADA, Excel/PDF)',
      'K3s Hetzner + Helm chart',
    ],
    expertisesLies: [
      { slug: 'conseil-strategie', title: 'Conseil & stratégie IA' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
  {
    slug: 'sygescom',
    Icon: Fuel,
    name: 'SYGESCOM v2.0',
    tagline: 'Vos stations. Vos volumes. Sous contrôle, en temps réel.',
    target: 'Réseaux d’hydrocarbures · Afrique de l’Ouest',
    status: 'production',
    statusLabel: 'En production',
    eyebrow: 'Gestion stations hydrocarbures · Afrique de l’Ouest',
    intro:
      'SYGESCOM centralise les flux de chaque station-service en temps réel : volumes livrés, volumes vendus, écarts de stock, mouvements de caisse. Le siège pilote tout un réseau depuis un seul tableau de bord.',
    problem:
      'Une station déclare un manco, une autre une livraison fantôme. Le contrôleur passe la semaine à reconstruire le mouvement réel. Pendant ce temps, la fraude s’installe.',
    features: [
      {
        Icon: Fuel,
        title: 'Ingestion temps réel multi-stations',
        body: 'Connecteurs jauges, pompes, terminaux paiement. Chaque flux est tagué station × cuve × type de carburant.',
      },
      {
        Icon: ScanSearch,
        title: 'Détection IA d’anomalies',
        body: 'Modèles d’apprentissage non supervisé qui repèrent les écarts de stock inhabituels avant qu’ils ne deviennent des mancos déclarés.',
      },
      {
        Icon: Radar,
        title: 'Dashboard exécutif drill-down',
        body: 'Vue groupe → région → station → cuve → événement. Alertes Slack/email sur seuils paramétrables.',
      },
      {
        Icon: BadgeCheck,
        title: 'Réconciliation comptable automatique',
        body: 'Ponts vers NexusERP ou SAP existant. Les écritures sont générées sans saisie manuelle.',
      },
    ],
    stack: [
      'Spring Boot 3 · Java 21',
      'PostgreSQL 17 + TimescaleDB pour séries temporelles',
      'Worker Python FastAPI · scikit-learn pour anomaly detection',
      'Apache Kafka pour ingestion temps réel',
      'K3s Hetzner · Grafana pour observabilité',
    ],
    proofs: [
      {
        value: '−12 %',
        label: 'pertes carburant',
        source: 'sur 3 mois d’exploitation, déploiement Côte d’Ivoire',
      },
      {
        value: '< 3 mois',
        label: 'retour sur investissement',
        source: 'CAPEX déploiement amorti par réduction pertes',
      },
      {
        value: '24/7',
        label: 'supervision multi-stations',
        source: 'pilote consolidé temps réel',
      },
    ],
    expertisesLies: [
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
    ],
  },
  {
    slug: 'agrosense',
    Icon: Sprout,
    name: 'AgroSense CI',
    tagline: 'Le cacao se voit, la météo se prévoit. La parcelle décide.',
    target: 'Coopératives & exploitants · cacao, anacarde, coton, hévéa',
    status: 'mvp',
    statusLabel: 'MVP avancé',
    eyebrow: 'IoT précision agricole · Côte d’Ivoire',
    intro:
      "AgroSense croise les capteurs au sol (humidité, température, pluviométrie), l'imagerie satellite et les modèles météo SODEXAM, ERA5, CHIRPS pour produire des recommandations parcelle par parcelle : quand traiter, quand récolter, quand irriguer.",
    problem:
      'Un producteur de cacao a 3 hectares, 2 GPS imprécis et un téléphone Android. Le service ag bicame agricole arrive trois semaines après la maladie. La coopérative ne sait pas où ses pertes apparaissent.',
    features: [
      {
        Icon: Sprout,
        title: 'Imagerie multi-source',
        body: 'Sentinel-2, capteurs propriétaires terrain, drones photogrammétriques. Une seule carte parcelle, plusieurs couches.',
      },
      {
        Icon: Radar,
        title: 'Prédiction maladies & rendements',
        body: 'Modèles entraînés sur séries climatiques CHIRPS + données terrain ivoirienne. Alertes 7-15 jours avant apparition.',
      },
      {
        Icon: Users,
        title: 'Interface coopérative',
        body: 'Vue agrégée par coopérative, drill-down par village, par adhérent, par parcelle. Reporting subventionneurs en un clic.',
      },
      {
        Icon: BadgeCheck,
        title: 'Traçabilité origine',
        body: 'Chaque livraison de fève est rattachable à sa parcelle GPS. Conformité EUDR (déforestation) intégrée.',
      },
    ],
    stack: [
      'PostgreSQL 17 + PostGIS pour le spatial',
      'Worker Python · GDAL · scikit-learn · xarray',
      'Frontend Next.js + MapLibre',
      'Sources data : SODEXAM, OpenMeteo, ERA5, CHIRPS, Sentinel-2',
      'K3s Hetzner · MinIO pour les rasters',
    ],
    expertisesLies: [
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
      { slug: 'conseil-strategie', title: 'Conseil & stratégie IA' },
    ],
  },
  {
    slug: 'qualitos',
    Icon: BadgeCheck,
    name: 'QualitOS',
    tagline:
      'PDCA, 5S, DMAIC, ISO. Une seule plateforme. Aucune méthode laissée de côté.',
    target: 'Industrie · santé · agro · services · IT · BTP',
    status: 'dev',
    statusLabel: 'En développement',
    eyebrow: 'QMS multi-méthodes',
    intro:
      "QualitOS supporte les principales méthodes qualité (PDCA, 5S, DMAIC, CAPA, audit ISO 9001/14001/45001) dans un référentiel unique. L'audit suit le terrain en mobilité, l'analyse d'écarts est assistée par IA (Ishikawa, 5 pourquoi, AMDEC).",
    problem:
      'Trois logiciels qualité : un pour les audits, un pour les CAPA, un pour les indicateurs. Aucun ne parle au suivant. Le responsable qualité passe sa journée à réconcilier des Excel.',
    features: [
      {
        Icon: BadgeCheck,
        title: 'Référentiel ISO unifié',
        body: 'ISO 9001, 14001, 45001, 22000 supportés en parallèle. Une non-conformité se rattache automatiquement aux exigences concernées.',
      },
      {
        Icon: ScanSearch,
        title: 'Ishikawa IA assistée',
        body: 'Claude propose une analyse de causes initiale sur la base de la description du non-conforme. L’opérateur valide ou recadre.',
      },
      {
        Icon: Users,
        title: 'Audit mobile offline-first',
        body: 'L’auditeur passe en mode hors-ligne sur site, ses constats remontent au siège dès reconnexion.',
      },
      {
        Icon: Building2,
        title: 'CAPA tracées de bout en bout',
        body: 'Actions correctives jalonnées, responsables nommés, échéances notifiées, efficacité ré-évaluée à T+3 mois.',
      },
    ],
    stack: [
      'Spring Boot 3 · Java 21 (référentiel multi-norme)',
      'Angular 18 · PWA pour mobile offline',
      'PostgreSQL 17',
      'Service IA Claude pour Ishikawa et 5 pourquoi',
      'K3s Hetzner',
    ],
    expertisesLies: [
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
  {
    slug: 'fraud-shield',
    Icon: ScanSearch,
    name: 'OpenLab Fraud Shield',
    tagline: 'La fraude se cache. L’IA la rend visible.',
    target: 'Banques · assurances · administration · douanes',
    status: 'production',
    statusLabel: 'En production',
    eyebrow: 'Détection fraude documentaire par IA',
    intro:
      "Fraud Shield analyse un document à l'image et au texte : pièces d'identité, factures, attestations bancaires, certificats de domiciliation. Il isole les manipulations invisibles à l'œil — copier-coller de cachet, retouche de montant, signature reproduite.",
    problem:
      "Le contrôleur regarde 200 dossiers par jour. Au 50ᵉ, l'œil se fatigue. À midi, il signe les yeux fermés. La fraude documentaire ne s'arrête pas, elle attend que le contrôleur cligne.",
    features: [
      {
        Icon: ScanSearch,
        title: 'Détection multi-modale',
        body: 'Vision (manipulations pixel, anti-aliasing incohérent) + texte (cohérence montants, dates, signataires) + métadonnées EXIF.',
      },
      {
        Icon: BadgeCheck,
        title: 'Score d’authenticité expliqué',
        body: 'Chaque document reçoit un score 0-100 + un overlay visuel pointant les zones suspectes. Pas de boîte noire pour l’auditeur.',
      },
      {
        Icon: Users,
        title: 'Workflow contrôleur intégré',
        body: 'API REST drop-in dans vos workflows existants (LDM, GED, dossier client). Pas de migration, pas de re-formation.',
      },
      {
        Icon: Building2,
        title: 'Apprentissage continu sur vos cas',
        body: 'Vos faux positifs et vrais positifs ré-entraînent vos modèles, isolés des autres clients (multi-tenant strict).',
      },
    ],
    stack: [
      'Modèles ONNX Runtime pour la vision',
      'OpenCV · Tesseract pour l’OCR',
      'Service Python FastAPI',
      'PostgreSQL 17 pour l’audit log immuable',
      'K3s Hetzner · GPU optionnel pour throughput',
    ],
    expertisesLies: [
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
    ],
  },
  {
    slug: 'smart-city',
    Icon: Radar,
    name: 'OpenLab Smart City',
    tagline: 'Anticiper la ville. Pas seulement la surveiller.',
    target: 'Collectivités · ministères · sécurité urbaine',
    status: 'pilot',
    statusLabel: 'En pilote',
    eyebrow: 'IA sécurité urbaine',
    intro:
      "Smart City fusionne caméras urbaines, données mobilité, données socio-économiques et signalements citoyens pour cartographier les risques avant qu'ils ne dégénèrent. Pas un outil de surveillance — un outil de planification.",
    problem:
      'Les caméras filment. La police arrive. Les statistiques arrivent un mois plus tard. La décision politique se prend sur un sentiment, pas sur une cartographie.',
    features: [
      {
        Icon: Radar,
        title: 'Carte de chaleur urbaine',
        body: 'Visualisation temps réel des concentrations d’incidents, croisée avec densité, mobilité, équipements publics manquants.',
      },
      {
        Icon: ScanSearch,
        title: 'Modèles de prédiction',
        body: 'Risques d’embouteillage, de pic d’incidents, d’événements sociaux à fort potentiel. Les services préventifs sont positionnés en amont.',
      },
      {
        Icon: Users,
        title: 'Portail citoyens',
        body: 'Signalements géolocalisés, suivi de résolution, transparence sur les actions municipales.',
      },
      {
        Icon: BadgeCheck,
        title: 'Anonymisation différentielle',
        body: 'Les visages, plaques, identifiants sont anonymisés avant ingestion. La conformité RGPD n’est pas une option.',
      },
    ],
    stack: [
      'PostgreSQL 17 + PostGIS + TimescaleDB',
      'Workers Python (vision + séries temporelles)',
      'Frontend Next.js + MapLibre',
      'K3s Hetzner · MinIO pour archivage vidéo',
      'Anonymisation amont via modèles vision dédiés',
    ],
    expertisesLies: [
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
] as const;

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
