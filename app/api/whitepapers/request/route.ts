import { NextResponse } from 'next/server';
import { persistLead } from '@/lib/leads';
import { METRICS } from '@/lib/metrics';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { getRequestIp } from '@/lib/request-ip';
import { verifyTurnstile } from '@/lib/turnstile';
import { flattenZodErrors, whitepaperRequestSchema } from '@/lib/validation';

/**
 * POST /api/whitepapers/request — gate email pour téléchargement d'un
 * livre blanc (audit P2 §7 #15 — lead magnet souveraineté CI 2026).
 *
 * Pipeline identique aux autres formulaires publics (cf. §10.3 / §10.4) :
 *   1. Rate limit Redis 3 / 24 h / IP (spec collections/Whitepapers.ts)
 *   2. Validation Zod (slug whitelist, email, RGPD obligatoire, honeypot)
 *   3. Verify Turnstile server-side
 *   4. `persistLead` (source = whitepaper, scoring Claude best-effort)
 *   5. Réponse 200 avec `pdfUrl` pour redirect côté client vers /merci
 *
 * Note MVP : le PDF est servi statique depuis `/public/whitepapers/<slug>.pdf`
 * (pas d'URL signée MinIO). Le binding Payload (gating réel + compteur
 * `downloads`) arrivera quand la collection sera seedée et qu'un service
 * email transac (Resend/Brevo) sera branché — voir audit §7 #11 et §15
 * partiel.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PDF_BASE_PATH = '/whitepapers';

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getRequestIp(req);

  const rl = await rateLimit(`whitepaper:${ip}`, RATE_LIMITS.whitepaper);
  if (!rl.ok) {
    METRICS.whitepaperRequest('unknown', 'rate_limited');
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

  let body: unknown;
  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    }
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = whitepaperRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fields = flattenZodErrors(parsed.error);
    const slug =
      typeof (body as { slug?: unknown })?.slug === 'string'
        ? ((body as { slug: string }).slug as string)
        : 'unknown';
    METRICS.whitepaperRequest(slug, 'invalid');
    return NextResponse.json(
      { error: 'validation_failed', fields },
      { status: 400 },
    );
  }

  if (!parsed.data.consentRgpd) {
    METRICS.whitepaperRequest(parsed.data.slug, 'invalid');
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
    METRICS.whitepaperRequest(parsed.data.slug, 'captcha_failed');
    return NextResponse.json(
      { error: 'captcha_failed', mode: turnstile.mode },
      { status: 400 },
    );
  }

  await persistLead({
    source: 'whitepaper',
    name:
      parsed.data.name && parsed.data.name.length > 0
        ? parsed.data.name
        : 'Téléchargement anonyme',
    email: parsed.data.email,
    organization: parsed.data.organization || undefined,
    message: `Demande livre blanc : ${parsed.data.slug}`,
    metadata: { whitepaperSlug: parsed.data.slug },
    consentRgpd: parsed.data.consentRgpd,
    ipAddress: ip,
    userAgent: req.headers.get('user-agent'),
  });

  METRICS.whitepaperRequest(parsed.data.slug, 'accepted');

  return NextResponse.json(
    {
      ok: true,
      pdfUrl: `${PDF_BASE_PATH}/${parsed.data.slug}.pdf`,
      redirectTo: `/livres-blancs/${parsed.data.slug}/merci`,
      message:
        'Demande reçue. Le PDF est disponible immédiatement et vous sera également envoyé par email.',
    },
    { status: 200 },
  );
}
