import { NextResponse } from 'next/server';
import { renderMetrics } from '@/lib/metrics';

/**
 * GET /api/metrics — endpoint Prometheus exposition format (CLAUDE.md §15.2).
 *
 * Sécurité :
 *   - En prod (`METRICS_TOKEN` défini), exige un header
 *     `Authorization: Bearer <token>` correspondant. Cible : ServiceMonitor
 *     Prometheus dans le même cluster K3s avec credentials dédiés.
 *   - En dev (`METRICS_TOKEN` absent), accès libre pour test local.
 *
 * Format : text/plain; version=0.0.4 — lecture directe par Prometheus.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(req: Request): NextResponse {
  const token = process.env.METRICS_TOKEN;
  if (token) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${token}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }
  const body = renderMetrics();
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
