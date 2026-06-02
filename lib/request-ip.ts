/**
 * Extraction d'une IP cliente depuis une Request Next.
 *
 * OWASP — fiabilité de la clé de rate-limiting. Le premier hop de
 * `X-Forwarded-For` est **fourni par le client** (spoofable : une IP
 * aléatoire par requête réinitialise le quota). Derrière notre ingress
 * (ingress-nginx), l'IP de confiance est celle posée par le proxy :
 *   1. `x-real-ip`        — posé par ingress-nginx (réécrit, non spoofable)
 *   2. `cf-connecting-ip` — si Cloudflare est en amont (proxy ON)
 *   3. `x-forwarded-for`  — DERNIER recours, hop le plus à gauche (peu fiable)
 *
 * Chaque candidat est validé (IPv4/IPv6) avant d'être retenu, pour éviter
 * qu'une valeur forgée (`X-Real-IP: not-an-ip`) ne serve de clé.
 *
 * À appeler côté route handler (Node runtime), pas dans le middleware Edge.
 */

const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
// IPv6 (compressé ou complet) — validation suffisante pour une clé de quota.
const IPV6 = /^[0-9a-f:]+:[0-9a-f:]*$/i;

function isValidIp(value: string): boolean {
  const v = value.trim();
  if (IPV4.test(v)) {
    return v.split('.').every((o) => Number(o) <= 255);
  }
  return IPV6.test(v);
}

/** Sentinelle quand aucune IP fiable n'est identifiable. */
export const UNKNOWN_IP = 'unknown';

export function getRequestIp(req: Request): string {
  const headers = req.headers;

  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp && isValidIp(realIp)) return realIp;

  const cfIp = headers.get('cf-connecting-ip')?.trim();
  if (cfIp && isValidIp(cfIp)) return cfIp;

  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first && isValidIp(first)) return first;
  }

  return UNKNOWN_IP;
}
