import { NextResponse } from 'next/server';
import { verifyTotp } from '@/lib/totp';
import { logAudit } from '@/lib/audit-log';
import { getRequestIp } from '@/lib/request-ip';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { TOTP_COOKIE, signTotpSession } from '@/lib/auth/totp-session';

// Durée de validité de la session 2FA, alignée sur tokenExpiration (8 h).
const TOTP_SESSION_TTL_SEC = 28800;

/**
 * POST /api/admin/2fa/verify
 * Body: { code: string }
 *
 * Vérifie un code TOTP de l'utilisateur connecté. Utilisé après le
 * login Payload pour valider la 2e étape d'authentification. Set un
 * cookie de session `totp-verified` que le middleware admin contrôle.
 *
 * Sécurité :
 *   - Rate limit 5 / 15 min / IP (RATE_LIMITS.login) — bloque brute-force
 *   - Audit log sur chaque tentative (success + failed)
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AuthUser {
  id: string | number;
  email?: string;
  role?: string;
  totpEnabled?: boolean;
  totpSecret?: string;
}

interface PayloadLike {
  auth: (args: { headers: Headers }) => Promise<{ user: unknown }>;
  create: Parameters<typeof logAudit>[0]['create'];
}

async function getPayloadAndUser(req: Request): Promise<{
  payload: PayloadLike | null;
  user: AuthUser | null;
}> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = (await getPayload({ config })) as unknown as PayloadLike;
    const auth = await payload.auth({ headers: req.headers });
    return { payload, user: (auth.user as AuthUser | null) ?? null };
  } catch {
    return { payload: null, user: null };
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getRequestIp(req);

  // Rate limit identique au /admin/login : 5 / 15 min / IP.
  const rl = await rateLimit(`2fa-verify:${ip}`, RATE_LIMITS.login);
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

  const { payload, user } = await getPayloadAndUser(req);
  if (!user || !payload) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: 'totp_not_configured' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const code = (body as { code?: unknown }).code;
  if (typeof code !== 'string') {
    return NextResponse.json({ error: 'missing_code' }, { status: 400 });
  }

  const ok = verifyTotp(code, user.totpSecret);

  await logAudit(payload, {
    action: ok ? '2fa.verify' : 'login.failed',
    resource: `users:${user.id}`,
    user: { id: user.id, email: user.email ?? null, role: user.role ?? null },
    ipAddress: ip,
    userAgent: req.headers.get('user-agent'),
    metadata: { stage: '2fa' },
  });

  if (!ok) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }

  // Pose un cookie de session 2FA SIGNÉ (HMAC PAYLOAD_SECRET, lié à l'user +
  // expiration). Le middleware admin le vérifie pour autoriser /admin/**.
  // OWASP A07 : remplace l'ancien `totp-verified=1` constant/forgeable.
  const secret = process.env.PAYLOAD_SECRET ?? '';
  const token = await signTotpSession(user.id, TOTP_SESSION_TTL_SEC, secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOTP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOTP_SESSION_TTL_SEC,
    // Portée racine : le middleware doit lire ce cookie sur /admin ET sur la
    // page de challenge /admin-2fa (hors /admin pour éviter une boucle).
    path: '/',
  });
  return res;
}
