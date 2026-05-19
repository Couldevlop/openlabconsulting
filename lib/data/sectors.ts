import type { ComponentType, SVGProps } from 'react';
import { Antenna, HeartPulse, Landmark, Wallet, Wheat } from 'lucide-react';

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type SectorSlug =
  | 'secteur-public'
  | 'banque-assurance'
  | 'agro-industrie'
  | 'sante'
  | 'telecoms-energie';

export interface SectorCrossLink {
  slug: string;
  title: string;
}

export interface Sector {
  slug: SectorSlug;
  Icon: LucideIcon;
  /** Nom court affiché en card et h1. */
  name: string;
  /** Tagline §18 — homepage, hub, meta. */
  tagline: string;
  /** Hero pitch page détail — 2-3 phrases. */
  intro: string;
  /** 4-6 enjeux concrets du secteur. */
  enjeux: readonly string[];
  /** Cadre réglementaire/normatif applicable au secteur (3-5 entrées). */
  regulation: readonly string[];
  /** Produits OpenLab pertinents (cross-link). */
  produitsLies: readonly SectorCrossLink[];
  /** Expertises pertinentes (cross-link). */
  expertisesLies: readonly SectorCrossLink[];
}

/**
 * Source unique de vérité pour les 5 secteurs cibles (CLAUDE.md §5).
 *
 * Les slugs sont alignés sur ceux du formulaire AuditIaCta
 * (`secteur-public`, `banque-assurance`, `agro-industrie`, `sante`,
 * `telecoms-energie`) afin que la sélection de secteur depuis l'audit
 * puisse rediriger directement sur la page sectorielle correspondante.
 *
 * Wording §18 : phrases courtes, antithèse, faits — pas de
 * "transformation digitale" ni de "synergies".
 */
export const SECTORS: readonly Sector[] = [
  {
    slug: 'secteur-public',
    Icon: Landmark,
    name: 'Secteur public',
    tagline:
      'Souveraineté des données. Service rendu. Et le citoyen au centre.',
    intro:
      "Ministères, collectivités, régulateurs : la digitalisation publique en Afrique francophone se heurte à trois obstacles — souveraineté des données, conformité, qualité du service. On déploie de l'IA qui respecte le cadre, gouvernée bout en bout, vérifiable par n'importe quel audit.",
    enjeux: [
      "Souveraineté des données — pas de cloud étranger pour des données d'usagers",
      "Anti-fraude documentaire — pièces d'identité, attestations, certificats",
      'Pilotage urbain — sécurité, mobilité, services publics anticipés',
      'Conformité juridique — loi ivoirienne 2013-450, traité de Malabo, RGPD',
      "Continuité de service — pas d'interruption acceptable sur les SI critiques",
    ],
    regulation: [
      'Loi ivoirienne 2013-450 sur les données personnelles',
      'Traité de Malabo (Union africaine, cyberssécurité & protection des données)',
      'RGPD pour les échanges avec l’Union européenne',
      'Normes ANSSI françaises pour les coopérations bilatérales',
    ],
    produitsLies: [
      { slug: 'smart-city', title: 'OpenLab Smart City' },
      { slug: 'fraud-shield', title: 'OpenLab Fraud Shield' },
      { slug: 'nexuserp', title: 'NexusERP' },
    ],
    expertisesLies: [
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
      { slug: 'conseil-strategie', title: 'Conseil & stratégie IA' },
    ],
  },
  {
    slug: 'banque-assurance',
    Icon: Wallet,
    name: 'Banque & assurance',
    tagline: 'KYC, AML, fraude documentaire. L’IA derrière chaque dossier.',
    intro:
      'Banques, microfinances, assureurs : vos contrôleurs croulent sous les pièces justificatives. Une fraude documentaire bien faite passe sous le radar. Une lutte anti-blanchiment réactive arrive toujours trop tard. On installe des couches IA défensives intégrées à vos workflows existants.',
    enjeux: [
      'KYC accéléré — vérification documentaire automatisée',
      'AML / lutte anti-blanchiment — détection patterns suspects en temps réel',
      "Anti-fraude documentaire — certificats de domiciliation, attestations bancaires, pièces d'identité",
      'Scoring crédit explicable — modèles auditables par la BCEAO',
      'Réconciliation comptable IFRS + SYSCOHADA',
    ],
    regulation: [
      'BCEAO — règlements UEMOA sur la lutte anti-blanchiment',
      'CRBF / ACPR pour les filiales bancaires opérant en zone euro',
      'Directives FATF / GAFI sur la finance internationale',
      'Loi ivoirienne 2013-450 sur les données personnelles',
    ],
    produitsLies: [
      { slug: 'fraud-shield', title: 'OpenLab Fraud Shield' },
      { slug: 'nexuserp', title: 'NexusERP' },
    ],
    expertisesLies: [
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
  {
    slug: 'agro-industrie',
    Icon: Wheat,
    name: 'Agro-industrie',
    tagline:
      'Cacao, anacarde, coton, hévéa. Du capteur à la chaîne de traçabilité.',
    intro:
      "Coopératives, exportateurs, industriels agroalimentaires : la pression EUDR sur la déforestation, les attentes ESG des acheteurs européens, et les aléas climatiques rendent la traçabilité non-négociable. On instrumente la parcelle, on prédit les rendements, on documente l'origine.",
    enjeux: [
      'Traçabilité origine parcelle GPS pour la conformité EUDR',
      'Prédiction maladies et rendements (cacao, anacarde, coton, hévéa)',
      'Optimisation des intrants — réduction des coûts par hectare',
      'Pilotage coopérative — adhérents, livraisons, qualité, paiements',
      'Reporting ESG aux acheteurs européens et aux bailleurs',
    ],
    regulation: [
      'EUDR (Règlement UE 2023/1115 sur la déforestation importée)',
      'Standards Fairtrade, Rainforest Alliance, UTZ',
      "Conseil du café-cacao de Côte d'Ivoire",
      'Loi ivoirienne 2013-450 sur les données personnelles',
    ],
    produitsLies: [
      { slug: 'agrosense', title: 'AgroSense CI' },
      { slug: 'qualitos', title: 'QualitOS' },
      { slug: 'nexuserp', title: 'NexusERP' },
    ],
    expertisesLies: [
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
      { slug: 'conseil-strategie', title: 'Conseil & stratégie IA' },
    ],
  },
  {
    slug: 'sante',
    Icon: HeartPulse,
    name: 'Santé',
    tagline: 'Parcours patient fluide. Qualité ISO 22000. Données protégées.',
    intro:
      'Hôpitaux, cliniques, mutuelles, laboratoires : la qualité de soin se joue dans la fluidité du parcours patient et la rigueur du système qualité. On déploie des outils qui automatisent la traçabilité ISO, gèrent les CAPA, et protègent les données patients sans alourdir vos équipes.',
    enjeux: [
      'Conformité qualité — ISO 22000, ISO 9001, accréditation HAS',
      'CAPA traçabilité — actions correctives sur événements indésirables',
      'Gestion des plannings équipes médicales et paramédicales',
      'Protection des données patient (RGPD santé, loi ivoirienne)',
      'Pilotage activité, occupation, équipement',
    ],
    regulation: [
      'RGPD article 9 (catégories particulières de données — santé)',
      'Loi ivoirienne 2013-450 sur les données personnelles',
      'Référentiels HAS pour les cliniques opérant en partenariat français',
      'Normes ISO 9001 / 22000 / 27001 selon activité',
    ],
    produitsLies: [
      { slug: 'qualitos', title: 'QualitOS' },
      { slug: 'nexusrh', title: 'NexusRH CI' },
    ],
    expertisesLies: [
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
    ],
  },
  {
    slug: 'telecoms-energie',
    Icon: Antenna,
    name: 'Télécoms & énergie',
    tagline:
      'Réseaux supervisés. Fraude isolée. Données pilotées en temps réel.',
    intro:
      "Opérateurs télécoms, distributeurs d'électricité, réseaux de stations hydrocarbures : vos volumes sont massifs, vos pertes invisibles, vos régulateurs exigeants. On déploie une couche d'ingestion temps réel + IA pour piloter, alerter et documenter.",
    enjeux: [
      'Supervision multi-sites en temps réel (stations, antennes, centrales)',
      'Détection fraude (carburant, énergie, services prépayés)',
      'Conformité ARTCI (télécoms) et autorités énergétiques',
      'Pilotage de la qualité de service réseau',
      'Anti-blanchiment Mobile Money et services financiers connexes',
    ],
    regulation: [
      'ARTCI — Autorité de régulation des télécommunications de Côte d’Ivoire',
      'CIE / Petroci pour la chaîne de distribution énergétique',
      'BCEAO pour les services financiers Mobile Money',
      'Loi ivoirienne 2013-450 sur les données personnelles',
    ],
    produitsLies: [
      { slug: 'sygescom', title: 'SYGESCOM v2.0' },
      { slug: 'fraud-shield', title: 'OpenLab Fraud Shield' },
      { slug: 'smart-city', title: 'OpenLab Smart City' },
    ],
    expertisesLies: [
      { slug: 'agents-automatisation', title: 'Agents & automatisation' },
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
      { slug: 'data-gouvernance', title: 'Data & gouvernance' },
    ],
  },
] as const;

export function getSectorBySlug(slug: string): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug);
}
