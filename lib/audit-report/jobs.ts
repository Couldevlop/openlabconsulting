import type { Field } from 'payload';
import type { QuizAnswers } from '@/lib/audit-ia/quiz';
import { generateWithLucie } from './lucie';
import { buildSkeletonReport } from './skeleton';
import type { AuditReportInput } from './types';

/**
 * Orchestration de la génération de rapport et des relances.
 *
 * La génération s'exécute hors du cycle de la requête HTTP : le prospect
 * reçoit son 202 immédiatement, sans attendre un modèle qui met plusieurs
 * dizaines de secondes sur CPU. Deux tentatives sont assurées par la file
 * Payload (`retries: 2`) ; au-delà, le squelette prend le relais et le
 * rapport existe quand même.
 */

export interface GenerationInput extends AuditReportInput {
  leadId: number | string;
}

const FALLBACK_REASON =
  'Génération Lucie indisponible ou réponse inexploitable : squelette de repli utilisé, contenu à rédiger.';

export async function runGeneration(
  input: GenerationInput,
): Promise<{ reportId: string | null; generatedBy: 'lucie-7b' | 'squelette' }> {
  // Import différé : `store-server` porte `import 'server-only'`, qui ne
  // résout pas sous tsx. Un import statique ici le ferait remonter dans le
  // graphe de payload.config et casserait les scripts de migration, de
  // seed et de génération d'importMap.
  const { createDraftReport } = await import('./store-server');

  const fromLucie = await generateWithLucie(input);
  const sections = fromLucie ?? buildSkeletonReport(input);
  const generatedBy = fromLucie ? 'lucie-7b' : 'squelette';

  const reportId = await createDraftReport({
    leadId: input.leadId,
    title: sections.title,
    sections,
    generatedBy,
    generationError: fromLucie ? undefined : FALLBACK_REASON,
  });

  return { reportId, generatedBy };
}

/**
 * Définition de tâche pour la file Payload. L'échec de persistance jette
 * volontairement : la file réessaiera, et le rapport ne doit pas être
 * considéré comme produit tant qu'il n'est pas en base.
 */
export interface PendingReport {
  id: string;
  organization: string;
  createdAt: string;
  remindedAt: string | null;
}

/** Première relance à mi-parcours de la promesse de 24 h ouvrées. */
const FIRST_REMINDER_H = 12;
/** Au-delà, la promesse faite au prospect n'est plus tenue. */
const DEADLINE_H = 24;
/** Espacement minimal entre deux relances, pour ne pas noyer l'équipe. */
const MIN_GAP_H = 20;

/**
 * Sélectionne les rapports à relancer. Fonction pure : la lecture en
 * base reste dans la tâche, la règle métier se teste sans Payload.
 */
export function selectReportsToRemind(
  now: Date,
  reports: PendingReport[],
): { report: PendingReport; overdue: boolean }[] {
  const hoursSince = (iso: string): number =>
    (now.getTime() - new Date(iso).getTime()) / 3_600_000;

  return reports
    .filter((r) => hoursSince(r.createdAt) >= FIRST_REMINDER_H)
    .filter(
      (r) => r.remindedAt === null || hoursSince(r.remindedAt) >= MIN_GAP_H,
    )
    .map((r) => ({
      report: r,
      overdue: hoursSince(r.createdAt) >= DEADLINE_H,
    }));
}

const GENERATION_INPUT_SCHEMA: Field[] = [
  { name: 'leadId', type: 'text', required: true },
  { name: 'organization', type: 'text' },
  { name: 'jobTitle', type: 'text' },
  { name: 'answers', type: 'json' },
];

export const generateAuditReportTask = {
  slug: 'generateAuditReport' as const,
  retries: 2,
  inputSchema: GENERATION_INPUT_SCHEMA,
  handler: async ({
    input,
  }: {
    input: Record<string, unknown>;
  }): Promise<{ output: { reportId: string; generatedBy: string } }> => {
    const { reportId, generatedBy } = await runGeneration({
      leadId: String(input.leadId),
      organization: String(input.organization ?? ''),
      jobTitle: String(input.jobTitle ?? ''),
      answers: (input.answers ?? {}) as QuizAnswers,
    });

    if (!reportId) {
      throw new Error(
        'Création du rapport impossible : voir les logs de persistance.',
      );
    }

    const { sendReportReviewAlert } = await import('@/lib/email');
    await sendReportReviewAlert({
      reportId,
      organization: String(input.organization ?? 'organisation non précisée'),
    });

    return { output: { reportId, generatedBy } };
  },
};

/**
 * Relance périodique : signale à l'équipe les rapports qui dorment.
 *
 * Deuxième filet du dispositif d'alerte, après l'email de création et
 * avant le compteur permanent du back-office. Tourne toutes les heures ;
 * la règle de sélection décide, elle, du rythme réel des envois.
 */
export const remindPendingReportsTask = {
  slug: 'remindPendingReports' as const,
  retries: 1,
  // `schedule` met la tâche EN FILE toutes les heures. `autoRun` seul se
  // contente d'exécuter ce qui s'y trouve déjà : sans cette ligne, la
  // file « reminders » resterait vide et aucune relance ne partirait.
  schedule: [{ cron: '0 * * * *', queue: 'reminders' }],
  handler: async (): Promise<{ output: { reminded: number } }> => {
    const { listPendingReports, markReminded } = await import('./store-server');
    const { sendReportReviewAlert } = await import('@/lib/email');

    const due = selectReportsToRemind(new Date(), await listPendingReports());

    for (const { report, overdue } of due) {
      await sendReportReviewAlert({
        reportId: report.id,
        organization: report.organization,
        overdue,
      });
      await markReminded(report.id);
    }

    return { output: { reminded: due.length } };
  },
};
