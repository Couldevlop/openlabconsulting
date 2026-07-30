import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Jeton de téléchargement du rapport : HMAC-SHA256 sur { reportId, exp },
 * signé avec PAYLOAD_SECRET.
 *
 * Pourquoi pas une simple URL publique imprévisible : un rapport
 * nominatif transféré par email, historisé dans un navigateur ou indexé
 * resterait accessible indéfiniment. Ici le lien expire, et repasser le
 * rapport hors du statut « envoyé » le révoque immédiatement.
 */

const DEFAULT_TTL_DAYS = 30;

interface TokenPayload {
  /** identifiant du rapport */
  r: string;
  /** expiration, en millisecondes epoch */
  e: number;
}

function secret(): string {
  const value = process.env.PAYLOAD_SECRET;
  if (!value) {
    throw new Error(
      'PAYLOAD_SECRET manquant : impossible de signer un lien de rapport.',
    );
  }
  return value;
}

function sign(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

export function signReportToken(
  reportId: string,
  ttlDays = DEFAULT_TTL_DAYS,
): string {
  const payload: TokenPayload = {
    r: reportId,
    e: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifyReportToken(
  token: string,
): { reportId: string } | { error: 'expired' | 'invalid' } {
  const parts = token.split('.');
  if (parts.length !== 2) return { error: 'invalid' };
  const [encoded, signature] = parts;
  if (!encoded || !signature) return { error: 'invalid' };

  // Comparaison à temps constant : une comparaison naïve laisse fuiter la
  // signature attendue octet par octet.
  const provided = Buffer.from(signature);
  const expected = Buffer.from(sign(encoded));
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return { error: 'invalid' };
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString(),
    ) as TokenPayload;
    if (typeof payload.r !== 'string' || typeof payload.e !== 'number') {
      return { error: 'invalid' };
    }
    if (payload.e < Date.now()) return { error: 'expired' };
    return { reportId: payload.r };
  } catch {
    return { error: 'invalid' };
  }
}
