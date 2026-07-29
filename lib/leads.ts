import 'server-only';
import { scoreLead, type LeadScoreInput, type LeadScoreResult } from './claude';

/**
 * Helper server-only — crée un lead dans Payload après score Claude.
 *
 * Fail-soft : si Payload est inaccessible, on log + on n'interrompt
 * pas la requête HTTP (le 202 est déjà parti). Le lead sera perdu
 * mais l'expérience utilisateur reste fluide.
 *
 * Toujours appelée depuis un route handler `/api/contact` ou
 * `/api/audit-ia` après validation Zod et Turnstile.
 *
 * Renvoie le score du lead pour que l'appelant le reporte dans la
 * notification équipe (`sendLeadNotification`) : sans ça, le commercial
 * recevait l'email sans la qualification affichée dans le back-office.
 * Le scoring est calculé avant l'écriture Payload et reste valable même
 * si celle-ci échoue (`scoreLead` ne throw jamais, fallback heuristique).
 */

export interface PersistLeadInput extends LeadScoreInput {
  phone?: string | null;
  subject?: string | null;
  consentRgpd?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface PayloadLike {
  create: (args: {
    collection: 'leads';
    data: Record<string, unknown>;
    overrideAccess?: boolean;
  }) => Promise<unknown>;
}

export async function persistLead(
  input: PersistLeadInput,
): Promise<LeadScoreResult> {
  // Scoring Claude best-effort — fail-soft interne (fallback heuristique),
  // donc hors du try : le score est renvoyé même si Payload est indisponible.
  const score = await scoreLead({
    source: input.source,
    name: input.name,
    email: input.email,
    organization: input.organization,
    jobTitle: input.jobTitle,
    message: input.message,
    metadata: input.metadata,
  });

  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = (await getPayload({ config })) as unknown as PayloadLike;

    await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        source: input.source,
        name: input.name,
        email: input.email,
        organization: input.organization ?? null,
        jobTitle: input.jobTitle ?? null,
        phone: input.phone ?? null,
        subject: input.subject ?? null,
        message: input.message ?? null,
        metadata: input.metadata ?? null,
        stage: 'nouveau',
        aiScore: score.score,
        aiSummary: score.summary,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        consentRgpd: input.consentRgpd ?? false,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[leads] persist lead failed — Payload indisponible:',
        (err as Error).message,
      );
    }
  }

  return score;
}
