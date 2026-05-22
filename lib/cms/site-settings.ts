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

export interface ManifestoContent {
  eyebrow: string;
  headline: string;
  stances: readonly string[];
  signature: { name: string; role: string };
}

export interface AuditIaCtaContent {
  eyebrow: string;
  headline: string;
  description: string;
  cta: { label: string; href: string };
  reassuranceBullets: readonly string[];
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
  eyebrow: 'Notre manifeste',
  headline: 'Cette fois, l’Afrique n’a plus d’excuse.',
  stances: [
    'La data est notre pétrole. L’IA est notre raffinerie.',
    'Vos coûts vous étouffent. L’IA peut les diviser.',
    'La fraude est devenue invisible. L’IA la rend indétectable.',
  ],
  signature: { name: 'Debora Ahouma', role: 'CEO, OpenLab Consulting' },
};

export const AUDIT_IA_CTA_FALLBACK: AuditIaCtaContent = {
  eyebrow: 'Audit IA gratuit',
  headline: '90 minutes pour cartographier votre IA.',
  description:
    'Un appel structuré avec nos consultants pour identifier 3 leviers d’automatisation prioritaires dans votre organisation.',
  cta: { label: 'Demander un audit IA gratuit', href: '/audit-ia' },
  reassuranceBullets: [
    '100% gratuit, sans engagement',
    'Restitution sous 5 jours ouvrés',
    'Confidentialité contractuelle',
  ],
};

export const FOOTER_FALLBACK: FooterContent = {
  tagline:
    'Cabinet ivoirien d’IA appliquée, R&D produit et publication de référence.',
  columns: [
    {
      title: 'Cabinet',
      links: [
        { label: 'À propos', href: '/a-propos' },
        { label: 'Équipe', href: '/a-propos/equipe' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Écosystème',
      links: [
        { label: 'Expertises', href: '/expertises' },
        { label: 'Solutions', href: '/solutions' },
        { label: 'Secteurs', href: '/secteurs' },
        { label: 'Laboratoire', href: '/laboratoire' },
      ],
    },
    {
      title: 'Publications',
      links: [
        { label: 'Livre IA', href: '/livre' },
        {
          label: 'Livres blancs',
          href: '/livres-blancs/ia-souveraine-ci-2026',
        },
        { label: 'Insights', href: '/insights' },
      ],
    },
  ],
  socialLinks: [
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/openlab-consulting',
    },
  ],
  copyright: 'OpenLab Consulting · Tous droits réservés.',
};
