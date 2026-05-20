import { NextResponse } from 'next/server';
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
 *   4. (TODO P7) envoi email Resend → contact@openlabconsulting.com
 *   5. (TODO P9) écriture dans la collection Payload `leads`
 *
 * Pour P10, on log la soumission et renvoie 202 Accepted. La fanout
 * email + persistance lead est branchée en P7 (Claude scoring) + P9
 * (CRM Kanban).
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

  // 4. TODO P7 : envoi Resend + scoring Claude + persistance Payload
  // Pour P10 on log uniquement.
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info('[contact] lead reçu', {
      email: parsed.data.email,
      subject: parsed.data.subject,
    });
  }

  return NextResponse.json(
    { ok: true, message: 'Message reçu, réponse sous 24 h ouvrées.' },
    { status: 202 },
  );
}
