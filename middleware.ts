import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de sécurité — CLAUDE.md §10.3.
 *
 * - Pose les headers OWASP (HSTS prod, X-Frame-Options, CSP nonce-based,
 *   Referrer-Policy, Permissions-Policy, COOP/CORP, X-Content-Type-Options).
 * - Génère un nonce CSP unique par requête (32 bytes base64). Le nonce
 *   est exposé via le header interne `x-nonce` pour que les Server
 *   Components (`app/layout.tsx`) puissent l'injecter dans <Script>.
 *
 * Stratégie CSP :
 *   - `script-src 'self' 'nonce-XYZ' 'strict-dynamic'` : seuls les
 *     scripts inline portant le nonce sont autorisés. `strict-dynamic`
 *     permet aux scripts inline d'inclure d'autres scripts dynamiquement
 *     sans avoir besoin de whitelist d'origines.
 *   - `style-src 'self' 'unsafe-inline'` : Tailwind v4 inline les
 *     styles, on garde unsafe-inline (sinon casse le SSR). Acceptable
 *     car les styles ne sont pas un vecteur d'XSS critique.
 *   - `connect-src 'self' challenges.cloudflare.com` : Turnstile
 *   - `frame-src challenges.cloudflare.com` : widget Turnstile
 *
 * Hors scope middleware (Edge runtime) : rate limit applicatif via
 * Redis — fait dans les route handlers Node (`/api/contact` etc.).
 */

const isProd = process.env.NODE_ENV === 'production';

function generateNonce(): string {
  // crypto.randomUUID est dispo en Edge runtime mais on veut du base64.
  // Utiliser getRandomValues pour cross-runtime compatibility.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // base64 sans dépendre de Buffer (non dispo Edge).
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/=+$/, '');
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // Fallback pour navigateurs sans support de strict-dynamic.
    `script-src-elem 'self' 'nonce-${nonce}' 'unsafe-inline' https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://challenges.cloudflare.com https://api.anthropic.com",
    'frame-src https://challenges.cloudflare.com',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function middleware(req: NextRequest): NextResponse {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  // Propage le nonce dans la requête pour que les Server Components y
  // accèdent via `headers().get('x-nonce')`.
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: reqHeaders } });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)',
  );
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  if (isProd) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Tous les paths sauf assets, sitemap, robots, favicon, admin Payload,
    // API Payload (qui gère ses propres headers).
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|admin|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|webmanifest|woff|woff2|ttf|otf)).*)',
  ],
};
