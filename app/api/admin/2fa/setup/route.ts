import { NextResponse } from 'next/server';
import { generateTotpSetup, verifyTotp } from '@/lib/totp';
import { logAudit } from '@/lib/audit-log';
import { getRequestIp } from '@/lib/request-ip';

/**
 * 2FA TOTP — workflow setup en deux étapes (CLAUDE.md §11.2).
 *
 * GET /api/admin/2fa/setup
 *   Génère un secret TOTP + QR-code pour l'utilisateur connecté.
 *   Le secret est temporairement stocké en session ; ne devient
 *   permanent (et `totpEnabled=true`) qu'après vérification d'un code
 *   par POST.
 *
 * POST /api/admin/2fa/setup
 *   Body: { code: string, secret: string }
 *   Vérifie que le code correspond au secret, puis persiste sur l'user.
 *
 * Auth : route protégée — l'utilisateur doit être authentifié sur
 * `/admin`. Payload pose un cookie `payload-token` consommé par
 * `payload.auth({ req })` côté server.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPayloadAndUser(req: Request): Promise<{
  payload: PayloadLike | null;
  user: AuthUser | null;
}> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = (await getPayload({ config })) as unknown as PayloadLike;
    const auth = await payload.auth({
      headers: req.headers,
    });
    return { payload, user: (auth.user as AuthUser | null) ?? null };
  } catch {
    return { payload: null, user: null };
  }
}

interface AuthUser {
  id: string | number;
  email?: string;
  role?: string;
  totpEnabled?: boolean;
}

interface PayloadLike {
  auth: (args: { headers: Headers }) => Promise<{ user: unknown }>;
  update: (args: {
    collection: 'users';
    id: string | number;
    data: Record<string, unknown>;
    overrideAccess?: boolean;
  }) => Promise<unknown>;
  create: Parameters<typeof logAudit>[0]['create'];
}

export async function GET(req: Request): Promise<NextResponse> {
  const { user } = await getPayloadAndUser(req);
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (user.totpEnabled) {
    return NextResponse.json({ error: 'already_enabled' }, { status: 409 });
  }
  const setup = await generateTotpSetup(user.email ?? `user-${user.id}`);
  return NextResponse.json(setup);
}

export async function POST(req: Request): Promise<NextResponse> {
  const { payload, user } = await getPayloadAndUser(req);
  if (!user || !payload) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { code, secret } = body as { code?: string; secret?: string };
  if (typeof code !== 'string' || typeof secret !== 'string') {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  if (!verifyTotp(code, secret)) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }

  // Persiste : active 2FA pour cet utilisateur.
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      totpSecret: secret,
      totpEnabled: true,
      totpSetupAt: new Date().toISOString(),
    },
    overrideAccess: true,
  });

  await logAudit(payload, {
    action: '2fa.enable',
    resource: `users:${user.id}`,
    user: { id: user.id, email: user.email ?? null, role: user.role ?? null },
    ipAddress: getRequestIp(req),
    userAgent: req.headers.get('user-agent'),
  });

  return NextResponse.json({ ok: true });
}
