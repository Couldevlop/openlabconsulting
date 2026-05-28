/**
 * Configuration de la navigation principale (mega-menu navbar §7 #9
 * de l'audit P2 SEO/UX).
 *
 * Référence audit `docs/audit-seo-ux-2026-05.md` §5 « Navigation » :
 * « 6 liens flat, vs Anthropic (Research/Commitments/Learn déroulants),
 * Palantir (Platforms/Industries/Customers déroulant). Pour 40 pages,
 * c'est sous-dimensionné. »
 *
 * Architecture : 4 méga-menus déroulants (Expertises, Solutions, Livre,
 * Laboratoire) + 2 liens simples (Insights, À propos). Chaque méga-menu
 * référence sa donnée canonique pour éviter la duplication.
 */

import { PRODUCTS } from '@/lib/data/products';
import { EXPERTISES } from '@/lib/data/expertises';
import { CHAPTERS } from '@/lib/data/book';

export interface NavLink {
  href: string;
  label: string;
  /** Court résumé affiché sous le label dans le mega-menu. */
  description?: string;
}

export interface MegaMenuSection {
  /** Eyebrow orange affiché en tête de colonne. */
  eyebrow?: string;
  links: readonly NavLink[];
}

export interface MegaMenuConfig {
  /** Label du bouton dans la navbar. */
  label: string;
  /** Lien « Vue d'ensemble » placé en tête du menu. */
  overview: NavLink;
  /** Colonnes du menu (1-3). */
  sections: readonly MegaMenuSection[];
  /** Texte du CTA final, optionnel. */
  cta?: NavLink;
}

export interface SimpleNavItem {
  kind: 'link';
  href: string;
  label: string;
}

export interface MegaNavItem {
  kind: 'mega';
  config: MegaMenuConfig;
}

export type NavItem = SimpleNavItem | MegaNavItem;

// ────────────────────────────────────────────────────────────
// Configurations des 4 méga-menus
// ────────────────────────────────────────────────────────────

const EXPERTISES_MENU: MegaMenuConfig = {
  label: 'Expertises',
  overview: {
    href: '/expertises',
    label: 'Vue d’ensemble',
    description: 'Quatre piliers pour cadrer, intégrer et gouverner l’IA.',
  },
  sections: [
    {
      eyebrow: 'Quatre piliers',
      links: EXPERTISES.map((e) => ({
        href: `/expertises/${e.slug}`,
        label: e.title,
      })),
    },
  ],
  cta: {
    href: '/audit-ia',
    label: 'Demander un audit IA gratuit →',
  },
};

const SOLUTIONS_MENU: MegaMenuConfig = {
  label: 'Solutions',
  overview: {
    href: '/solutions',
    label: 'Vue d’ensemble',
    description: 'Sept logiciels propriétaires, un seul laboratoire.',
  },
  sections: [
    {
      eyebrow: 'En production',
      links: PRODUCTS.filter((p) => p.status === 'production').map((p) => ({
        href: `/solutions/${p.slug}`,
        label: p.name,
        description: p.tagline,
      })),
    },
    {
      eyebrow: 'En développement',
      links: PRODUCTS.filter((p) => p.status !== 'production').map((p) => ({
        href: `/solutions/${p.slug}`,
        label: p.name,
        description: p.tagline,
      })),
    },
  ],
};

const LIVRE_MENU: MegaMenuConfig = {
  label: 'Livre IA',
  overview: {
    href: '/livre',
    label: 'Vue d’ensemble',
    description:
      'Intégration de l’Intelligence Artificielle dans le développement logiciel.',
  },
  sections: [
    {
      eyebrow: 'Lecture',
      links: [
        {
          href: '/livre/chapitres',
          label: 'Chapitres',
          description: `${CHAPTERS.length} chapitres, structure complète.`,
        },
        {
          href: '/livre/extraits',
          label: 'Extraits gratuits',
          description: 'Préface + chapitre offerts en PDF.',
        },
      ],
    },
    {
      eyebrow: 'Aller plus loin',
      links: [
        {
          href: '/livre/acheter',
          label: 'Acheter le livre',
          description: 'Amazon, Lulu, librairies CI, PDF direct.',
        },
        {
          href: '/livre/companion',
          label: 'Companion lecteurs',
          description: 'Code source, datasets, errata.',
        },
      ],
    },
  ],
};

const LABORATOIRE_MENU: MegaMenuConfig = {
  label: 'Laboratoire',
  overview: {
    href: '/laboratoire',
    label: 'Vue d’ensemble',
    description: 'Un cabinet qui code, qui édite, qui publie.',
  },
  sections: [
    {
      eyebrow: 'R&D OpenLab',
      links: [
        {
          href: '/laboratoire/axes',
          label: 'Axes de recherche',
          description: 'Six chantiers techniques en cours.',
        },
        {
          href: '/laboratoire/publications',
          label: 'Publications',
          description: 'Livre, livres blancs, conférences.',
        },
        {
          href: '/laboratoire/partenariats',
          label: 'Partenariats',
          description: 'Universités, instituts publics, presse.',
        },
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────
// Ordre final dans la navbar
// ────────────────────────────────────────────────────────────

export const NAV_ITEMS: readonly NavItem[] = [
  { kind: 'mega', config: EXPERTISES_MENU },
  { kind: 'mega', config: SOLUTIONS_MENU },
  { kind: 'mega', config: LABORATOIRE_MENU },
  { kind: 'mega', config: LIVRE_MENU },
  { kind: 'link', href: '/insights', label: 'Insights' },
  { kind: 'link', href: '/a-propos', label: 'À propos' },
];
