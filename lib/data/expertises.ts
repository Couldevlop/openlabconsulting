export type ExpertiseSlug =
  | 'conseil-strategie'
  | 'agents-automatisation'
  | 'data-gouvernance'
  | 'cybersecurite-ia';

export interface ExpertiseProduct {
  slug: string;
  name: string;
}

export interface ApproachStep {
  step: string;
  title: string;
  body: string;
}

export interface Expertise {
  slug: ExpertiseSlug;
  /** Clé d'icône Lucide (résolue via `lib/icon-map.ts` → `DynamicIcon`).
   *  String pour être sérialisable en base Payload. */
  iconKey: string;
  /** Titre court utilisé dans cards + h1 page détail. */
  title: string;
  /** Phrase d'accroche §18 — homepage card + meta tag. */
  punchline: string;
  /** Paragraphe d'intro de la page détail (hero) — 2-3 phrases. */
  intro: string;
  /** 4-6 sous-domaines concrets que cette expertise couvre. */
  competences: readonly string[];
  /** 3 étapes de notre approche (méthodologie). */
  approche: readonly ApproachStep[];
  /** Produits OpenLab pertinents pour cette expertise (cross-link
   *  vers /solutions/<slug>). */
  produitsLies: readonly ExpertiseProduct[];
}

/**
 * Source unique de vérité pour les 4 expertises — utilisée par :
 *   - `components/sections/Expertises.tsx` (homepage §6.3)
 *   - `app/expertises/page.tsx` (hub)
 *   - `app/expertises/[slug]/page.tsx` (pages détaillées)
 *
 * Toute mise à jour de wording, ajout de compétence ou de produit lié
 * se fait ici, jamais en dur dans les composants.
 *
 * Wording §18 : antithèse, deux temps, adresse directe — pas de
 * "solutions sur mesure" ni de "synergies".
 */
export const EXPERTISES: readonly Expertise[] = [
  {
    slug: 'conseil-strategie',
    iconKey: 'compass',
    title: 'Conseil & stratégie IA',
    punchline:
      "Cartographier l'IA réellement utile. Écarter ce qui ne le sera jamais.",
    intro:
      "Avant de coder quoi que ce soit, on cadre. Nos missions de conseil partent d'un diagnostic terrain — vos workflows, vos contraintes réglementaires, vos données disponibles — et débouchent sur une feuille de route priorisée par ROI mesurable, pas par buzzword.",
    competences: [
      'Diagnostic des cas d’usage IA prioritaires (impact × faisabilité)',
      'Cadrage MVP / Pilote / Industrialisation, jalonné et chiffré',
      'Analyse build-vs-buy intégrant l’écosystème OpenLab existant',
      'Comité de pilotage IA mensuel jusqu’à autonomie de l’équipe interne',
      'Évaluation conformité (AI Act UE, RGPD, loi ivoirienne 2013-450)',
    ],
    approche: [
      {
        step: '01',
        title: 'Écouter le terrain',
        body: 'Deux semaines d’immersion : interviews métier, audit data, cartographie des SI existants. On ne parle ni d’IA ni de modèle à ce stade.',
      },
      {
        step: '02',
        title: 'Prioriser ce qui rend',
        body: 'Matrice impact × faisabilité × dette technique. Trois cas d’usage retenus, chacun chiffré en valeur attendue et coût de mise en œuvre.',
      },
      {
        step: '03',
        title: 'Transférer la décision',
        body: 'Vous gardez la main : la roadmap est défendable devant un COMEX, lisible par votre DSI, exécutable par vos prestataires existants ou par nous.',
      },
    ],
    produitsLies: [
      { slug: 'nexuserp', name: 'NexusERP' },
      { slug: 'qualitos', name: 'QualitOS' },
    ],
  },
  {
    slug: 'agents-automatisation',
    iconKey: 'bot',
    title: 'Agents & automatisation',
    punchline:
      'Vos workflows, automatisés. Vos équipes, augmentées — pas remplacées.',
    intro:
      "On déploie des agents IA qui exécutent vos workflows répétitifs — saisie comptable, qualification de leads, triage de tickets, reporting réglementaire — sans casser les outils et processus qui marchent déjà. L'humain reste au point de décision critique.",
    competences: [
      'Agents Claude / GPT en boucle outils (function calling, RAG souverain)',
      'Orchestration multi-agents pour workflows métier complexes',
      'Intégration avec NexusRH, NexusERP, ERP tiers (SAP, Sage, Odoo)',
      'Boucle humaine (human-in-the-loop) à chaque étape critique',
      'Métriques de qualité : précision, taux d’escalade, satisfaction agent',
    ],
    approche: [
      {
        step: '01',
        title: 'Tracer le workflow réel',
        body: 'On suit physiquement le processus pendant 5 jours — clics, ré-encodage, allers-retours. Le PowerPoint n’a jamais raconté la vraie histoire.',
      },
      {
        step: '02',
        title: 'Automatiser ce qui répète',
        body: 'L’agent prend en charge les tâches déterministes ou faiblement ambiguës. Il escalade systématiquement les cas hors-cadre, avec contexte.',
      },
      {
        step: '03',
        title: 'Mesurer, durcir, transférer',
        body: 'Dashboards de qualité, KPIs gouvernance, plan de bascule progressive. Vous reprenez l’opération à 6 mois.',
      },
    ],
    produitsLies: [
      { slug: 'nexusrh', name: 'NexusRH CI' },
      { slug: 'sygescom', name: 'SYGESCOM v2.0' },
      { slug: 'fraud-shield', name: 'OpenLab Fraud Shield' },
    ],
  },
  {
    slug: 'data-gouvernance',
    iconKey: 'database',
    title: 'Data & gouvernance',
    punchline:
      'La data est votre pétrole. La gouvernance est votre raffinerie.',
    intro:
      'Une IA performante repose sur une donnée gouvernée. On construit votre socle data — catalog, lineage, qualité, accès — pour que vos modèles soient explicables, vos audits passent, et votre conformité ne devienne pas une surprise.',
    competences: [
      'Cartographie des sources data (SI, CSV, capteurs IoT, scraping interne)',
      'Catalog & lineage : Atlan, OpenMetadata, ou stack OpenLab self-hosted',
      'Politiques de qualité : tests de fraîcheur, complétude, cohérence',
      'Gestion des accès par rôle (RBAC) + audit log immuable',
      'Conformité RGPD + Loi ivoirienne 2013-450 sur les données personnelles',
    ],
    approche: [
      {
        step: '01',
        title: 'Inventorier ce qui existe',
        body: 'Audit complet : sources, volumes, qualité, propriétaires, contraintes légales. Personne ne pilote bien ce qu’il n’a pas cartographié.',
      },
      {
        step: '02',
        title: 'Définir le pacte data',
        body: 'Qui est propriétaire, qui valide les schémas, qui répond aux régulateurs. Un document, un comité, une cadence — pas trois.',
      },
      {
        step: '03',
        title: 'Outiller la durée',
        body: 'Catalog, lineage, alertes qualité. Tout est self-hosted si la souveraineté l’exige, ou managé si la vitesse prime.',
      },
    ],
    produitsLies: [
      { slug: 'nexuserp', name: 'NexusERP' },
      { slug: 'agrosense', name: 'AgroSense CI' },
    ],
  },
  {
    slug: 'cybersecurite-ia',
    iconKey: 'shield-check',
    title: 'Cybersécurité augmentée',
    punchline:
      "Détecter ce qui devient invisible. Anticiper ce qui n'a pas frappé.",
    intro:
      "La cybersécurité reactive ne suffit plus : les attaques deviennent multimodales, les fraudes documentaires imitent les chartes graphiques, les RH se font phisher à l'échelle. On déploie des couches IA défensives qui complètent vos SOC sans les remplacer.",
    competences: [
      'Détection de fraude documentaire (Fraud Shield, modèles vision)',
      'Anomaly detection sur logs et flux transactionnels',
      'Phishing IA : détection au niveau du contenu, pas juste de l’en-tête',
      'Threat intelligence francophone Afrique de l’Ouest',
      'Plan de réponse incident + simulation table-top trimestrielle',
    ],
    approche: [
      {
        step: '01',
        title: 'Évaluer la surface d’attaque',
        body: 'Cartographie des vecteurs documents, identités, flux transactionnels, comptes dormants. Un attaquant fait toujours ce que vous n’avez pas inventorié.',
      },
      {
        step: '02',
        title: 'Empiler des couches IA',
        body: 'Modèles dédiés par typologie de risque, intégrés à vos SOC ou SIEM existants. On ne remplace pas vos analystes — on filtre leur flux.',
      },
      {
        step: '03',
        title: 'Simuler, mesurer, ré-armer',
        body: 'Exercices red team + table-top tous les 3 mois. Les détecteurs IA sont ré-entraînés sur vos propres faux positifs.',
      },
    ],
    produitsLies: [
      { slug: 'fraud-shield', name: 'OpenLab Fraud Shield' },
      { slug: 'smart-city', name: 'OpenLab Smart City' },
    ],
  },
] as const;

/**
 * Alias du fallback hard-codé — utilisé par `lib/expertises-server.ts`
 * quand la collection Payload `expertises` est vide ou indisponible
 * (build statique, dev sans docker, DB down). Nommage aligné sur
 * `FALLBACK_PRODUCTS`.
 */
export const FALLBACK_EXPERTISES: readonly Expertise[] = EXPERTISES;

/** Retourne une expertise par slug ou `undefined`. */
export function getExpertiseBySlug(slug: string): Expertise | undefined {
  return EXPERTISES.find((e) => e.slug === slug);
}
