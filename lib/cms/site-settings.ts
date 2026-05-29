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
    'OpenLab Consulting SARL — RCCM CI-ABJ-03-2022-B13-03239. Tous droits réservés.',
};
