import { NextResponse } from 'next/server';
import { verifyReportToken } from '@/lib/audit-report/link';
import {
  findReportForDownload,
  getReportPdf,
  incrementDownloadCount,
} from '@/lib/audit-report/store-server';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { getRequestIp } from '@/lib/request-ip';

/**
 * Diffusion du rapport d'audit sous jeton signé.
 *
 * Cette route ne renvoie qu'un fichier : jamais de métadonnée, jamais de
 * liste, et jamais de message distinguant « rapport inexistant » de
 * « rapport pas encore envoyé » (OWASP A01, énumération). Le débit est
 * limité par IP pour empêcher le balayage de jetons.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const ip = getRequestIp(req);
  const rl = await rateLimit(
    `report-download:${ip}`,
    RATE_LIMITS.reportDownload,
  );
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const { token } = await ctx.params;
  const verified = verifyReportToken(token);
  if ('error' in verified) {
    return NextResponse.json(
      { error: verified.error },
      { status: verified.error === 'expired' ? 410 : 403 },
    );
  }

  const report = await findReportForDownload(verified.reportId);
  if (!report || report.status !== 'envoye' || !report.pdfKey) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const pdf = await getReportPdf(report.pdfKey);
  if (!pdf) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  await incrementDownloadCount(report.id, report.downloadCount);

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="audit-ia-openlab-${report.id}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
