/**
 * Livre principal — CLAUDE.md §1.4 + §8.
 *
 * Source unique de vérité pour le livre IA. Consommé par :
 *   - components/sections/Livre.tsx (homepage §6.8)
 *   - app/livre/page.tsx (landing)
 *   - app/livre/chapitres/page.tsx
 *   - app/livre/extraits/page.tsx
 *   - app/livre/acheter/page.tsx
 *   - app/livre/companion/page.tsx
 *
 * RÈGLE : ne JAMAIS mentionner Expertise IA / Grasse / co-édition
 * (voir memory project_openlabconsulting_no_expertise_ia). Le livre
 * est édité par OpenLab Consulting seule.
 */

export interface Chapter {
  /** Numéro affiché (01, 02, ...). */
  index: string;
  title: string;
  /** Durée estimée de lecture (ex : "35 min"). */
  readingTime: string;
  /** Description courte 1-2 phrases. */
  summary: string;
  /** Mots-clés affichés en chips. */
  keywords: readonly string[];
  /** Inclut des exemples de code Python / TypeScript. */
  hasCode: boolean;
  /** Inclut une étude de cas terrain. */
  hasCaseStudy: boolean;
}

export interface PurchaseChannel {
  name: string;
  description: string;
  href: string;
  /** Marqueur visuel : channel direct vs marketplace. */
  primary: boolean;
}

export interface CompanionResource {
  category: 'code' | 'data' | 'errata' | 'community';
  title: string;
  description: string;
  href: string;
}

export interface BookAudience {
  label: string;
  description: string;
}

export const BOOK = {
  title: 'Intelligence Artificielle',
  subtitle: 'Du Machine Learning aux Agents Autonomes',
  edition: 'Édition OpenLab Consulting · Abidjan',
  isbn: '978-2-XXXX-XXXX-X', // ISBN définitif à renseigner par l'admin Payload P6
  pageCount: 420, // estimatif, à confirmer par l'éditeur
  language: 'fr-CI',
  publicationYear: 2026,
  capstone: 'AgroSense CI',
  longPitch: [
    'Un parcours rigoureux du machine learning supervisé aux agents multi-acteurs, en passant par les séries temporelles climatiques, le RAG souverain, MLOps et la sécurité IA.',
    "Un capstone terrain ivoirien — AgroSense CI — qui démontre comment l'IA se déploie concrètement sur des coopératives cacao, anacarde, coton et hévéa.",
    "Un manuel praticien : chaque chapitre majeur s'accompagne d'extraits de code Python ou TypeScript, et d'une mise en situation tirée d'un déploiement réel.",
  ],
  audiences: [
    {
      label: 'Étudiants ingénieurs',
      description:
        'Du M1 à la thèse — bases ML, MLOps, sécurité IA. Lectures dirigées et exercices fournis.',
    },
    {
      label: 'Data scientists confirmés',
      description:
        'Plongée dans les agents multi-acteurs, RAG souverain, séries temporelles climatiques.',
    },
    {
      label: 'Dirigeants',
      description:
        'Lecture sélective des chapitres stratégiques : gouvernance, ROI, conformité.',
    },
    {
      label: 'Enseignants',
      description:
        'Référentiel utilisable en cours M2 / DUT, avec exercices et études de cas terrain.',
    },
  ] as readonly BookAudience[],
  cover: {
    src: null as string | null, // Payload P6 fournira l'URL MinIO finale
    alt: 'Couverture du livre Intelligence Artificielle — du Machine Learning aux Agents Autonomes, édition OpenLab Consulting',
  },
} as const;

export const CHAPTERS: readonly Chapter[] = [
  {
    index: '01',
    title: 'Cadre, vocabulaire, et pourquoi maintenant',
    readingTime: '25 min',
    summary:
      'Une mise au point sur ce que l’IA fait et ne fait pas en 2026. Le bon vocabulaire pour éviter les contre-sens stratégiques.',
    keywords: ['stratégie', 'vocabulaire', 'épistémologie'],
    hasCode: false,
    hasCaseStudy: false,
  },
  {
    index: '02',
    title: 'Machine learning supervisé : la mécanique de base',
    readingTime: '45 min',
    summary:
      'Régression, classification, validation, biais — les fondations indispensables avant tout le reste.',
    keywords: ['ML supervisé', 'scikit-learn', 'validation'],
    hasCode: true,
    hasCaseStudy: false,
  },
  {
    index: '03',
    title: 'Apprentissage non supervisé et auto-supervisé',
    readingTime: '40 min',
    summary:
      'Clustering, réduction de dimension, embeddings. Comment apprendre sans étiquettes — et quand cela rend.',
    keywords: ['clustering', 'embeddings', 'PCA', 'UMAP'],
    hasCode: true,
    hasCaseStudy: false,
  },
  {
    index: '04',
    title: 'Séries temporelles climatiques et financières',
    readingTime: '50 min',
    summary:
      'ARIMA, Prophet, modèles state-space, deep learning temporel — appliqués à SODEXAM, CHIRPS, ERA5.',
    keywords: ['séries temporelles', 'climat', 'CHIRPS'],
    hasCode: true,
    hasCaseStudy: true,
  },
  {
    index: '05',
    title: 'Large Language Models : comprendre avant d’utiliser',
    readingTime: '55 min',
    summary:
      'Architecture transformer, fine-tuning, prompting, hallucination. Démythifier sans simplifier.',
    keywords: ['LLM', 'transformers', 'prompting'],
    hasCode: true,
    hasCaseStudy: false,
  },
  {
    index: '06',
    title: 'RAG souverain : retrieval augmenté en milieu fermé',
    readingTime: '50 min',
    summary:
      'Construire un assistant qui répond à partir de VOS documents, sans fuite, sans dépendance cloud étranger.',
    keywords: ['RAG', 'vector store', 'souveraineté'],
    hasCode: true,
    hasCaseStudy: true,
  },
  {
    index: '07',
    title: 'Agents autonomes et orchestration multi-acteurs',
    readingTime: '60 min',
    summary:
      'Function calling, ReAct, agents en boucle outils, supervision humaine. Le saut entre LLM et agent.',
    keywords: ['agents', 'function calling', 'orchestration'],
    hasCode: true,
    hasCaseStudy: true,
  },
  {
    index: '08',
    title: 'MLOps : déployer, monitorer, gouverner',
    readingTime: '55 min',
    summary:
      'CI/CD modèles, monitoring drift, audit log, K8s. Le passage du notebook au système d’information.',
    keywords: ['MLOps', 'K8s', 'monitoring'],
    hasCode: true,
    hasCaseStudy: true,
  },
  {
    index: '09',
    title: 'Sécurité IA et adversarial robustness',
    readingTime: '45 min',
    summary:
      'Prompt injection, model extraction, data poisoning, watermarking. Ce que vos red teams doivent désormais couvrir.',
    keywords: ['sécurité IA', 'red team', 'prompt injection'],
    hasCode: true,
    hasCaseStudy: false,
  },
  {
    index: '10',
    title: 'Gouvernance, AI Act et souveraineté africaine',
    readingTime: '50 min',
    summary:
      'AI Act européen, loi ivoirienne 2013-450, traité de Malabo. Construire un cadre interne défendable.',
    keywords: ['AI Act', 'gouvernance', 'souveraineté'],
    hasCode: false,
    hasCaseStudy: true,
  },
  {
    index: '11',
    title: 'Capstone — AgroSense CI, du capteur à la décision',
    readingTime: '90 min',
    summary:
      'Étude de cas terrain intégrale : capteurs IoT, séries climatiques, prédiction maladies, interface coopérative.',
    keywords: ['capstone', 'AgroSense', 'IoT'],
    hasCode: true,
    hasCaseStudy: true,
  },
];

export const PURCHASE_CHANNELS: readonly PurchaseChannel[] = [
  {
    name: 'Boutique OpenLab — PDF + ePub',
    description:
      'Téléchargement immédiat après paiement Stripe. Accès illimité aux mises à jour de l’édition courante.',
    href: '/livre/acheter#openlab-direct',
    primary: true,
  },
  {
    name: 'Amazon France & Afrique',
    description:
      'Version imprimée + Kindle. Distribution rapide depuis les entrepôts européens.',
    href: 'https://www.amazon.fr',
    primary: false,
  },
  {
    name: 'Lulu (impression à la demande)',
    description:
      'Pour les commandes hors zones de distribution Amazon. Couverture cartonnée disponible.',
    href: 'https://www.lulu.com',
    primary: false,
  },
  {
    name: 'Librairies de Côte d’Ivoire',
    description:
      'Carrefour Mercure, Librairie de France Yopougon, Librairie Aleph. Stock physique à Abidjan.',
    href: '/livre/acheter#libraires-ci',
    primary: false,
  },
];

export const COMPANION_RESOURCES: readonly CompanionResource[] = [
  {
    category: 'code',
    title: 'Référentiel GitHub des exemples',
    description:
      'Tous les snippets Python, TypeScript et notebooks Jupyter du livre, organisés par chapitre, sous licence MIT.',
    href: 'https://github.com/openlab-consulting/livre-ia-examples',
  },
  {
    category: 'data',
    title: 'Datasets ouverts (CHIRPS, ERA5, SODEXAM)',
    description:
      'Sous-ensemble pré-formaté des séries climatiques utilisées dans les chapitres 4 et 11, prêt à l’emploi.',
    href: '/livre/companion#datasets',
  },
  {
    category: 'errata',
    title: 'Errata et corrections continues',
    description:
      'La liste publique des coquilles et précisions signalées par les lecteurs depuis la sortie. Mise à jour mensuelle.',
    href: '/livre/companion#errata',
  },
  {
    category: 'community',
    title: 'Forum lecteurs (Discourse self-hosted)',
    description:
      'Communauté francophone d’étudiants, dirigeants et enseignants autour du livre. Modération OpenLab.',
    href: 'https://forum.openlabconsulting.com/c/livre-ia',
  },
];
