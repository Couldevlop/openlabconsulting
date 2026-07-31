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
  // `cron: true` est indispensable : Payload ne démarre son planificateur
  // que si cette option est passée (cf. `_initializeCrons`, appelé
  // uniquement quand `options.cron` est vrai). Sans elle, les tâches
  // s'empilent dans `payload_jobs` sans jamais être exécutées, et rien ne
  // le signale. Constaté en production le 2026-07-31 : job en file,
  // `total_tried` à 0, aucun rapport généré.
  return (await getPayload({ config, cron: true })) as unknown as Awaited<
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

    // Idempotence : la file réessaie jusqu'à deux fois, et une écriture
    // peut réussir côté base alors que la confirmation se perd (timeout
    // réseau). Sans ce garde, le prospect se retrouverait avec deux
    // rapports pour une seule demande. Un lead, un rapport.
    const existing = (await payload.find({
      collection: 'audit-reports',
      overrideAccess: true,
      depth: 0,
      limit: 1,
      where: { lead: { equals: args.leadId } },
    })) as { docs: { id: number | string }[] };
    const already = existing.docs[0];
    if (already) {
      console.error(
        `[audit-report] rapport déjà existant pour le lead ${args.leadId}, création ignorée.`,
      );
      return String(already.id);
    }

    // Le titre vit sur le document, pas dans le groupe `sections` : on
    // écarte explicitement la clé plutôt que de laisser Payload ignorer
    // un champ surnuméraire en silence.
    const { title: _sectionTitle, ...sectionFields } = args.sections;

    const created = (await payload.create({
      collection: 'audit-reports',
      overrideAccess: true,
      data: {
        title: args.title,
        lead: args.leadId,
        status: args.generationError ? 'echec-generation' : 'brouillon-ia',
        generatedBy: args.generatedBy,
        generationError: args.generationError ?? null,
        sections: sectionFields,
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
  } catch (err) {
    // Un identifiant inconnu est un cas nominal (jeton périmé, rapport
    // supprimé) et ne mérite pas d'alerte. Toute autre erreur signale en
    // revanche une panne base ou Payload : elle doit être visible, sinon
    // un incident se traduirait par des 404 silencieux côté prospect.
    const message = (err as Error).message ?? '';
    if (!/not\s*found/i.test(message)) {
      console.error('[audit-report] lecture du rapport impossible:', message);
    }
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

/**
 * Rapports encore en attente de validation, pour la tâche de relance.
 * `depth: 1` pour disposer du nom de l'organisation sans second appel.
 */
export async function listPendingReports(): Promise<
  {
    id: string;
    organization: string;
    createdAt: string;
    remindedAt: string | null;
  }[]
> {
  try {
    const payload = await getPayloadClient();
    const res = (await payload.find({
      collection: 'audit-reports',
      overrideAccess: true,
      depth: 1,
      limit: 100,
      where: {
        // « valide » compris : un rapport validé mais jamais envoyé est
        // le pire des cas, le prospect n'a rien et plus rien ne le signale.
        status: {
          in: ['brouillon-ia', 'en-revue', 'valide', 'echec-generation'],
        },
      },
    })) as {
      docs: {
        id: string | number;
        createdAt: string;
        remindedAt?: string | null;
        lead?: { organization?: string | null } | number | string;
      }[];
    };

    return res.docs.map((d) => ({
      id: String(d.id),
      organization:
        typeof d.lead === 'object' && d.lead
          ? (d.lead.organization ?? 'organisation non précisée')
          : 'organisation non précisée',
      createdAt: d.createdAt,
      remindedAt: d.remindedAt ?? null,
    }));
  } catch (err) {
    console.error(
      '[audit-report] lecture des rapports en attente impossible:',
      (err as Error).message,
    );
    return [];
  }
}

export async function markReminded(reportId: string): Promise<void> {
  try {
    const payload = await getPayloadClient();
    await payload.update({
      collection: 'audit-reports',
      id: reportId,
      overrideAccess: true,
      data: { remindedAt: new Date().toISOString() },
    });
  } catch (err) {
    console.error(
      '[audit-report] horodatage de relance impossible:',
      (err as Error).message,
    );
  }
}

/**
 * Marque le rapport envoyé et fait avancer le lead au stade « contacté ».
 *
 * Renvoie `false` en cas d'échec, et l'appelant DOIT en tenir compte :
 * un rapport resté au statut brouillon alors que le lien est parti donne
 * un lien mort à vie (la route de téléchargement exige « envoyé »).
 * C'est pour cela que cette écriture précède l'email.
 */
export async function markReportSent(
  reportId: string,
  args: { pdfKey: string; validatedBy: number | string },
): Promise<boolean> {
  try {
    const payload = await getPayloadClient();
    const now = new Date().toISOString();
    const updated = (await payload.update({
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
    })) as { lead?: { id?: number | string } | number | string };

    // Le lead passe au stade « qualifié » : le pipeline commercial doit
    // refléter qu'un livrable chiffré est parti. La spec parlait de
    // « contacté », valeur qui n'existe pas dans l'énumération des leads
    // (nouveau, qualifie, rdv, proposition, signe, perdu) : écrire une
    // valeur hors référentiel aurait fait échouer l'update en silence.
    const leadId =
      typeof updated.lead === 'object' && updated.lead
        ? updated.lead.id
        : updated.lead;
    if (leadId !== undefined && leadId !== null) {
      try {
        await payload.update({
          collection: 'leads',
          id: leadId,
          overrideAccess: true,
          data: { stage: 'qualifie' },
        });
      } catch (err) {
        // Non bloquant : le rapport est bien parti, seul le pipeline
        // commercial reste à jour manuellement.
        console.error(
          '[audit-report] stade du lead non mis à jour:',
          (err as Error).message,
        );
      }
    }

    return true;
  } catch (err) {
    console.error(
      '[audit-report] statut d’envoi non enregistré:',
      (err as Error).message,
    );
    return false;
  }
}
