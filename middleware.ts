import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de sécurité — voir CLAUDE.md §10.3.
 *
 * P1 : headers statiques posés (HSTS, X-Frame-Options, Referrer-Policy,
 *      Permissions-Policy, COOP/CORP, X-Content-Type-Options) + une CSP
 *      restrictive sans nonce.
 *
 * P10 : remplacement de la CSP par une version avec nonce dynamique
 *       (`script-src 'nonce-${nonce}'`), exposition du nonce via headers
 *       internes pour que les Server Components puissent l'utiliser, et
 *       ajustement de la matrice CSP pour Plausible/Stripe/Turnstile selon
 *       les besoins finaux.
 */

const isProd = process.env.NODE_ENV === 'production';

const baseCsp = [
  "default-src 'self'",
  // 'unsafe-inline' temporaire pour Next 15 (RSC inline). À remplacer
  // par nonce dynamique en P10.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders: Record<string, string> = {
  'Content-Security-Policy': baseCsp,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(self)',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

if (isProd) {
  securityHeaders['Strict-Transport-Security'] =
    'max-age=31536000; includeSubDomains; preload';
}

export function middleware(_req: NextRequest): NextResponse {
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    // Tous les paths sauf assets statiques Next et fichiers connus.
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|webmanifest|woff|woff2|ttf|otf)).*)',
  ],
};
