/**
 * Extraction d'une IP cliente depuis une Request Next.
 *
 * Priorité :
 *   1. `x-forwarded-for` (premier hop)
 *   2. `x-real-ip` (Traefik)
 *   3. `cf-connecting-ip` (Cloudflare)
 *   4. fallback `0.0.0.0`
 *
 * Doit être appelée côté route handler (Node runtime), pas dans le
 * middleware Edge — l'IP du middleware Edge est accessible via
 * `req.ip` directement.
 */
export function getRequestIp(req: Request): string {
  const headers = req.headers;
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get('cf-connecting-ip') ?? headers.get('x-real-ip') ?? '0.0.0.0'
  );
}
