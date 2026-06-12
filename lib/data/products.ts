/**
 * Slugs des produits *fondateurs* (fallback hard-codé, démos, mockups).
 * Le slug d'un produit n'est PAS limité à cette union : la collection
 * Payload accepte tout slug kebab-case (`PRODUCT_SLUG_PATTERN`) pour
 * qu'un nouveau produit soit créable depuis l'admin sans déploiement.
 */
export type ProductSlug =
  | 'nexusrh'
  | 'nexuserp'
  | 'sygescom'
  | 'agrosense'
  | 'qualitos'
  | 'fraud-shield'
  | 'smart-city'
  | 'sentinelbtp';

/**
 * Format de slug produit : minuscules/chiffres séparés par des tirets
 * (ex. `sentinelbtp`, `fraud-shield`). Partagé entre la validation du
 * champ Payload (`collections/Products.ts`) et l'assainissement des
 * documents CMS (`lib/products-server.ts`). Client-safe.
 */
export const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ProductStatus = 'production' | 'pilot' | 'mvp' | 'dev';

export interface ProductFeature {
  /** Clé d'icône Lucide (résolue via `lib/icon-map.ts` → `DynamicIcon`).
   *  String pour être sérialisable en base Payload. */
  iconKey: string;
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

export interface ProductPricing {
  /** Modèle tarifaire : SaaS abonnement, licence + maintenance, sur devis. */
  model: 'saas' | 'license' | 'quote';
  /** Affichage prix vedette. Ex : "À partir de 25 000 F CFA / utilisateur / mois". */
  headline: string;
  /** Détails (3-5 bullets) : ce qui est inclus, prérequis, support. */
  details: readonly string[];
  /** Note de pied : conditions, devises, durée engagement. */
  note?: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface Product {
  /** Slug URL (kebab-case, `PRODUCT_SLUG_PATTERN`) — libre depuis l'admin. */
  slug: string;
  /** Clé d'icône Lucide (résolue via `lib/icon-map.ts` → `DynamicIcon`).
   *  String pour être sérialisable en base Payload. */
  iconKey: string;
  /** Nom public, ex : "NexusRH CI" ou "OpenLab Fraud Shield". */
  name: string;
  /** Tagline §18 — homepage card + meta description courte. */
  tagline: string;
  /** Cible marché concrète (CLAUDE.md §1.3). */
  target: string;
  status: ProductStatus;
  statusLabel: string;
  /**
   * Image hero optionnelle, pilotée depuis l'admin (champ `heroImage`
   * relié à la médiathèque). Si absente, la page retombe sur la capture
   * codée (`SOLUTION_SCREENSHOTS`), puis le mockup SVG, puis le
   * placeholder. Les produits fondateurs (fallback) n'en définissent pas.
   */
  heroImage?: { src: string; alt: string };
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
  /** Stats sourcées — 2-4 entrées sourcées (§4.10). */
  proofs: readonly ProductProof[];
  /** Tarification (§7.1 — modèle + headline + détails). */
  pricing: ProductPricing;
  /** FAQ produit (Schema.org FAQPage en page détail). */
  faq: readonly ProductFaq[];
  /** Expertises OpenLab pertinentes pour ce produit (cross-link). */
  expertisesLies: readonly ProductExpertise[];
}

/**
 * Source unique de vérité pour les 8 produits propriétaires (CLAUDE.md §1.3).
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
    iconKey: 'users',
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
        iconKey: 'users',
        title: 'Paie multi-statuts',
        body: 'CDI, CDD, journaliers, stagiaires. Chaque statut a ses règles de cotisation et NexusRH les applique sans intervention manuelle.',
      },
      {
        iconKey: 'badge-check',
        title: 'Conformité CNPS, ITS, FDFP native',
        body: 'Mise à jour automatique des barèmes à chaque changement réglementaire. Bordereau CNPS prêt à téléverser sur le portail.',
      },
      {
        iconKey: 'building',
        title: 'Mobile Money intégré',
        body: 'Diffusion salariale Orange Money, MTN Mobile Money, Moov Money — réconciliation automatique.',
      },
      {
        iconKey: 'scan-search',
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
    proofs: [
      {
        value: '+247',
        label: 'agents payés en Mobile Money',
        source: 'déploiement groupe RH ivoirien, 2025-2026',
      },
      {
        value: '0',
        label: 'pénalité ITS depuis 24 mois',
        source: 'audit DGI annuel client référent',
      },
      {
        value: '< 1 h',
        label: 'audit annuel CNPS',
        source: 'temps moyen post-déploiement vs >1 jour avant',
      },
    ],
    pricing: {
      model: 'saas',
      headline: 'À partir de 25 000 F CFA / utilisateur actif / mois',
      details: [
        'Paie multi-statuts illimitée (CDI, CDD, journaliers, stagiaires)',
        'Diffusion Mobile Money + virement bancaire inclus',
        'Mises à jour barèmes CNPS / ITS / FDFP automatiques',
        'Support technique sous 24 h ouvrées',
        'Migration des données paie existantes assistée',
      ],
      note: 'Engagement 12 mois. Volume > 200 utilisateurs : sur devis avec remise dégressive.',
    },
    faq: [
      {
        question: 'NexusRH est-il vraiment conforme CNPS et DGI ?',
        answer:
          'Oui. Les barèmes ITS, FDFP, CNPS sont maintenus par notre équipe juridique et mis à jour à chaque arrêté. Le bordereau CNPS produit est directement téléversable sur le portail e-CNPS.',
      },
      {
        question: 'Puis-je migrer depuis Sage Paie ou Cegid ?',
        answer:
          'Oui. Nous proposons un import CSV templatisé et un accompagnement de migration sous 2 à 4 semaines selon le volume. La double-paie en parallèle est possible pendant 1 cycle de validation.',
      },
      {
        question: 'Quels opérateurs Mobile Money sont supportés ?',
        answer:
          'Orange Money, MTN Mobile Money, Moov Money en Côte d’Ivoire. Wave est en cours d’intégration (Q3 2026). Les autres pays UEMOA suivent.',
      },
      {
        question: 'Mes données restent-elles en Côte d’Ivoire ?',
        answer:
          'Les données sont hébergées en Allemagne (Hetzner Falkenstein), conforme RGPD UE + loi ivoirienne 2013-450. Une option d’hébergement on-premise existe pour les organismes publics.',
      },
    ],
    expertisesLies: [
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
  {
    slug: 'nexuserp',
    iconKey: 'building',
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
        iconKey: 'badge-check',
        title: 'Comptabilité SYSCOHADA + PCG',
        body: 'Plans comptables ivoirien et français en parallèle, traduction automatique des écritures, états financiers conformes aux deux référentiels.',
      },
      {
        iconKey: 'building',
        title: 'Ventes, achats, stock, projets',
        body: 'Pipeline commercial, devis-facture, GRC clients, gestion projet par affaire (heures, marge, facturation à l’avancement).',
      },
      {
        iconKey: 'scan-search',
        title: 'Dashboard exécutif multi-devises',
        body: 'CA consolidé temps réel en FCFA, EUR, USD. Drill-down par BU, pays, période. Alertes sur dérive de marge.',
      },
      {
        iconKey: 'users',
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
    proofs: [
      {
        value: '2',
        label: 'référentiels comptables natifs',
        source: 'SYSCOHADA OHADA + PCG France 2014, plan unifié',
      },
      {
        value: '3',
        label: 'devises supportées en consolidation',
        source: 'FCFA, EUR, USD avec écart de change automatique',
      },
      {
        value: '50-500',
        label: 'employés gérés par instance',
        source: 'sweet spot PME multi-pays UEMOA et France',
      },
    ],
    pricing: {
      model: 'saas',
      headline: 'À partir de 1 200 € HT / mois (jusqu’à 25 utilisateurs)',
      details: [
        'Modules compta, ventes, achats, stock, projets, RH inclus',
        'Multi-devises FCFA / EUR / USD + autres devises sur demande',
        'États SYSCOHADA + liasse fiscale UEMOA + bilan PCG France',
        'Support email + Slack partagé, SLA réponse 8 h ouvrées',
        'Onboarding 4 semaines accompagné par notre équipe migration',
      ],
      note: 'Plan « Enterprise » sur devis pour > 100 utilisateurs ou multi-instances.',
    },
    faq: [
      {
        question:
          'NexusERP gère-t-il vraiment les deux référentiels en parallèle ?',
        answer:
          'Oui. Chaque opération est enregistrée dans le plan SYSCOHADA et translatée à la volée dans le PCG France via une table de correspondance maintenue. Les états sortent en deux versions sans double-saisie.',
      },
      {
        question: 'Quelle est la différence avec NexusRH ?',
        answer:
          'NexusERP gère les RH génériques (contrats, congés, fiches de paie SYSCOHADA). NexusRH est spécialisé conformité paie ivoirienne (CNPS, ITS, FDFP, Mobile Money). Les deux s’interconnectent.',
      },
      {
        question: 'Puis-je migrer depuis Sage 100 ou Odoo ?',
        answer:
          'Oui. Nos connecteurs d’import existent pour Sage 100/X3, Odoo 16+, et tout ERP qui exporte un FEC (Fichier des Écritures Comptables). Migration moyenne : 4 semaines.',
      },
      {
        question: 'Y a-t-il une version mobile ?',
        answer:
          'Le back-office est responsive (Angular 18). Une PWA dédiée approbation/validation est disponible pour les managers (devis, congés, dépenses).',
      },
    ],
    expertisesLies: [
      { slug: 'conseil-strategie', title: 'Conseil & stratégie IA' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
  {
    slug: 'sygescom',
    iconKey: 'fuel',
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
        iconKey: 'fuel',
        title: 'Ingestion temps réel multi-stations',
        body: 'Connecteurs jauges, pompes, terminaux paiement. Chaque flux est tagué station × cuve × type de carburant.',
      },
      {
        iconKey: 'scan-search',
        title: 'Détection IA d’anomalies',
        body: 'Modèles d’apprentissage non supervisé qui repèrent les écarts de stock inhabituels avant qu’ils ne deviennent des mancos déclarés.',
      },
      {
        iconKey: 'radar',
        title: 'Dashboard exécutif drill-down',
        body: 'Vue groupe → région → station → cuve → événement. Alertes Slack/email sur seuils paramétrables.',
      },
      {
        iconKey: 'badge-check',
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
    pricing: {
      model: 'license',
      headline: 'Licence + maintenance sur devis',
      details: [
        'Licence groupe — utilisateurs illimités du même réseau',
        'Inclut intégration jauges + pompes + terminaux paiement',
        'Modèle IA de détection anomalies entraîné sur vos historiques',
        'Maintenance corrective + mises à jour majeures incluses 12 mois',
        'Support sur incident en 4 h ouvrées (option 24/7)',
      ],
      note: 'Tarif basé sur le nombre de stations et la complexité de la flotte. Devis sous 5 jours après audit terrain.',
    },
    faq: [
      {
        question: 'SYGESCOM s’intègre-t-il à mon ERP existant ?',
        answer:
          'Oui. Des connecteurs natifs existent pour SAP, NexusERP, Sage X3. Les écritures comptables sont générées automatiquement après réconciliation.',
      },
      {
        question: 'Mes pompes anciennes sont-elles supportées ?',
        answer:
          'SYGESCOM est compatible avec la majorité des pompes IFSF / DART standardisées. Pour des pompes très anciennes, nous fournissons des modules de conversion analogique-numérique.',
      },
      {
        question: 'Combien de stations puis-je superviser ?',
        answer:
          'Le plus gros déploiement actuel gère 60+ stations en temps réel. L’architecture Kafka + TimescaleDB scale à plusieurs centaines sans changement majeur.',
      },
      {
        question: 'Y a-t-il un mode hors-ligne pour les stations isolées ?',
        answer:
          'Oui. Chaque station embarque un agent local qui collecte les données et les remonte dès reconnexion. Aucune perte de donnée même après 72 h offline.',
      },
    ],
    expertisesLies: [
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
    ],
  },
  {
    slug: 'agrosense',
    iconKey: 'sprout',
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
        iconKey: 'sprout',
        title: 'Imagerie multi-source',
        body: 'Sentinel-2, capteurs propriétaires terrain, drones photogrammétriques. Une seule carte parcelle, plusieurs couches.',
      },
      {
        iconKey: 'radar',
        title: 'Prédiction maladies & rendements',
        body: 'Modèles entraînés sur séries climatiques CHIRPS + données terrain ivoirienne. Alertes 7-15 jours avant apparition.',
      },
      {
        iconKey: 'users',
        title: 'Interface coopérative',
        body: 'Vue agrégée par coopérative, drill-down par village, par adhérent, par parcelle. Reporting subventionneurs en un clic.',
      },
      {
        iconKey: 'badge-check',
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
    proofs: [
      {
        value: '47',
        label: 'parcelles cacao instrumentées',
        source: 'pilote coopérative Daloa, campagne 2025-2026',
      },
      {
        value: 'J+14',
        label: 'horizon de prédiction maladies',
        source: 'modèles entraînés sur historique SODEXAM + terrain',
      },
      {
        value: '86 %',
        label: 'précision modèles pourriture brune',
        source: 'F1-score validation croisée sur jeu de test 2024',
      },
    ],
    pricing: {
      model: 'saas',
      headline: 'À partir de 15 000 F CFA / hectare / saison',
      details: [
        'Capteurs IoT sol fournis + maintenance (1 capteur / 0,5 ha)',
        'Imagerie satellite Sentinel-2 incluse',
        'Tableau de bord coopérative + reporting EUDR conformité',
        'Bulletins agronomiques hebdomadaires personnalisés',
        'Formation agents techniques + adhérents incluse',
      ],
      note: 'Programmes d’État ou bailleurs (Banque Mondiale, AFD, CCC) : tarification dégressive sur volume coopératives.',
    },
    faq: [
      {
        question: 'AgroSense fonctionne-t-il sans connexion 4G permanente ?',
        answer:
          'Oui. Les capteurs utilisent LoRaWAN (longue portée, basse conso). Une passerelle par coopérative agrège puis remonte en 3G/4G dès que disponible. Aucune perte de mesure.',
      },
      {
        question: 'Quelles cultures sont supportées ?',
        answer:
          'Cacao, anacarde, coton, hévéa en production. Le palmier à huile et le café arrivent en 2026. Les modèles sont entraînés culture par culture, pas génériques.',
      },
      {
        question: 'Comment AgroSense aide-t-il pour la conformité EUDR ?',
        answer:
          'Chaque parcelle est géolocalisée précisément (< 5m). Le système prouve qu’elle n’est pas en zone de déforestation post-2020 via croisement avec les masques satellitaires Global Forest Watch. Le rapport EUDR sort en un clic.',
      },
      {
        question: 'Les données appartiennent à qui ?',
        answer:
          'Aux producteurs et coopératives. OpenLab est hébergeur technique. Les données ne sont pas revendues à des tiers ; un consortium peut être créé pour les partager entre acteurs consentants.',
      },
    ],
    expertisesLies: [
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
      { slug: 'conseil-strategie', title: 'Conseil & stratégie IA' },
    ],
  },
  {
    slug: 'qualitos',
    iconKey: 'badge-check',
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
        iconKey: 'badge-check',
        title: 'Référentiel ISO unifié',
        body: 'ISO 9001, 14001, 45001, 22000 supportés en parallèle. Une non-conformité se rattache automatiquement aux exigences concernées.',
      },
      {
        iconKey: 'scan-search',
        title: 'Ishikawa IA assistée',
        body: 'Claude propose une analyse de causes initiale sur la base de la description du non-conforme. L’opérateur valide ou recadre.',
      },
      {
        iconKey: 'users',
        title: 'Audit mobile offline-first',
        body: 'L’auditeur passe en mode hors-ligne sur site, ses constats remontent au siège dès reconnexion.',
      },
      {
        iconKey: 'building',
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
    proofs: [
      {
        value: '4',
        label: 'normes ISO supportées en parallèle',
        source: 'ISO 9001, 14001, 45001, 22000 — référentiel unifié',
      },
      {
        value: '5',
        label: 'méthodes qualité intégrées',
        source: 'PDCA, 5S, DMAIC, CAPA, AMDEC',
      },
      {
        value: 'Offline',
        label: 'audit terrain garanti',
        source: 'PWA Angular 18 service worker · sync auto',
      },
    ],
    pricing: {
      model: 'saas',
      headline: 'À partir de 600 € HT / mois (15 utilisateurs)',
      details: [
        'Référentiel ISO unifié 9001/14001/45001/22000',
        'Audit mobile PWA offline-first illimité',
        'CAPA + indicateurs + tableaux de bord temps réel',
        'Ishikawa assisté IA (1 000 analyses / mois inclus)',
        'Export normatif (rapport audit ISO 19011)',
      ],
      note: 'Multi-sites > 5 ou > 50 utilisateurs : sur devis avec déploiement assisté.',
    },
    faq: [
      {
        question: 'QualitOS est-il certifié pour les audits ISO ?',
        answer:
          'QualitOS est un support d’audit, pas un certificateur. Il prépare et structure l’audit conformément à l’ISO 19011 ; la certification finale reste du ressort de l’organisme accrédité (Bureau Veritas, AFNOR, etc.).',
      },
      {
        question: 'L’assistant IA voit-il mes données qualité ?',
        answer:
          'Les analyses Ishikawa et 5 pourquoi sont envoyées à Claude API avec uniquement le contexte du non-conforme courant. Aucun historique global n’est exposé. Option d’inférence on-premise via vLLM pour les industries sensibles.',
      },
      {
        question: 'Peut-on gérer plusieurs sites / filiales ?',
        answer:
          'Oui. QualitOS est multi-tenant strict : chaque site a ses propres référentiels, audits, indicateurs. Un siège peut consolider les KPI en vue groupe avec permissions granulaires.',
      },
      {
        question: 'Existe-t-il une intégration GED ou Sharepoint ?',
        answer:
          'Connecteurs natifs vers Sharepoint, M-Files et Alfresco pour la gestion documentaire normative (procédures, modes opératoires). API REST pour les autres GED.',
      },
    ],
    expertisesLies: [
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
  {
    slug: 'fraud-shield',
    iconKey: 'scan-search',
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
        iconKey: 'scan-search',
        title: 'Détection multi-modale',
        body: 'Vision (manipulations pixel, anti-aliasing incohérent) + texte (cohérence montants, dates, signataires) + métadonnées EXIF.',
      },
      {
        iconKey: 'badge-check',
        title: 'Score d’authenticité expliqué',
        body: 'Chaque document reçoit un score 0-100 + un overlay visuel pointant les zones suspectes. Pas de boîte noire pour l’auditeur.',
      },
      {
        iconKey: 'users',
        title: 'Workflow contrôleur intégré',
        body: 'API REST drop-in dans vos workflows existants (LDM, GED, dossier client). Pas de migration, pas de re-formation.',
      },
      {
        iconKey: 'building',
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
    proofs: [
      {
        value: '< 2 s',
        label: 'analyse moyenne par document',
        source: 'CPU only · ONNX Runtime · documents 1080p',
      },
      {
        value: '× 3',
        label: 'cas détectés / contrôleur',
        source: 'pilote établissement bancaire UEMOA, T1 2026',
      },
      {
        value: '99 %',
        label: 'confiance signature dupliquée',
        source: 'modèle re-id signature · seuil 99 % avec overlay',
      },
    ],
    pricing: {
      model: 'saas',
      headline: 'À partir de 0,50 € HT / document analysé',
      details: [
        'API REST drop-in (REST + WebSocket pour traitement batch)',
        'Multi-tenant strict : vos modèles ré-entraînés sur vos cas',
        'Audit log immuable post-décision pour conformité régulateur',
        'SDK Java et Python fournis pour l’intégration LDM/GED',
        'Tableau de bord superviseur + dashboards de dérive modèle',
      ],
      note: 'Forfait > 100 000 documents/mois sur devis. Option on-premise pour les banques centrales.',
    },
    faq: [
      {
        question: 'Le score est-il explicable pour le contrôleur ?',
        answer:
          'Oui. Chaque détection génère un overlay PNG sur le document montrant les zones suspectes + un rapport texte expliquant les motifs (« cachet de couleur incohérente avec le fond », « date manipulée pixel-by-pixel »).',
      },
      {
        question: 'Quels types de documents sont supportés ?',
        answer:
          'Pièces d’identité (CNI, passeport), factures, attestations bancaires, RIB, certificats de domiciliation, bulletins de paie, fiches familiales. Nouveaux types ajoutables sur demande.',
      },
      {
        question: 'Faut-il du GPU ?',
        answer:
          'Non en production standard : ONNX Runtime CPU traite ~5 documents/s sur un cœur. GPU recommandé uniquement pour > 50 documents/s ou batch d’analyse rétrospective.',
      },
      {
        question: 'Mes documents sont-ils stockés sur vos serveurs ?',
        answer:
          'Par défaut non : le document est traité in-memory puis supprimé. Stockage chiffré 30 jours uniquement si activé explicitement pour réentraînement (consentement écrit requis).',
      },
    ],
    expertisesLies: [
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
    ],
  },
  {
    slug: 'smart-city',
    iconKey: 'radar',
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
        iconKey: 'radar',
        title: 'Carte de chaleur urbaine',
        body: 'Visualisation temps réel des concentrations d’incidents, croisée avec densité, mobilité, équipements publics manquants.',
      },
      {
        iconKey: 'scan-search',
        title: 'Modèles de prédiction',
        body: 'Risques d’embouteillage, de pic d’incidents, d’événements sociaux à fort potentiel. Les services préventifs sont positionnés en amont.',
      },
      {
        iconKey: 'users',
        title: 'Portail citoyens',
        body: 'Signalements géolocalisés, suivi de résolution, transparence sur les actions municipales.',
      },
      {
        iconKey: 'badge-check',
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
    proofs: [
      {
        value: 'J-7',
        label: 'prédiction concentration d’incidents',
        source: 'modèle XGBoost séries temporelles + données socio',
      },
      {
        value: 'RGPD',
        label: 'anonymisation différentielle dès ingestion',
        source: 'visages, plaques, identifiants flouttés avant stockage',
      },
      {
        value: '4',
        label: 'sources de données fusionnées',
        source: 'CCTV, mobilité, signalements citoyens, INS / DGE',
      },
    ],
    pricing: {
      model: 'quote',
      headline: 'Programme pluriannuel sur devis',
      details: [
        'Cadrage stratégique 4-6 semaines avec la collectivité',
        'POC sur quartier pilote (3-6 mois) avant déploiement ville',
        'Licence + infrastructure souveraine (Hetzner Allemagne ou on-prem)',
        'Formation équipe sécurité + opérateurs collectivité',
        'Comité éthique trimestriel inclus (transparence citoyenne)',
      ],
      note: 'Programme typiquement co-financé par bailleurs (UE, BAD, AFD, Banque Mondiale). Notre équipe accompagne le montage du dossier.',
    },
    faq: [
      {
        question: 'Smart City est-il un outil de surveillance ?',
        answer:
          'Non. Smart City n’identifie aucun individu : les visages et plaques sont anonymisés avant toute analyse. L’objectif est l’aide à la décision politique (où placer un commissariat, comment fluidifier la mobilité), pas la traque.',
      },
      {
        question: 'Quel hébergement pour des données aussi sensibles ?',
        answer:
          'Trois options : (1) Hetzner Allemagne (RGPD UE), (2) cluster K3s on-premise dans le data center de la collectivité, (3) cloud souverain national si disponible. La donnée brute ne quitte jamais le territoire convenu.',
      },
      {
        question: 'Comment garantir la transparence vis-à-vis des citoyens ?',
        answer:
          'Un portail public expose les indicateurs agrégés (chaleur, mobilité, signalements résolus). Un comité éthique trimestriel valide les nouveaux usages avant déploiement.',
      },
      {
        question: 'Peut-on intégrer un système CCTV existant ?',
        answer:
          'Oui via les protocoles ONVIF / RTSP standard. L’anonymisation est appliquée en bordure (edge), avant toute remontée vers le data center central.',
      },
    ],
    expertisesLies: [
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
  {
    slug: 'sentinelbtp',
    iconKey: 'hard-hat',
    name: 'SentinelBTP',
    tagline: 'Voir le danger avant l’effondrement.',
    target: 'BTP, bureaux de contrôle, assureurs · Côte d’Ivoire & Afrique',
    status: 'pilot',
    statusLabel: 'En pilote',
    eyebrow: 'Surveillance structurelle par IA · SHM',
    intro:
      'SentinelBTP instrumente les bâtiments et ouvrages avec des capteurs edge (inclinaison, fissuration, tassement, vibrations) et compare chaque mesure à la trajectoire historique de la structure. Le résultat n’est pas un seuil fixe mais un score de risque évolutif — du suivi de chantier à l’exploitation.',
    problem:
      'À Abidjan, un immeuble qui s’effondre a presque toujours prévenu : le béton fissure, la structure s’incline de quelques millimètres, les vibrations changent de signature. Le problème n’est pas l’absence de signaux — c’est que personne ne les mesure en continu. Les inspections restent humaines, ponctuelles et tardives.',
    features: [
      {
        iconKey: 'antenna',
        title: 'Captation edge multi-capteurs',
        body: 'Inclinomètres, accéléromètres, jauges de fissuration, sondes de tassement, température et hygrométrie mesurent en continu le comportement physique de l’ouvrage.',
      },
      {
        iconKey: 'radar',
        title: 'Connectivité frugale & hors-ligne',
        body: 'LoRaWAN et NB-IoT longue portée basse consommation, avec mode dégradé hors-ligne. Les mesures sont historisées sur une plateforme souveraine.',
      },
      {
        iconKey: 'scan-search',
        title: 'Score de risque sur séries temporelles',
        body: 'Des modèles d’IA comparent chaque mesure à l’historique de l’ouvrage et calculent un risque évolutif, au lieu de simples seuils — le cœur de la valeur.',
      },
      {
        iconKey: 'badge-check',
        title: 'Alertes graduées & preuve opposable',
        body: 'Alertes multicanal vigilance · alerte · danger, et dossier de preuve numérique horodaté, infalsifiable, adossé à l’article 37 du Code de la Construction.',
      },
    ],
    stack: [
      'Capteurs IoT terrain (inclinomètres, accéléromètres, jauges)',
      'Connectivité LoRaWAN / NB-IoT · passerelle mode dégradé',
      'PostgreSQL 17 + TimescaleDB pour les séries temporelles',
      'Worker Python · détection d’anomalies sur séries temporelles',
      'Cloud souverain Hetzner ou on-premise · K3s',
    ],
    proofs: [
      {
        value: '≥ 72 h',
        label: 'préavis avant seuil de danger',
        source: 'objectif opérationnel SentinelBTP (couche intelligence)',
      },
      {
        value: '< 60 s',
        label: 'délai d’alerte après détection',
        source: 'objectif opérationnel SentinelBTP (couche restitution)',
      },
      {
        value: '< 8 %',
        label: 'taux de faux positifs ciblé',
        source: 'cible modèle séries temporelles vs seuils fixes',
      },
      {
        value: '10,5 Md$',
        label: 'marché SHM mondial visé en 2030',
        source: 'Grand View Research — Structural Health Monitoring 2024',
      },
    ],
    pricing: {
      model: 'quote',
      headline: 'Programme de surveillance sur devis',
      details: [
        'Audit terrain + dimensionnement capteurs par ouvrage',
        'POC sur immeuble ou chantier pilote avant déploiement parc',
        'Licence + hébergement souverain (Hetzner Allemagne ou on-prem)',
        'Dossier de preuve conformité article 37 inclus',
        'Formation des bureaux de contrôle et exploitants',
      ],
      note: 'Tarif fonction du nombre d’ouvrages et de capteurs. Montage de dossier bailleurs (assureurs, collectivités) accompagné.',
    },
    faq: [
      {
        question: 'Où sont hébergées des données aussi sensibles ?',
        answer:
          'Par construction, SentinelBTP privilégie le traitement en périphérie (edge) et un hébergement sous contrôle national : Hetzner Allemagne (RGPD UE) ou cluster on-premise. Les données décrivant la vulnérabilité d’ouvrages habités ne sont pas confiées à des plateformes étrangères.',
      },
      {
        question: 'Que se passe-t-il en cas de coupure réseau ?',
        answer:
          'Les capteurs utilisent LoRaWAN / NB-IoT et une passerelle qui historise localement en mode dégradé. Les mesures remontent dès reconnexion : aucune perte de signal, même après plusieurs heures hors-ligne.',
      },
      {
        question: 'Peut-on instrumenter un bâtiment déjà construit ?',
        answer:
          'Oui. SentinelBTP s’installe aussi bien pendant le chantier que sur un ouvrage en exploitation. La phase d’apprentissage établit la trajectoire de référence propre à chaque structure avant de produire des alertes.',
      },
      {
        question: 'En quoi cela aide-t-il juridiquement le maître d’ouvrage ?',
        answer:
          'L’article 37 du Code de la Construction et de l’Habitat rend le maître d’ouvrage responsable de la stabilité du bâtiment. Le dossier de preuve horodaté et infalsifiable transforme cette obligation en diligence démontrable et opposable.',
      },
    ],
    expertisesLies: [
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
] as const;

/**
 * Alias du fallback hard-codé — utilisé par `lib/products-server.ts` quand
 * la collection Payload `products` est vide ou indisponible (build statique,
 * dev sans docker, DB down). Nommage aligné sur `FALLBACK_CASE_STUDIES`.
 */
export const FALLBACK_PRODUCTS: readonly Product[] = PRODUCTS;

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
