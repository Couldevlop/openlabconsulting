import { NextResponse } from 'next/server';
import { sendLeadAcknowledgement, sendLeadNotification } from '@/lib/email';
import { persistLead } from '@/lib/leads';
import { getProductBySlug } from '@/lib/products-server';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { getRequestIp } from '@/lib/request-ip';
import { verifyTurnstile } from '@/lib/turnstile';
import { demoRequestSchema, flattenZodErrors } from '@/lib/validation';

/**
 * POST /api/demo — Demande de démo produit (CLAUDE.md §7, §9.3, §10).
 *
 * Déclenchée par la modale « Demander une démo » des pages
 * /solutions/[slug]. Un lead chaud, qualifié par le produit concerné.
 *
 * Pipeline (identique à /api/contact, durci A04) :
 *   1. Rate limit Redis (5 / 15 min / IP — preset `contact`)
 *   2. Validation Zod stricte (honeypot + format slug/téléphone)
 *   3. Vérification Turnstile server-side
 *   4. Revalidation serveur du produit : le `productName` client est
 *      IGNORÉ et réécrit depuis la source (getProductBySlug). Un slug
 *      inexistant → 400 (pas de lead fantôme, pas d'injection de libellé).
 *   5. Persistance lead `source: demo-produit` + scoring Claude
 *   6. Notification équipe + accusé prospect via ZeptoMail (best-effort)
 *
 * Codes : 202 reçu · 400 invalide · 404 produit inconnu · 429 rate limited.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getRequestIp(req);

  // 1. Rate limit (même quota que /api/contact).
  const rl = await rateLimit(`demo:${ip}`, RATE_LIMITS.contact);
  if (!rl.ok) {
    const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: 'rate_limited', retryAfter },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
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

  const parsed = demoRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_failed', fields: flattenZodErrors(parsed.error) },
      { status: 400 },
    );
  }

  // 3. Turnstile (bypass en dev si secret absent).
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

  // 4. Revalidation serveur du produit (A04). Le libellé fiable vient de
  //    la source, pas du client.
  const product = await getProductBySlug(parsed.data.productSlug);
  if (!product) {
    return NextResponse.json({ error: 'unknown_product' }, { status: 404 });
  }

  const phone = parsed.data.phone || null;
  const message = parsed.data.message || null;

  // 5. Persistance lead + scoring Claude (best-effort, fail-soft).
  await persistLead({
    source: 'demo-produit',
    name: parsed.data.name,
    email: parsed.data.email,
    organization: parsed.data.organization,
    phone,
    subject: `Démo — ${product.name}`,
    message,
    metadata: {
      productSlug: product.slug,
      productName: product.name,
    },
    ipAddress: ip,
    userAgent: req.headers.get('user-agent'),
  });

  // 6. Emails transactionnels ZeptoMail (best-effort, fail-soft).
  await Promise.allSettled([
    sendLeadNotification({
      source: 'demo-produit',
      name: parsed.data.name,
      email: parsed.data.email,
      organization: parsed.data.organization,
      subject: `Démo — ${product.name}`,
      message,
      details: {
        Produit: product.name,
        Téléphone: phone ?? undefined,
      },
    }),
    sendLeadAcknowledgement({
      source: 'demo-produit',
      name: parsed.data.name,
      email: parsed.data.email,
    }),
  ]);

  return NextResponse.json(
    {
      ok: true,
      message:
        'Demande reçue. Un consultant vous recontacte sous 24 h ouvrées pour planifier la démo.',
    },
    { status: 202 },
  );
}
