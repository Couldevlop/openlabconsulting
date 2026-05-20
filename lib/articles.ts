/**
 * Articles (Insights) — homepage §6.9 + page /insights.
 *
 * Source de vérité : la collection Payload `articles`. Quand la DB
 * est indisponible (build statique, dev sans docker) ou la collection
 * vide, on retombe sur 3 articles fondateurs hard-codés ci-dessous.
 *
 * Ce fichier est **client-safe** : aucun import Payload. Le fetch
 * dynamique vit dans `lib/articles-server.ts` (server-only).
 *
 * 7 catégories alignées sur `collections/Articles.ts`.
 */

export type ArticleCategory =
  | 'souverainete'
  | 'conformite-rh'
  | 'cybersecurite'
  | 'data-gouvernance'
  | 'agents-ia'
  | 'mlops'
  | 'etude-de-cas';

/** Libellés FR pour affichage public. */
export const CATEGORY_LABELS: Readonly<Record<ArticleCategory, string>> = {
  souverainete: 'Souveraineté',
  'conformite-rh': 'Conformité RH',
  cybersecurite: 'Cybersécurité',
  'data-gouvernance': 'Data & gouvernance',
  'agents-ia': 'Agents & IA',
  mlops: 'MLOps',
  'etude-de-cas': 'Étude de cas',
} as const;

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  /** Libellé FR de la catégorie (résolu à la sérialisation). */
  categoryLabel: string;
  author: string;
  /** Date affichée (mois + année FR). */
  publishedAt: string;
  /** ISO YYYY-MM-DD pour <time datetime=...>. */
  isoDate: string;
  cover: { src: string | null; alt: string };
}

/**
 * Fallback hard-codé — 3 articles fondateurs, sujets ancrés sur
 * produits ou thématiques réelles (CLAUDE.md §1).
 */
export const FALLBACK_ARTICLES: readonly Article[] = [
  {
    slug: 'migration-ia-souveraine-k3s-hetzner',
    title: 'Migration vers une IA souveraine en Afrique francophone',
    excerpt:
      'Pourquoi un cluster K3s Hetzner change la donne pour les institutions ouest-africaines — leçons tirées du déploiement NexusRH.',
    category: 'souverainete',
    categoryLabel: 'Souveraineté',
    author: 'Debora Ahouma',
    publishedAt: 'Mai 2026',
    isoDate: '2026-05-01',
    cover: {
      src: null,
      alt: 'Schéma d’architecture K3s Hetzner pour la souveraineté IA',
    },
  },
  {
    slug: 'cnps-its-fdfp-conformite-sirh-ivoirien',
    title: 'CNPS, ITS, FDFP : ce que la conformité paie attend de votre SIRH',
    excerpt:
      'Le diable est dans le détail des cotisations sociales. Comment un SIRH bien conçu transforme l’audit annuel en formalité.',
    category: 'conformite-rh',
    categoryLabel: 'Conformité RH',
    author: 'Équipe NexusRH',
    publishedAt: 'Avril 2026',
    isoDate: '2026-04-15',
    cover: {
      src: null,
      alt: 'Capture du module de paie NexusRH conforme CNPS',
    },
  },
  {
    slug: 'fraude-documentaire-ia-banques-assurances',
    title:
      'Détection de fraude documentaire : ce que l’IA voit que vos contrôleurs manquent',
    excerpt:
      'Trois patterns invisibles à l’œil humain que Fraud Shield isole en moins de deux secondes, et comment l’expliquer à un comité d’audit.',
    category: 'cybersecurite',
    categoryLabel: 'Cybersécurité',
    author: 'Équipe Fraud Shield',
    publishedAt: 'Mars 2026',
    isoDate: '2026-03-20',
    cover: {
      src: null,
      alt: 'Visualisation Fraud Shield : marqueurs de fraude détectés sur un document',
    },
  },
] as const;

/** Mois FR utilisés pour formater une date ISO. */
const MONTHS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
] as const;

/** Formate une date ISO en « Mois YYYY » FR. */
export function formatArticleDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}
