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

export const HERO_FALLBACK: HeroContent = {
  eyebrow: 'L’écosystème OpenLab',
  headlineLead: 'L’IA, au service',
  headlineHighlight: 'des réalités africaines.',
  subtitle:
    'Cabinet ivoirien d’IA appliquée, R&D produit et publication de référence pour l’Afrique francophone. Conseil, intégration, sept logiciels propriétaires et un livre de référence — sous le même toit.',
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
    'Pendant trente ans, on nous a expliqué que la technologie viendrait d’ailleurs. Que la recherche se ferait ailleurs. Que la décision se prendrait ailleurs. Nous arrivons avec sept produits, un livre blanc préfacé par un ministre, et un cluster Kubernetes souverain.',
  stances: [
    {
      excuse: '« On n’a pas les outils. »',
      fact: 'Sept logiciels propriétaires produits à Abidjan. SYSCOHADA, CNPS, Mobile Money — natifs.',
    },
    {
      excuse: '« On n’a pas la recherche. »',
      fact: 'Un livre blanc « IA souveraine » préfacé par le ministre de la Transformation numérique. Un ouvrage de référence à paraître, capstone terrain ivoirien.',
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
    'OpenLab accompagne les entreprises ivoiriennes et africaines à transformer l’IA en avantage compétitif réel. Trois étapes, dans l’ordre — pas un gadget, une adoption qui produit.',
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
      punchline: 'Quoi confier à l’IA — et quoi garder humain.',
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
      src: '/livres-blancs/ia-souveraine-couverture.webp',
      width: 1024,
      height: 1536,
    },
  },
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
    'OpenLab Consulting SARL — RCCM CI-ABJ-03-2022-B13-03239. Tous droits réservés.',
};
