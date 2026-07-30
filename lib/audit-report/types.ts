import type { QuizAnswers } from '@/lib/audit-ia/quiz';

/**
 * Contrats partagés du pipeline de rapport d'audit IA
 * (cf. docs/superpowers/specs/2026-07-30-rapport-audit-ia-design.md §5).
 *
 * Le modèle (`lucie.ts`) et le squelette de repli (`skeleton.ts`)
 * produisent tous deux `AuditReportSections`, ce qui permet au rendu PDF
 * et à la persistance d'ignorer l'origine du contenu.
 */

/** Une étape de la feuille de route du rapport. */
export interface AuditReportStep {
  title: string;
  horizon: string;
  body: string;
}

/** Contenu complet d'un rapport, indépendamment de son producteur. */
export interface AuditReportSections {
  title: string;
  synthesis: string;
  situation: string;
  recommendation: string;
  roadmap: AuditReportStep[];
  nextSteps: string;
}

/** Entrée commune : ce que le prospect a déclaré dans le questionnaire. */
export interface AuditReportInput {
  organization: string;
  jobTitle: string;
  answers: QuizAnswers;
}
