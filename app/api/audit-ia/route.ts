import { NextResponse } from 'next/server';
import { persistLead } from '@/lib/leads';
import { METRICS } from '@/lib/metrics';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { getRequestIp } from '@/lib/request-ip';
import { verifyTurnstile } from '@/lib/turnstile';
import { auditIaSchema, flattenZodErrors } from '@/lib/validation';

/**
 * POST /api/audit-ia — Soumission audit IA gratuit (CLAUDE.md §6.10 + §10).
 *
 * Pipeline :
 *   1. Rate limit Redis (3 / 1h / IP — plus strict que contact)
 *   2. Validation Zod (consentement RGPD obligatoire)
 *   3. Turnstile server-side
 *   4. (TODO P7) scoring Claude + génération rapport PDF + envoi email
 *   5. (TODO P9) écriture lead enrichi dans Payload `leads`
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getRequestIp(req);

  const rl = await rateLimit(`audit-ia:${ip}`, RATE_LIMITS.auditIa);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  let payload: unknown;
  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = auditIaSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_failed', fields: flattenZodErrors(parsed.error) },
      { status: 400 },
    );
  }

  if (!parsed.data.consentRgpd) {
    return NextResponse.json(
      {
        error: 'validation_failed',
        fields: { consentRgpd: 'Le consentement RGPD est obligatoire.' },
      },
      { status: 400 },
    );
  }

  const turnstile = await verifyTurnstile(
    parsed.data['cf-turnstile-response'],
    ip,
  );
  if (!turnstile.ok) {
    return NextResponse.json(
      { error: 'captcha_failed', mode: turnstile.mode },
      { status: 400 },
    );
  }

  // Persistance lead enrichi + scoring Claude (best-effort)
  await persistLead({
    source: 'audit-ia',
    name: parsed.data.name,
    email: parsed.data.email,
    organization: parsed.data.organization,
    jobTitle: parsed.data.jobTitle,
    message: parsed.data.goal,
    metadata: {
      maturity: parsed.data.maturity,
      headcount: parsed.data.headcount,
    },
    consentRgpd: parsed.data.consentRgpd,
    ipAddress: ip,
    userAgent: req.headers.get('user-agent'),
  });

  METRICS.auditIaSubmission('accepted');

  return NextResponse.json(
    {
      ok: true,
      message:
        'Demande reçue. Votre rapport personnalisé est prêt sous 48 h ouvrées.',
    },
    { status: 202 },
  );
}
