/**
 * Cookie de session « TOTP validé » — signé (HMAC-SHA256) et à expiration.
 *
 * OWASP A07 : remplace l'ancien cookie `totp-verified=1` (valeur constante,
 * forgeable) par un jeton signé avec `PAYLOAD_SECRET`, lié à l'utilisateur et
 * borné dans le temps. Impossible à forger sans le secret serveur.
 *
 * Format du jeton : `<userId>.<expMs>.<hmacHex>` où
 *   hmac = HMAC-SHA256("<userId>.<expMs>", secret).
 *
 * Utilise l'API Web Crypto (`crypto.subtle`), disponible À LA FOIS dans le
 * runtime Node (route handler `/api/admin/2fa/verify`) et dans le runtime
 * Edge (middleware) — un seul helper partagé, pas de divergence d'algo.
 */

export const TOTP_COOKIE = 'totp-verified';

const enc = new TextEncoder();

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Comparaison à temps constant de deux chaînes hex de même longueur. */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Signe un jeton de session 2FA valable `ttlSec` secondes pour `userId`.
 */
export async function signTotpSession(
  userId: string | number,
  ttlSec: number,
  secret: string,
  nowMs: number = Date.now(),
): Promise<string> {
  const exp = nowMs + ttlSec * 1000;
  const payload = `${userId}.${exp}`;
  const sig = await hmacHex(payload, secret);
  return `${payload}.${sig}`;
}

/**
 * Vérifie un jeton de session 2FA : signature valide ET non expiré.
 * Retourne `{ userId }` si valide, sinon `null`.
 */
export async function verifyTotpSession(
  token: string | undefined | null,
  secret: string,
  nowMs: number = Date.now(),
): Promise<{ userId: string } | null> {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts as [string, string, string];
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= nowMs) return null;
  const expected = await hmacHex(`${userId}.${expStr}`, secret);
  if (!timingSafeEqualHex(sig, expected)) return null;
  return { userId };
}
