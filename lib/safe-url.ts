/**
 * Validation d'URL « publique » — défense SSRF préventive (OWASP A10).
 *
 * Une URL saisie par un éditeur (champ `sources[].url` d'un article) est
 * aujourd'hui seulement rendue comme lien. MAIS si une future fonctionnalité
 * la récupère côté serveur (vérification de lien mort, aperçu, génération
 * PDF…), une URL pointant sur le réseau interne deviendrait une SSRF stockée
 * (`http://169.254.169.254/`, `http://minio.openlab.svc.cluster.local:9000`,
 * `http://localhost`). On rejette donc dès la saisie tout host non public.
 *
 * Volontairement strict : http(s) uniquement, pas d'IP privée/loopback/
 * link-local, pas de TLD interne (.local/.internal/.svc/.cluster.local).
 */

const PRIVATE_HOST_SUFFIXES = [
  '.local',
  '.internal',
  '.svc',
  '.cluster.local',
  '.localhost',
];

function isPrivateIpv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if ([a, Number(m[3]), Number(m[4])].some((o) => o > 255) || a > 255) {
    return true; // octet hors borne → on refuse par prudence
  }
  if (a === 10 || a === 127 || a === 0) return true; // privé / loopback / "this"
  if (a === 169 && b === 254) return true; // link-local (métadonnées cloud)
  if (a === 192 && b === 168) return true; // privé
  if (a === 172 && b >= 16 && b <= 31) return true; // privé
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIpv6(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '').toLowerCase();
  if (h === '::1' || h === '::') return true; // loopback / unspecified
  if (h.startsWith('fe80')) return true; // link-local
  if (h.startsWith('fc') || h.startsWith('fd')) return true; // unique local fc00::/7
  return false;
}

/** Vrai si `value` est une URL http(s) vers un host public légitime. */
export function isPublicHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim().length === 0) return false;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

  const host = url.hostname.toLowerCase();
  if (host.length === 0) return false;
  if (host === 'localhost') return false;
  if (PRIVATE_HOST_SUFFIXES.some((s) => host.endsWith(s))) return false;
  if (isPrivateIpv4(host)) return false;
  if (host.includes(':') && isPrivateIpv6(host)) return false;

  return true;
}
