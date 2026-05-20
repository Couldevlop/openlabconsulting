import { generateSync, generateSecret, generateURI, verifySync } from 'otplib';
import qrcode from 'qrcode';

/**
 * Two-Factor Authentication TOTP (RFC 6238) — CLAUDE.md §11.2.
 *
 * Configuration :
 *   - Issuer : "OpenLab Consulting Admin"
 *   - Algorithm : SHA-1 (compatible Google Authenticator, Authy, Aegis)
 *   - Digits : 6
 *   - Période : 30 secondes
 *   - Tolérance : ±30 s pour la dérive d'horloge
 *
 * Le secret base32 est généré côté serveur, stocké dans la collection
 * Users (champ `totpSecret`). Jamais exposé après setup.
 *
 * API otplib 13.x — fonctionnelle, retourne `VerifyResult` au lieu de
 * boolean. On normalise en boolean dans `verifyTotp`.
 */

const ISSUER = 'OpenLab Consulting Admin';
const EPOCH_TOLERANCE_SEC = 30;

export interface TotpSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Génère un secret TOTP + l'URL otpauth:// + l'image QR-code base64.
 *
 * @param accountLabel typiquement l'email de l'utilisateur
 */
export async function generateTotpSetup(
  accountLabel: string,
): Promise<TotpSetupResult> {
  const secret = generateSecret({ length: 20 });
  const otpauthUrl = generateURI({
    issuer: ISSUER,
    label: accountLabel,
    secret,
  });
  const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl, {
    margin: 1,
    width: 240,
  });
  return { secret, otpauthUrl, qrCodeDataUrl };
}

/**
 * Vérifie un code TOTP à 6 chiffres contre un secret base32.
 * Tolère ±30 s pour la dérive d'horloge.
 */
export function verifyTotp(code: string, secret: string): boolean {
  if (!code || !secret) return false;
  if (!/^\d{6}$/.test(code)) return false;
  try {
    const result = verifySync({
      token: code,
      secret,
      epochTolerance: EPOCH_TOLERANCE_SEC,
    });
    return result.valid === true;
  } catch {
    return false;
  }
}

/**
 * Génère un code TOTP courant pour un secret (utilisé pour les tests).
 */
export function currentTotp(secret: string): string {
  return generateSync({ secret });
}
