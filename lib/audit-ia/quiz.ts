/**
 * Configuration du questionnaire interactif /audit-ia — chantier audit
 * P2 §7 item #14.
 *
 * Cinq questions séquentielles qui :
 *   1. qualifient le lead (data scoring claude.ts en aval)
 *   2. génèrent une recommandation contextuelle (atelier court, pilote,
 *      cadrage stratégique, programme long) pour guider l'attente
 *   3. pré-remplissent le formulaire final envoyé à /api/audit-ia
 *      (réutilise auditIaSchema existant pour la validation serveur)
 *
 * Aucune dépendance React ici — testable en isolation.
 */

// Réutilise les valeurs Zod existantes (lib/validation.ts) pour rester
// alignés avec le schéma serveur sans risque de divergence.
export type Maturity =
  | 'decouverte'
  | 'pilote'
  | 'production'
  | 'industrialisation';
export type Headcount = 'lt-50' | '50-200' | '200-1000' | 'gt-1000';

export type Sector =
  | 'banque-assurance'
  | 'secteur-public'
  | 'agro-industrie'
  | 'sante'
  | 'telecoms-energie'
  | 'autre';

export type Scope =
  | 'single-usecase'
  | 'single-dept'
  | 'multi-dept'
  | 'enterprise';

export type Urgency = 'exploration' | '3-months' | '6-months' | 'no-deadline';

export interface QuizAnswers {
  maturity?: Maturity;
  sector?: Sector;
  headcount?: Headcount;
  scope?: Scope;
  urgency?: Urgency;
}

export interface QuizOption<V extends string> {
  readonly value: V;
  readonly label: string;
  readonly hint: string;
}

export interface QuizQuestion<V extends string> {
  readonly id: keyof QuizAnswers;
  readonly question: string;
  readonly eyebrow: string;
  readonly options: readonly QuizOption<V>[];
}

// ────────────────────────────────────────────────────────────
// Définition des 5 questions
// ────────────────────────────────────────────────────────────

export const MATURITY_QUESTION: QuizQuestion<Maturity> = {
  id: 'maturity',
  eyebrow: 'Question 1 sur 5',
  question: 'Où en êtes-vous avec l’IA aujourd’hui ?',
  options: [
    {
      value: 'decouverte',
      label: 'On en parle, on explore',
      hint: 'Veille active, aucun POC concret encore.',
    },
    {
      value: 'pilote',
      label: 'Un pilote en cours',
      hint: 'Un cas d’usage testé, résultats à valider.',
    },
    {
      value: 'production',
      label: 'En production sur un domaine',
      hint: 'Un ou deux usages utilisés au quotidien.',
    },
    {
      value: 'industrialisation',
      label: 'Industrialisation à l’échelle',
      hint: 'Plusieurs cas d’usage déployés, MLOps en place.',
    },
  ],
};

export const SECTOR_QUESTION: QuizQuestion<Sector> = {
  id: 'sector',
  eyebrow: 'Question 2 sur 5',
  question: 'Votre secteur d’activité ?',
  options: [
    {
      value: 'banque-assurance',
      label: 'Banque & assurance',
      hint: 'KYC, fraude, conformité BCEAO, scoring.',
    },
    {
      value: 'secteur-public',
      label: 'Secteur public',
      hint: 'Ministère, administration, collectivité.',
    },
    {
      value: 'agro-industrie',
      label: 'Agro-industrie',
      hint: 'Cacao, anacarde, coton, exportation.',
    },
    {
      value: 'sante',
      label: 'Santé',
      hint: 'Hôpital, clinique, mutuelle, pharma.',
    },
    {
      value: 'telecoms-energie',
      label: 'Télécoms · Énergie',
      hint: 'Opérateurs, distribution, hydrocarbures.',
    },
    {
      value: 'autre',
      label: 'Autre secteur',
      hint: 'Industrie, BTP, retail, services…',
    },
  ],
};

export const HEADCOUNT_QUESTION: QuizQuestion<Headcount> = {
  id: 'headcount',
  eyebrow: 'Question 3 sur 5',
  question: 'Combien êtes-vous dans l’organisation ?',
  options: [
    { value: 'lt-50', label: 'Moins de 50', hint: 'TPE/PME.' },
    { value: '50-200', label: '50 à 200', hint: 'PME en croissance.' },
    {
      value: '200-1000',
      label: '200 à 1 000',
      hint: 'ETI ou grande PME.',
    },
    {
      value: 'gt-1000',
      label: 'Plus de 1 000',
      hint: 'Grande entreprise, groupe, administration.',
    },
  ],
};

export const SCOPE_QUESTION: QuizQuestion<Scope> = {
  id: 'scope',
  eyebrow: 'Question 4 sur 5',
  question: 'Quel est le périmètre que vous voulez auditer ?',
  options: [
    {
      value: 'single-usecase',
      label: 'Un cas d’usage précis',
      hint: 'Ex : automatiser le rapprochement bancaire.',
    },
    {
      value: 'single-dept',
      label: 'Un département',
      hint: 'Ex : tout le service client, ou les RH.',
    },
    {
      value: 'multi-dept',
      label: 'Plusieurs départements',
      hint: 'Cross-fonctionnel sur 2-4 services.',
    },
    {
      value: 'enterprise',
      label: 'Transformation globale',
      hint: 'Vision IA d’entreprise sur 12-36 mois.',
    },
  ],
};

export const URGENCY_QUESTION: QuizQuestion<Urgency> = {
  id: 'urgency',
  eyebrow: 'Question 5 sur 5',
  question: 'Sous quel délai voulez-vous démarrer ?',
  options: [
    {
      value: 'exploration',
      label: 'Phase d’exploration',
      hint: 'Pas de pression, on s’informe.',
    },
    {
      value: '3-months',
      label: 'Dans les 3 prochains mois',
      hint: 'Budget identifié, équipe à mobiliser.',
    },
    {
      value: '6-months',
      label: 'Dans les 6 prochains mois',
      hint: 'Roadmap en cours d’arbitrage.',
    },
    {
      value: 'no-deadline',
      label: 'Pas de calendrier figé',
      hint: 'Ouvert sur le tempo, sujet à prioriser.',
    },
  ],
};

export const QUESTIONS = [
  MATURITY_QUESTION,
  SECTOR_QUESTION,
  HEADCOUNT_QUESTION,
  SCOPE_QUESTION,
  URGENCY_QUESTION,
] as const;

// ────────────────────────────────────────────────────────────
// Moteur de recommandation
// ────────────────────────────────────────────────────────────

export interface Recommendation {
  /** Format suggéré (atelier court, pilote, cadrage, programme). */
  readonly format: 'atelier' | 'audit-eclair' | 'cadrage' | 'programme';
  /** Titre court affiché en gros. */
  readonly title: string;
  /** Sous-titre éditorial. */
  readonly subtitle: string;
  /** 2-3 paragraphes de pitch contextuel. */
  readonly body: readonly string[];
  /** Durée annoncée (« 1 demi-journée », « 5 jours », etc.). */
  readonly duration: string;
  /** Livrable annoncé. */
  readonly deliverable: string;
}

/**
 * Sélectionne la recommandation la plus adaptée aux réponses du quiz.
 * Logique simple à 4 formats canoniques — couvre les cas les plus
 * fréquents sans tomber dans la prolifération de variantes.
 */
export function getRecommendation(answers: QuizAnswers): Recommendation {
  const { maturity, scope, urgency, headcount } = answers;

  // Atelier découverte — entreprises débutantes, pas urgence, périmètre serré
  if (
    maturity === 'decouverte' &&
    (urgency === 'exploration' || urgency === 'no-deadline')
  ) {
    return {
      format: 'atelier',
      title: 'Atelier découverte IA : demi-journée',
      subtitle: 'On démystifie l’IA appliquée à votre métier, sans engagement.',
      body: [
        'Format court mais cadré : 3 heures avec votre comité de direction ou votre équipe technique. On part de votre quotidien, on identifie les frottements où l’IA peut aider, on écarte les fantasmes (« faisons ChatGPT pour tout »).',
        'À l’issue, vous aurez les bonnes questions à poser et 1-3 cas d’usage candidats à explorer plus sérieusement le cas échéant. Aucun livrable PDF, c’est un atelier de conviction, pas un audit.',
      ],
      duration: '1 demi-journée (3 h)',
      deliverable: 'Mémo synthétique 1 page + 3 pistes priorisées',
    };
  }

  // Audit éclair — pilote / production avec besoin court, périmètre limité
  if (
    (maturity === 'pilote' || maturity === 'production') &&
    (scope === 'single-usecase' || scope === 'single-dept') &&
    (urgency === '3-months' || urgency === '6-months')
  ) {
    return {
      format: 'audit-eclair',
      title: 'Audit IA éclair : 5 jours ouvrés',
      subtitle:
        'On regarde votre pilote en cours et on dit ce qui marche, ce qui freine, ce qui doit changer pour passer à l’échelle.',
      body: [
        'Cinq jours ouvrés calendaires. Un consultant senior immersé sur place ou en visio quotidienne. Revue technique du pilote (data, modèle, intégration, monitoring), revue organisationnelle (qui décide, qui maintient, qui mesure).',
        'Le livrable est un rapport PDF de 15-20 pages avec un diagnostic franc, une roadmap 6 mois pour industrialiser, et une estimation budgétaire chiffrée. Adapté pour défendre un budget en interne.',
      ],
      duration: '5 jours ouvrés',
      deliverable: 'Rapport PDF 15-20 pages + estimation budgétaire',
    };
  }

  // Programme stratégique — grande entreprise, transformation globale, sérieux calendrier
  if (
    (headcount === '200-1000' || headcount === 'gt-1000') &&
    (scope === 'multi-dept' || scope === 'enterprise')
  ) {
    return {
      format: 'programme',
      title: 'Programme IA stratégique : 6 à 12 mois',
      subtitle:
        'Vision IA d’entreprise, gouvernance, comité de pilotage, roadmap multi-projets.',
      body: [
        'Engagement long type chief AI officer à temps partagé. OpenLab pilote le programme IA en s’adossant à vos équipes internes : définition de la cible 12-36 mois, sélection des cas d’usage prioritaires, gouvernance data + IA Act + RGPD UE, coordination des équipes techniques.',
        'Le programme inclut un comité de pilotage mensuel avec votre comité de direction, des points d’avancement bimensuels avec les sponsors métier, et des livrables intermédiaires tous les 60 jours. Ouvert à 1-2 prestations sœurs (formations, recrutements).',
      ],
      duration: '6 à 12 mois (engagement)',
      deliverable: 'Roadmap stratégique, gouvernance IA, comité piloté',
    };
  }

  // Cadrage stratégique (cas par défaut) — adapté pour la plupart
  return {
    format: 'cadrage',
    title: 'Cadrage stratégique IA : 3 à 4 semaines',
    subtitle:
      'On comprend votre contexte, on identifie 3-5 cas d’usage à fort ROI, on chiffre, on priorise.',
    body: [
      'Trois à quatre semaines. Démarre par une semaine d’immersion (entretiens, ateliers, lecture des documents existants), suit deux semaines d’analyse (cartographie data, faisabilité technique, estimation impact métier), conclut par une restitution executive.',
      'Le livrable est un PDF de 25-35 pages : 3-5 cas d’usage chiffrés sur la matrice impact × faisabilité, roadmap 6-18 mois, organisation cible, budget indicatif. Format calibré pour aller en comité de direction.',
    ],
    duration: '3 à 4 semaines',
    deliverable: 'Rapport stratégique 25-35 pages + restitution executive',
  };
}

// ────────────────────────────────────────────────────────────
// Pré-remplissage du formulaire de contact
// ────────────────────────────────────────────────────────────

/**
 * Synthétise les réponses en un texte exploitable pour le champ `goal`
 * du formulaire (envoyé à /api/audit-ia). Permet au consultant de
 * préparer l'appel sans avoir à re-poser les mêmes questions.
 */
export function summarizeAnswers(
  answers: QuizAnswers,
  recommendation: Recommendation,
): string {
  const labelFor = <V extends string>(
    question: QuizQuestion<V>,
    value: V | undefined,
  ): string => question.options.find((o) => o.value === value)?.label ?? '?';

  return [
    `Recommandation issue du questionnaire : ${recommendation.title}.`,
    '',
    `- Maturité IA : ${labelFor(MATURITY_QUESTION, answers.maturity)}`,
    `- Secteur : ${labelFor(SECTOR_QUESTION, answers.sector)}`,
    `- Headcount : ${labelFor(HEADCOUNT_QUESTION, answers.headcount)}`,
    `- Périmètre souhaité : ${labelFor(SCOPE_QUESTION, answers.scope)}`,
    `- Délai de démarrage : ${labelFor(URGENCY_QUESTION, answers.urgency)}`,
  ].join('\n');
}
