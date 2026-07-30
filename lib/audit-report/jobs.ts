import type { Field } from 'payload';
import type { QuizAnswers } from '@/lib/audit-ia/quiz';
import { generateWithLucie } from './lucie';
import { buildSkeletonReport } from './skeleton';
import { createDraftReport } from './store-server';
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
