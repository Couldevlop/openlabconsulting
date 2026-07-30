import { NextResponse } from 'next/server';
import { signReportToken } from '@/lib/audit-report/link';
import { renderReportPdf } from '@/lib/audit-report/pdf';
import { markReportSent, putReportPdf } from '@/lib/audit-report/store-server';
import type { AuditReportSections } from '@/lib/audit-report/types';
import { sendReportDelivery } from '@/lib/email';

/**
 * Validation d'un rapport puis envoi au prospect.
 *
 * Déclenchée depuis le bouton du back-office. L'authentification est
 * celle de Payload (cookie de session) et le rôle est revérifié côté
 * serveur : masquer un bouton dans l'interface ne protège rien
 * (OWASP A01).
 *
 * L'ordre compte : on rend le PDF et on le dépose AVANT de marquer le
 * rapport envoyé, pour ne jamais annoncer un envoi dont le fichier
 * n'existe pas.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = new Set(['super-admin', 'admin', 'editor-chief']);

interface ReportDoc {
  id: string | number;
  title: string;
  sections: AuditReportSections;
  lead:
    | { name?: string; email?: string; organization?: string }
    | number
    | string;
}

export async function POST(req: Request): Promise<NextResponse> {
  const { getPayload } = await import('payload');
  const config = (await import('@payload-config')).default;
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: req.headers });
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!ALLOWED_ROLES.has((user as { role?: string }).role ?? '')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: { reportId?: unknown };
  try {
    body = (await req.json()) as { reportId?: unknown };
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (typeof body.reportId !== 'string' || body.reportId.length === 0) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const report = (await payload.findByID({
    collection: 'audit-reports',
    id: body.reportId,
    overrideAccess: true,
    depth: 1,
  })) as unknown as ReportDoc;

  const lead =
    typeof report.lead === 'object' && report.lead ? report.lead : null;
  if (!lead?.email) {
    return NextResponse.json({ error: 'lead_sans_email' }, { status: 409 });
  }

  const organization = lead.organization ?? 'votre organisation';
  const pdf = await renderReportPdf({
    sections: { ...report.sections, title: report.title },
    organization,
    generatedOn: new Date(),
  });
  const pdfKey = await putReportPdf(String(report.id), pdf);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://openlabconsulting.com';
  const downloadUrl = `${siteUrl}/audit-ia/rapport/${signReportToken(String(report.id))}`;

  const delivery = await sendReportDelivery({
    name: lead.name ?? 'Bonjour',
    email: lead.email,
    organization,
    downloadUrl,
  });

  await markReportSent(String(report.id), {
    pdfKey,
    validatedBy: (user as { id: number | string }).id,
  });

  return NextResponse.json(
    { ok: true, emailSent: delivery.ok },
    { status: 200 },
  );
}
