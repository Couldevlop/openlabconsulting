import {
  HEADCOUNT_QUESTION,
  MATURITY_QUESTION,
  SCOPE_QUESTION,
  SECTOR_QUESTION,
  URGENCY_QUESTION,
  getRecommendation,
} from '@/lib/audit-ia/quiz';
import type {
  AuditReportInput,
  AuditReportSections,
  AuditReportStep,
} from './types';

/**
 * Squelette déterministe du rapport d'audit.
 *
 * Sert de repli quand la génération par le modèle échoue ou dépasse le
 * délai : le consultant a toujours un document à corriger, jamais une
 * page blanche. Fonction pure, aucun accès réseau ni base.
 */

function labelFor<V extends string>(
  question: { options: readonly { value: V; label: string }[] },
  value: V | undefined,
  fallback: string,
): string {
  return question.options.find((o) => o.value === value)?.label ?? fallback;
}

const ROADMAP: readonly AuditReportStep[] = [
  {
    title: 'Cadrage et collecte',
    horizon: 'Semaines 1 à 2',
    body: 'Entretiens avec les responsables métier concernés, inventaire des données disponibles et de leur qualité, identification des contraintes réglementaires applicables.',
  },
  {
    title: 'Qualification des cas d’usage',
    horizon: 'Semaines 3 à 4',
    body: 'Positionnement de chaque piste sur la matrice impact et faisabilité, estimation de la valeur attendue et du coût de mise en oeuvre, arbitrage avec vos équipes.',
  },
  {
    title: 'Preuve de valeur',
    horizon: 'Mois 2 à 3',
    body: 'Mise en oeuvre du cas d’usage prioritaire sur un périmètre restreint, avec des indicateurs de succès définis avant le démarrage.',
  },
  {
    title: 'Industrialisation',
    horizon: 'Mois 4 et suivants',
    body: 'Passage en production, supervision, transfert de compétences et gouvernance des modèles dans la durée.',
  },
];

export function buildSkeletonReport(
  input: AuditReportInput,
): AuditReportSections {
  const { organization, jobTitle, answers } = input;
  const recommendation = getRecommendation(answers);
  const org = organization.trim() || 'votre organisation';

  const maturity = labelFor(
    MATURITY_QUESTION,
    answers.maturity,
    'non précisée',
  );
  const sector = labelFor(SECTOR_QUESTION, answers.sector, 'non précisé');
  const headcount = labelFor(
    HEADCOUNT_QUESTION,
    answers.headcount,
    'non précisé',
  );
  const scope = labelFor(SCOPE_QUESTION, answers.scope, 'non précisé');
  const urgency = labelFor(URGENCY_QUESTION, answers.urgency, 'non précisé');
  const challenge = answers.challenge?.trim();

  const situation = [
    `Secteur : ${sector}. Effectif : ${headcount}. Maturité IA déclarée : ${maturity}.`,
    `Périmètre visé : ${scope}. Horizon de démarrage souhaité : ${urgency}.`,
    challenge
      ? `Problème décrit par ${jobTitle.trim() || 'votre équipe'} : ${challenge}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    title: `Audit IA : ${org}`,
    synthesis: `Ce document restitue la lecture d’OpenLab Consulting sur la situation de ${org} au regard de l’intelligence artificielle appliquée, à partir des éléments que vous nous avez communiqués. Il propose un format d’intervention adapté à votre maturité et à votre calendrier, puis une feuille de route en quatre temps. Il ne remplace pas un diagnostic sur site : il en fixe le cadre et les priorités.`,
    situation,
    recommendation: [
      `${recommendation.title}.`,
      recommendation.subtitle,
      ...recommendation.body,
      `Durée annoncée : ${recommendation.duration}. Livrable : ${recommendation.deliverable}.`,
    ].join('\n\n'),
    roadmap: [...ROADMAP],
    nextSteps: `Un consultant senior d’OpenLab Consulting vous contacte sous 24 h ouvrées pour confronter cette lecture à votre réalité de terrain et ajuster le périmètre. Vous pouvez aussi nous écrire directement à infos@openlabconsulting.com.`,
  };
}
