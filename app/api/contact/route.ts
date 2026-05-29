import { NextResponse } from 'next/server';
import { sendLeadAcknowledgement, sendLeadNotification } from '@/lib/email';
import { persistLead } from '@/lib/leads';
import { METRICS } from '@/lib/metrics';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { getRequestIp } from '@/lib/request-ip';
import { verifyTurnstile } from '@/lib/turnstile';
import { contactSchema, flattenZodErrors } from '@/lib/validation';

/**
 * POST /api/contact — Formulaire de contact public (CLAUDE.md §10).
 *
 * Pipeline :
 *   1. Rate limit Redis (5 / 15 min / IP)
 *   2. Validation Zod stricte (honeypot inclus)
 *   3. Vérification Turnstile server-side
 *   4. Persistance lead Payload + scoring Claude (best-effort)
 *   5. Notification équipe + accusé prospect via ZeptoMail (best-effort)
 *
 * Codes de réponse :
 *   - 202 : reçu, traitement en cours
 *   - 400 : payload invalide (incl. honeypot ou Turnstile rejeté)
 *   - 429 : rate limited
 *   - 500 : erreur serveur inattendue
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getRequestIp(req);

  // 1. Rate limit
  const rl = await rateLimit(`contact:${ip}`, RATE_LIMITS.contact);
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
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      },
    );
  }

  // 2. Validation
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

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_failed', fields: flattenZodErrors(parsed.error) },
      { status: 400 },
    );
  }

  // 3. Turnstile (optionnel en dev)
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

  // 4. Persistance lead + scoring Claude (best-effort, fail-soft)
  await persistLead({
    source: 'contact',
    name: parsed.data.name,
    email: parsed.data.email,
    organization: parsed.data.organization || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
    ipAddress: ip,
    userAgent: req.headers.get('user-agent'),
  });

  // 5. Emails transactionnels ZeptoMail (best-effort, fail-soft)
  await Promise.allSettled([
    sendLeadNotification({
      source: 'contact',
      name: parsed.data.name,
      email: parsed.data.email,
      organization: parsed.data.organization || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    }),
    sendLeadAcknowledgement({
      source: 'contact',
      name: parsed.data.name,
      email: parsed.data.email,
    }),
  ]);

  // 6. Métrique Prometheus
  METRICS.contactSubmission('accepted');

  return NextResponse.json(
    { ok: true, message: 'Message reçu, réponse sous 24 h ouvrées.' },
    { status: 202 },
  );
}
