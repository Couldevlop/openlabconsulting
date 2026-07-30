import 'server-only';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { AuditReportSections } from './types';

/**
 * Seule unité du pipeline autorisée à toucher Payload et MinIO
 * (Clean Architecture : l'UI et les unités pures ne connaissent ni la
 * base ni le stockage).
 *
 * Le bucket des rapports est distinct de celui des médias : un rapport
 * nominatif ne doit jamais se retrouver derrière une URL publique.
 *
 * Toutes les fonctions sont fail-soft mais jamais silencieuses : un
 * échec est journalisé y compris en production (OWASP A09). L'incident
 * du 2026-07 sur les emails, resté muet trois semaines, ne doit pas se
 * rejouer ici.
 */

export const REPORTS_BUCKET =
  process.env.MINIO_REPORTS_BUCKET ?? 'openlab-audit-reports';

/**
 * Construit la clé d'objet du PDF. Le format de l'identifiant est
 * contraint pour interdire toute traversée de chemin ou écriture hors
 * du préfixe attendu (OWASP A03).
 */
export function buildReportKey(reportId: string): string {
  if (!/^[A-Za-z0-9-]+$/.test(reportId)) {
    throw new Error(`Identifiant de rapport invalide : ${reportId}`);
  }
  return `audit-reports/${reportId}.pdf`;
}

function s3(): S3Client {
  const raw = process.env.MINIO_ENDPOINT ?? 'localhost:9000';
  const endpoint = raw.startsWith('http') ? raw : `http://${raw}`;
  return new S3Client({
    endpoint,
    region: 'us-east-1',
    forcePathStyle: true, // MinIO requiert path-style
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    },
  });
}

async function getPayloadClient(): Promise<{
  create: (args: Record<string, unknown>) => Promise<unknown>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
  find: (args: Record<string, unknown>) => Promise<unknown>;
  findByID: (args: Record<string, unknown>) => Promise<unknown>;
  jobs: { queue: (args: Record<string, unknown>) => Promise<unknown> };
}> {
  const { getPayload } = await import('payload');
  const config = (await import('@payload-config')).default;
  return (await getPayload({ config })) as unknown as Awaited<
    ReturnType<typeof getPayloadClient>
  >;
}

export async function putReportPdf(
  reportId: string,
  pdf: Buffer,
): Promise<string> {
  const key = buildReportKey(reportId);
  await s3().send(
    new PutObjectCommand({
      Bucket: REPORTS_BUCKET,
      Key: key,
      Body: pdf,
      ContentType: 'application/pdf',
    }),
  );
  return key;
}

export async function getReportPdf(pdfKey: string): Promise<Buffer | null> {
  try {
    const res = await s3().send(
      new GetObjectCommand({ Bucket: REPORTS_BUCKET, Key: pdfKey }),
    );
    const bytes = await res.Body?.transformToByteArray();
    return bytes ? Buffer.from(bytes) : null;
  } catch (err) {
    console.error(
      '[audit-report] lecture PDF impossible:',
      (err as Error).message,
    );
    return null;
  }
}

export async function createDraftReport(args: {
  leadId: number | string;
  title: string;
  sections: AuditReportSections;
  generatedBy: 'lucie-7b' | 'squelette';
  generationError?: string;
}): Promise<string | null> {
  try {
    const payload = await getPayloadClient();
    const created = (await payload.create({
      collection: 'audit-reports',
      overrideAccess: true,
      data: {
        title: args.title,
        lead: args.leadId,
        status: args.generationError ? 'echec-generation' : 'brouillon-ia',
        generatedBy: args.generatedBy,
        generationError: args.generationError ?? null,
        sections: args.sections,
      },
    })) as { id: number | string };

    return String(created.id);
  } catch (err) {
    console.error(
      '[audit-report] création du brouillon impossible:',
      (err as Error).message,
    );
    return null;
  }
}

/**
 * Met la génération en file. Fail-soft : une file indisponible ne doit
 * jamais faire échouer une soumission de lead déjà acquittée par un 202.
 * Sans identifiant de lead, il n'y a rien à rattacher : on n'enfile pas.
 */
export async function queueReportGeneration(input: {
  leadId: string | null;
  organization?: string | null;
  jobTitle?: string | null;
  answers: Record<string, unknown>;
}): Promise<void> {
  if (!input.leadId) return;
  try {
    const payload = await getPayloadClient();
    await payload.jobs.queue({
      task: 'generateAuditReport',
      input: {
        leadId: input.leadId,
        organization: input.organization ?? '',
        jobTitle: input.jobTitle ?? '',
        answers: input.answers,
      },
    });
  } catch (err) {
    console.error(
      '[audit-report] mise en file impossible:',
      (err as Error).message,
    );
  }
}

export async function findReportForDownload(reportId: string): Promise<{
  id: string;
  status: string;
  pdfKey: string | null;
  downloadCount: number;
} | null> {
  try {
    const payload = await getPayloadClient();
    const doc = (await payload.findByID({
      collection: 'audit-reports',
      id: reportId,
      overrideAccess: true,
      depth: 0,
    })) as {
      id: string | number;
      status: string;
      pdfKey?: string | null;
      downloadCount?: number | null;
    };
    return {
      id: String(doc.id),
      status: doc.status,
      pdfKey: doc.pdfKey ?? null,
      downloadCount: doc.downloadCount ?? 0,
    };
  } catch {
    // Un identifiant inconnu est un cas nominal (jeton périmé, rapport
    // supprimé) : pas de bruit dans les logs, la route répond 404.
    return null;
  }
}

export async function incrementDownloadCount(
  reportId: string,
  current: number,
): Promise<void> {
  try {
    const payload = await getPayloadClient();
    await payload.update({
      collection: 'audit-reports',
      id: reportId,
      overrideAccess: true,
      data: { downloadCount: current + 1 },
    });
  } catch (err) {
    console.error(
      '[audit-report] compteur de téléchargement non incrémenté:',
      (err as Error).message,
    );
  }
}

export async function markReportSent(
  reportId: string,
  args: { pdfKey: string; validatedBy: number | string },
): Promise<void> {
  try {
    const payload = await getPayloadClient();
    const now = new Date().toISOString();
    await payload.update({
      collection: 'audit-reports',
      id: reportId,
      overrideAccess: true,
      data: {
        status: 'envoye',
        pdfKey: args.pdfKey,
        validatedBy: args.validatedBy,
        validatedAt: now,
        sentAt: now,
      },
    });
  } catch (err) {
    console.error(
      '[audit-report] statut d’envoi non enregistré:',
      (err as Error).message,
    );
  }
}
