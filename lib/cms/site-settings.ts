/**
 * Types + fallbacks site-settings — utilisables côté client & server.
 *
 * Le fetch helpers (qui parlent à Payload) vit dans
 * `./site-settings-server.ts` (avec `'server-only'`). On sépare pour
 * que les composants client-safe (Hero, Manifesto, etc.) puissent
 * importer les types + fallback sans tirer le runtime Payload.
 */

export interface HeroContent {
  eyebrow: string;
  headlineLead: string;
  headlineHighlight: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  scrollCueLabel: string;
}

export interface ManifestoStance {
  excuse: string;
  fact: string;
}

export interface ManifestoContent {
  eyebrow: string;
  headline: string;
  headlineHighlight: string;
  intro: string;
  stances: readonly ManifestoStance[];
  conclusion: string;
  signature: { name: string; role: string; locationDate: string };
}

export interface MethodologieAxis {
  index: string;
  title: string;
  punchline: string;
  body: string;
}

export interface MethodologieContent {
  eyebrow: string;
  titleLead: string;
  titleHighlight: string;
  intro: string;
  axes: readonly MethodologieAxis[];
  cta: { label: string; href: string };
}

export interface AuditIaCtaWhitepaper {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  footnote: string;
  /** Vignette de couverture (chemin public). Optionnelle. */
  cover?: { src: string; width: number; height: number };
}

export interface AuditIaCtaContent {
  eyebrow: string;
  headlineLead: string;
  headlineHighlight: string;
  description: string;
  cta: { label: string; href: string };
  reassuranceBullets: readonly string[];
  whitepaperCard: AuditIaCtaWhitepaper;
}

export interface FooterContent {
  tagline: string;
  columns: readonly {
    title: string;
    links: readonly { label: string; href: string }[];
  }[];
  socialLinks: readonly { platform: string; url: string }[];
  copyright: string;
}

export interface ReassurancePartner {
  /** Nom de marque (alt + libellé). */
  name: string;
  /** URL du logo (chemin public en fallback, URL Media uploadée sinon). */
  src: string;
  /** Dimensions intrinsèques pour next/image (zéro CLS). */
  width: number;
  height: number;
}

export interface ReassuranceContent {
  eyebrow: string;
  partners: readonly ReassurancePartner[];
}

/**
 * Hero éditorial d'une page hub (Solutions, Expertises, Secteurs).
 * Le titre est scindé lead + highlight (segment orange). `headlineLead` et
 * `description` peuvent contenir les tokens de compteur (cf. product-count).
 */
export interface HubHeroContent {
  eyebrow: string;
  headlineLead: string;
  headlineHighlight: string;
  description: string;
}

export const SOLUTIONS_HUB_FALLBACK: HubHeroContent = {
  eyebrow: 'Hub Solutions',
  headlineLead: '{ProductsWord} logiciels propriétaires.',
  headlineHighlight: 'Une suite cohérente',
  description:
    'Pas une collection d’outils achetés ailleurs : chacun de nos produits est conçu et opéré par la même équipe, déployé sur le même cluster K3s, gouverné par les mêmes principes de sécurité et de souveraineté.',
};

export const EXPERTISES_HUB_FALLBACK: HubHeroContent = {
  eyebrow: 'Hub Expertises',
  headlineLead: 'Quatre expertises.',
  headlineHighlight: 'Une seule logique',
  description:
    'Pas un menu de prestations indépendantes : chaque mission s’adosse aux trois autres et à nos {productsWord} produits propriétaires. C’est ce qui rend la transformation IA exécutable, pas juste prévue.',
};

export const SECTEURS_HUB_FALLBACK: HubHeroContent = {
  eyebrow: 'Hub Secteurs',
  headlineLead: 'Cinq secteurs.',
  headlineHighlight: 'Une exigence commune',
  description:
    'L’IA n’a pas la même tête dans une banque, une coopérative cacao ou un hôpital. On adapte le déploiement à votre cadre réglementaire, à vos régulateurs, à vos systèmes existants, jamais l’inverse.',
};

export interface AuditIaProcessStep {
  step: string;
  title: string;
  body: string;
}

/** Contenu éditable de la page /audit-ia (hero + section process). */
export interface AuditIaProcessContent {
  heroEyebrow: string;
  headlineLead: string;
  headlineHighlight: string;
  lead: string;
  processEyebrow: string;
  processHeadline: string;
  steps: readonly AuditIaProcessStep[];
}

export const AUDIT_IA_PROCESS_FALLBACK: AuditIaProcessContent = {
  heroEyebrow: 'Audit IA gratuit',
  headlineLead: 'Cinq questions pour savoir si l’IA',
  headlineHighlight: 'vous fera gagner du temps',
  lead: 'Pas un appel commercial déguisé. Un cadrage opérationnel qui commence par un questionnaire interactif, débouche sur une recommandation contextuelle, et finit avec un consultant senior qui connaît déjà votre contexte.',
  processEyebrow: 'Comment ça se passe',
  processHeadline: 'Trois étapes. Aucune surprise.',
  steps: [
    {
      step: '01',
      title: 'Questionnaire · 3 min',
      body: 'Cinq questions séquentielles pour qualifier votre maturité IA, votre secteur, votre périmètre et votre urgence.',
    },
    {
      step: '02',
      title: 'Recommandation instantanée',
      body: 'Un format d’audit adapté (atelier, audit éclair, cadrage stratégique, programme) avec durée et livrable annoncés.',
    },
    {
      step: '03',
      title: 'Consultant senior · 48 h',
      body: 'Un consultant senior reprend contact sous 48 h ouvrées avec votre contexte déjà compris, pas de questions répétées.',
    },
  ],
};

export interface InsightsHubContent {
  eyebrow: string;
  headlineLead: string;
  headlineHighlight: string;
  intro: string;
  emptyState: {
    heading: string;
    text: string;
    ctaLabel: string;
    ctaHref: string;
  };
}

export const HERO_FALLBACK: HeroContent = {
  eyebrow: 'L’écosystème OpenLab',
  headlineLead: 'L’IA, au service',
  headlineHighlight: 'des réalités africaines.',
  subtitle:
    'Cabinet ivoirien d’IA appliquée, R&D produit et publication de référence pour l’Afrique francophone. Conseil, intégration, {productsWord} logiciels propriétaires et un livre de référence, sous le même toit.',
  primaryCta: { label: 'Demander un audit IA gratuit', href: '/audit-ia' },
  secondaryCta: {
    label: 'Découvrir l’écosystème produits',
    href: '/solutions',
  },
  scrollCueLabel: 'Faites défiler pour explorer',
};

export const MANIFESTO_FALLBACK: ManifestoContent = {
  eyebrow: 'Manifeste',
  headline: 'Cette fois,',
  headlineHighlight: 'l’Afrique n’a plus d’excuse.',
  intro:
    'Pendant trente ans, on nous a expliqué que la technologie viendrait d’ailleurs. Que la recherche se ferait ailleurs. Que la décision se prendrait ailleurs. Nous arrivons avec {productsWord} produits, un livre blanc « IA souveraine », et un cluster Kubernetes souverain.',
  stances: [
    {
      excuse: '« On n’a pas les outils. »',
      fact: '{ProductsWord} logiciels propriétaires produits à Abidjan. SYSCOHADA, CNPS, Mobile Money, natifs.',
    },
    {
      excuse: '« On n’a pas la recherche. »',
      fact: 'Un livre blanc « IA souveraine », ouvrage de référence à paraître, capstone terrain ivoirien.',
    },
    {
      excuse: '« On n’a pas la souveraineté. »',
      fact: 'Cluster souverain sous notre seul contrôle opérationnel, audit total, code et données maîtrisés.',
    },
  ],
  conclusion:
    'Ce n’est pas un manifeste pour 2035. C’est un état des lieux pour aujourd’hui.',
  signature: {
    name: 'Debora Ahouma',
    role: 'Fondatrice & CEO · OpenLab Consulting',
    locationDate: 'Abidjan · Mai 2026',
  },
};

export const METHODOLOGIE_FALLBACK: MethodologieContent = {
  eyebrow: 'Notre méthode',
  titleLead: 'L’IA ne s’installe pas.',
  titleHighlight: 'Elle s’adopte.',
  intro:
    'OpenLab accompagne les entreprises ivoiriennes et africaines à transformer l’IA en avantage compétitif réel. Trois étapes, dans l’ordre, pas un gadget, une adoption qui produit.',
  axes: [
    {
      index: '01',
      title: 'Audit de maturité digitale',
      punchline: 'Où en êtes-vous vraiment ?',
      body: 'Nous mesurons vos données, vos processus, vos compétences et votre infrastructure. On ne déploie pas l’IA sur des fondations qu’on n’a pas évaluées.',
    },
    {
      index: '02',
      title: 'Choix des données & des secteurs',
      punchline: 'Quoi confier à l’IA, et quoi garder humain.',
      body: 'Nous identifions les données et les processus à fort levier, leur qualité et leur sensibilité. La bonne IA, au bon endroit, sous gouvernance.',
    },
    {
      index: '03',
      title: 'Stratégie d’adoption effective',
      punchline: 'Une feuille de route qui se déploie.',
      body: 'Priorisation par ROI, conduite du changement, jalons concrets. Pas un POC qui dort : une adoption qui change les résultats.',
    },
  ],
  cta: { label: 'Demander un audit IA', href: '/audit-ia' },
};

export const AUDIT_IA_CTA_FALLBACK: AuditIaCtaContent = {
  eyebrow: 'Audit IA gratuit',
  headlineLead: 'Trente minutes pour savoir si l’IA',
  headlineHighlight: 'vous fera gagner du temps',
  description:
    'Un cadrage gratuit, mené par un consultant senior. Vous repartez avec une cartographie de vos cas d’usage IA, une estimation ROI et trois prochaines étapes activables.',
  cta: { label: 'Démarrer mon audit', href: '/audit-ia' },
  reassuranceBullets: [
    'Pas de spam, pas de revente',
    'Restitution sous 5 jours ouvrés',
    'Confidentialité contractuelle',
  ],
  whitepaperCard: {
    badge: 'Livre blanc · 2026',
    title: 'L’IA souveraine en Côte d’Ivoire',
    subtitle: 'Feuille de route pratique pour les dirigeants en 2026',
    description:
      'Quatre piliers, douze décisions clés, six pièges à éviter. Le guide qu’un comité de direction lit en deux heures et applique en six mois.',
    ctaLabel: 'Télécharger le livre blanc',
    ctaHref: '/livres-blancs/ia-souveraine-ci-2026',
    footnote: 'Accès gratuit · PDF · ~25 pages · email pro requis.',
    cover: {
      src: '/livres-blancs/ia-souveraine-couverture.png',
      width: 1023,
      height: 1537,
    },
  },
};

export const REASSURANCE_FALLBACK: ReassuranceContent = {
  eyebrow: 'Ils nous accompagnent depuis le terrain',
  // Logos clients réels self-hostés dans /public/logos. Sert de défaut
  // tant que le global Payload `reassurance-settings` n'est pas rempli.
  partners: [
    { name: 'DOCI', src: '/logos/doci.png', width: 267, height: 189 },
    { name: 'Sertemef', src: '/logos/sertemef.png', width: 602, height: 203 },
    { name: 'SPITEC', src: '/logos/spitec.png', width: 413, height: 122 },
  ],
};

export const FOOTER_FALLBACK: FooterContent = {
  tagline:
    'Cabinet ivoirien d’IA appliquée, R&D produit et publication de référence pour l’Afrique francophone.',
  columns: [
    {
      title: 'Expertises',
      links: [
        {
          label: 'Conseil & stratégie IA',
          href: '/expertises/conseil-strategie',
        },
        {
          label: 'Agents & automatisation',
          href: '/expertises/agents-automatisation',
        },
        { label: 'Data & gouvernance', href: '/expertises/data-gouvernance' },
        { label: 'Cybersécurité IA', href: '/expertises/cybersecurite-ia' },
      ],
    },
    {
      title: 'Solutions',
      links: [
        { label: 'NexusRH CI', href: '/solutions/nexusrh' },
        { label: 'NexusERP', href: '/solutions/nexuserp' },
        { label: 'SYGESCOM', href: '/solutions/sygescom' },
        { label: 'AgroSense CI', href: '/solutions/agrosense' },
        { label: 'QualitOS', href: '/solutions/qualitos' },
        { label: 'Fraud Shield', href: '/solutions/fraud-shield' },
        { label: 'Smart City', href: '/solutions/smart-city' },
      ],
    },
    {
      title: 'Ressources',
      links: [
        { label: 'Livre IA', href: '/livre' },
        { label: 'Insights', href: '/insights' },
        { label: 'Publications', href: '/laboratoire/publications' },
        { label: 'Audit IA gratuit', href: '/audit-ia' },
      ],
    },
    {
      title: 'OpenLab',
      links: [
        { label: 'À propos', href: '/a-propos' },
        { label: 'Équipe', href: '/a-propos/equipe' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ],
  socialLinks: [
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/openlab-consulting',
    },
  ],
  copyright:
    'OpenLab Consulting SARL, RCCM CI-ABJ-03-2022-B13-03239. Tous droits réservés.',
};

export interface AboutPillar {
  title: string;
  body: string;
}

/** Contenu éditable de la page /a-propos (hero + trois piliers). */
export interface AboutContent {
  eyebrow: string;
  headlineLead: string;
  headlineHighlight: string;
  intro: string;
  pillarsEyebrow: string;
  pillarsHeadline: string;
  pillars: readonly AboutPillar[];
}

export const ABOUT_FALLBACK: AboutContent = {
  eyebrow: 'À propos',
  headlineLead: 'Cabinet ivoirien d’IA appliquée.',
  headlineHighlight: 'Pour l’Afrique francophone',
  intro:
    'OpenLab Consulting a été fondé pour résoudre une équation simple : comment déployer de l’IA réellement utile dans un contexte africain francophone, sans renoncer à la rigueur scientifique ni à la souveraineté des données.',
  pillarsEyebrow: 'Trois piliers',
  pillarsHeadline:
    'Conseil, produits, édition. Aucun concurrent ne couvre les trois.',
  pillars: [
    {
      title: 'Conseil & Intégration IA',
      body: 'Diagnostic, cadrage, déploiement et gouvernance IA pour PME, grandes entreprises, institutions publiques en Afrique de l’Ouest et France.',
    },
    {
      title: 'R&D Produits',
      body: '{ProductsWord} logiciels propriétaires conçus et opérés à Abidjan, déployés sur K3s. NexusRH, NexusERP, SYGESCOM, AgroSense, QualitOS, Fraud Shield, Smart City, SentinelBTP.',
    },
    {
      title: 'Édition académique',
      body: 'Livre IA de référence, livres blancs trimestriels, conférences universitaires. La science qui se publie est la science qui se vérifie.',
    },
  ],
};

export const INSIGHTS_HUB_FALLBACK: InsightsHubContent = {
  eyebrow: 'Hub Insights',
  headlineLead: 'Notre lecture du',
  headlineHighlight: 'terrain africain',
  intro:
    'Pas des billets d’opinion : des retours de déploiements réels, sourcés, opérables dès lundi. Deux articles longs par semaine (objectif éditorial 2026), un livre blanc par trimestre.',
  emptyState: {
    heading: 'Plus d’articles arrivent.',
    text: 'Les nouveaux insights sont publiés directement depuis l’admin Payload. Reviens régulièrement, ou abonne-toi au flux RSS via la racine du site.',
    ctaLabel: 'En attendant, demande ton audit IA',
    ctaHref: '/audit-ia',
  },
};

// ────────────────────────────────────────────────────────────
// Bandeau d'annonce (flash info) — global AnnouncementBanner
// ────────────────────────────────────────────────────────────

export interface AnnouncementBannerContent {
  /** Affiche le bandeau sur tout le site quand true. */
  enabled: boolean;
  /** Message court et percutant (capter en 5 s). */
  message: string;
  /** Libellé du lien (vide = pas de lien). */
  linkLabel: string;
  /** Cible du lien : chemin interne `/...` ou URL https. */
  linkHref: string;
}

/**
 * Fallback du bandeau : pré-rempli avec le flash OpenCacao mais
 * `enabled: false` → rien ne s'affiche tant qu'on n'active pas (admin,
 * ou en basculant ce défaut). Permet de publier l'annonce en un geste.
 */
export const ANNOUNCEMENT_BANNER_FALLBACK: AnnouncementBannerContent = {
  enabled: false,
  message:
    '⚡ Flash info, OpenCacao : l’IA souveraine du cacao, conçue et hébergée en Côte d’Ivoire, est en ligne.',
  linkLabel: 'Découvrir',
  linkHref: '/insights/opencacao-ia-souveraine-cacao-cote-divoire',
};
