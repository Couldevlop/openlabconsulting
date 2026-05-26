/**
 * Équipe OpenLab — données statiques typées.
 *
 * Clean architecture : la page `app/(site)/a-propos/equipe/page.tsx`
 * et le helper `personSchema` (lib/seo/schema.ts) lisent ces données
 * — aucune logique métier n'est dupliquée côté UI.
 *
 * Pour ajouter un membre, étendre `TEAM_MEMBERS`. La page `/a-propos/equipe`
 * actuellement n'affiche que `DEBORA` (CEO) mais le pattern est prêt.
 */

export interface TeamMember {
  /** Slug stable utilisé pour anchors et schema @id. */
  readonly id: string;
  readonly name: string;
  readonly jobTitle: string;
  /** Court — paragraphe d'intro. */
  readonly shortBio: string;
  /** Paragraphes détaillés affichés sur la page équipe. */
  readonly bio: readonly string[];
  /** Path image portrait (peut ne pas exister encore — fallback placeholder). */
  readonly imagePath: string;
  /** Citation signature affichée en italique. */
  readonly quote: string;
  /** Domaines d'expertise — alimente `knowsAbout` dans Person schema. */
  readonly focusAreas: readonly string[];
  /** Profils externes — alimente `sameAs` dans Person schema. */
  readonly sameAs: readonly string[];
}

export interface TeamPublication {
  readonly type: 'Livre' | 'Livre blanc' | 'Conférence' | 'Article pair-évalué';
  readonly title: string;
  readonly year: number;
  readonly description: string;
  /** Lien interne (canonique) — pas d'URL externe ici. */
  readonly href: string;
}

export const DEBORA: TeamMember = {
  id: 'debora-ahouma',
  name: 'Debora Ahouma',
  jobTitle: 'CEO & Fondatrice, OpenLab Consulting',
  shortBio:
    'Fondatrice d’OpenLab Consulting (Abidjan), auteure du livre « Intelligence Artificielle : du Machine Learning aux Agents Autonomes » (édition OpenLab 2026).',
  bio: [
    'Debora Ahouma fonde OpenLab Consulting en 2022 à Abidjan pour répondre à une équation simple : comment rendre l’intelligence artificielle réellement utile dans un contexte africain francophone, sans renoncer à la rigueur scientifique ni à la souveraineté des données.',
    'Elle pilote depuis la stratégie produit du cabinet — aujourd’hui sept logiciels propriétaires (NexusRH CI, NexusERP, SYGESCOM, AgroSense CI, QualitOS, Fraud Shield, Smart City) déployés sur K3s — la R&D (recherche appliquée, partenariats universitaires) et l’édition (livre IA de référence, livres blancs trimestriels).',
    'Elle est l’auteure de « Intelligence Artificielle : du Machine Learning aux Agents Autonomes » (édition OpenLab, 2026), ouvrage de référence en français pour étudiants ingénieurs, data scientists et dirigeants.',
  ],
  imagePath: '/team/debora-ahouma.jpg',
  quote:
    'Notre métier consiste à transformer l’IA d’une promesse d’importation en une réalité africaine — déployée, comprise, souveraine, et utile à ceux qui en ont le plus besoin.',
  focusAreas: [
    'Intelligence artificielle appliquée',
    'Agents autonomes & RAG souverain',
    'MLOps sur K3s',
    'Cybersécurité IA',
    'Gouvernance data Afrique de l’Ouest',
    'Conformité CNPS / SYSCOHADA',
    'Édition académique francophone',
  ],
  sameAs: ['https://www.linkedin.com/company/openlab-consulting'],
};

export const SIGNATURE_PUBLICATIONS: readonly TeamPublication[] = [
  {
    type: 'Livre',
    title:
      'Intelligence Artificielle : du Machine Learning aux Agents Autonomes',
    year: 2026,
    description:
      'Onze chapitres, capstone AgroSense CI, à destination des étudiants ingénieurs, data scientists, dirigeants et enseignants.',
    href: '/livre',
  },
  {
    type: 'Livre blanc',
    title: 'L’IA souveraine en Côte d’Ivoire 2026',
    year: 2026,
    description:
      'État des lieux et recommandations pour les institutions et entreprises ivoiriennes confrontées au choix cloud public vs souveraineté locale.',
    href: '/livres-blancs/ia-souveraine-ci-2026',
  },
  {
    type: 'Conférence',
    title: 'IA appliquée en Afrique francophone — réalités et leviers',
    year: 2026,
    description:
      'Intervention auprès d’écoles d’ingénieurs (ESATIC, FHB), partenaires publics et clients privés sur le déploiement K3s souverain.',
    href: '/laboratoire/publications',
  },
];

/** Tous les membres de l'équipe — pour itération future. */
export const TEAM_MEMBERS: readonly TeamMember[] = [DEBORA];
