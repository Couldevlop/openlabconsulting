import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical';

/**
 * Type du corps d'article (état Lexical sérialisé, nœuds par défaut).
 * On le source depuis @payloadcms/richtext-lexical plutôt que `lexical`
 * (non hoisté par pnpm) ; import `type`-only donc effacé à la compilation.
 */
export type ArticleContent = DefaultTypedEditorState;

/**
 * Articles (Insights) — homepage §6.9 + page /insights.
 *
 * Source de vérité : la collection Payload `articles`. Quand la DB
 * est indisponible (build statique, dev sans docker) ou la collection
 * vide, on retombe sur 3 articles fondateurs hard-codés ci-dessous.
 *
 * Ce fichier est **client-safe** : aucun import *runtime* Payload (le
 * seul import est `type`-only, donc effacé à la compilation). Le fetch
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

export interface ArticleSource {
  label: string;
  url: string;
}

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
  /** Résumé en 2-4 points clés (tête d’article + GEO §12.4). */
  summary: readonly string[];
  /** Références sourçant les chiffres (§17.9). */
  sources: readonly ArticleSource[];
  /** Temps de lecture estimé en minutes (0 si inconnu). */
  readingTime: number;
  /**
   * Corps de l’article au format Lexical sérialisé. `null` quand on sert
   * le fallback (DB indisponible) — la page affiche alors l’accroche seule.
   */
  content: ArticleContent | null;
}

/** Vitesse de lecture moyenne (mots/minute) pour l’estimation. */
const WORDS_PER_MINUTE = 200;

/**
 * Estime un temps de lecture en minutes à partir d’un texte brut.
 * Pur et client-safe : l’extraction du texte depuis le Lexical se fait
 * côté serveur (cf. lib/articles-server.ts).
 */
export function estimateReadingTime(plainText: string): number {
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Concatène récursivement le texte d'un nœud Lexical (titres, paragraphes). */
export function lexicalNodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as { text?: unknown; children?: unknown };
  if (typeof n.text === 'string') return n.text;
  if (Array.isArray(n.children))
    return n.children.map(lexicalNodeText).join('');
  return '';
}

/**
 * Slug d'ancre pour un titre — minuscules, sans accents, tirets.
 * Doit rester déterministe : le sommaire (page) et les ancres (corps)
 * partagent cette fonction pour que les liens #ancre correspondent.
 */
export function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Extrait les titres H2/H3 du corps Lexical pour bâtir un sommaire (TOC).
 * Pur et client-safe ; retourne [] si le contenu est absent ou plat.
 */
export function extractHeadings(
  content: ArticleContent | null,
): ArticleHeading[] {
  const root =
    content && typeof content === 'object'
      ? (content as { root?: { children?: unknown } }).root
      : undefined;
  const children = root && Array.isArray(root.children) ? root.children : [];
  const out: ArticleHeading[] = [];
  for (const node of children) {
    if (!node || typeof node !== 'object') continue;
    const { type, tag } = node as { type?: unknown; tag?: unknown };
    if (type === 'heading' && (tag === 'h2' || tag === 'h3')) {
      const text = lexicalNodeText(node).trim();
      if (text) {
        out.push({
          id: slugifyHeading(text),
          text,
          level: tag === 'h2' ? 2 : 3,
        });
      }
    }
  }
  return out;
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
      'Pourquoi un cluster K3s Hetzner change la donne pour les institutions ouest-africaines, leçons tirées du déploiement NexusRH.',
    category: 'souverainete',
    categoryLabel: 'Souveraineté',
    author: 'Debora Ahouma',
    publishedAt: 'Mai 2026',
    isoDate: '2026-05-01',
    cover: {
      src: null,
      alt: 'Schéma d’architecture K3s Hetzner pour la souveraineté IA',
    },
    summary: [
      'L’IA générative pourrait créer 61 à 103 milliards $ de valeur annuelle en Afrique (McKinsey, 2025).',
      'Héberger ses données et modèles dans un cluster maîtrisé, c’est garder la conformité et la valeur sur le continent.',
      'Le retour d’expérience NexusRH montre qu’un socle K3s souverain se déploie en moins de dix minutes.',
    ],
    sources: [],
    readingTime: 8,
    content: null,
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
    summary: [
      'Depuis janvier 2024, la retraite CNPS est à 14 % (7,7 % employeur, 6,3 % salarié), plafond 3 375 000 FCFA/mois.',
      'Prestations familiales 5,75 % et accidents du travail 2 à 5 % restent à la charge de l’employeur.',
      'Un SIRH qui applique ces barèmes automatiquement transforme l’audit annuel en simple formalité.',
    ],
    sources: [],
    readingTime: 7,
    content: null,
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
    summary: [
      'En 2024, la PLCC ivoirienne a traité 12 100 affaires de cybercriminalité pour près de 7 milliards FCFA de préjudice.',
      'Les crédits accordés sur faux documents coûtent plus de 150 millions $/an à l’Afrique de l’Ouest (Banque mondiale).',
      'L’IA isole en moins de deux secondes des incohérences invisibles à l’œil d’un contrôleur.',
    ],
    sources: [],
    readingTime: 9,
    content: null,
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
