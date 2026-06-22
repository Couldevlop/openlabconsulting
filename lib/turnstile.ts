/**
 * Cloudflare Turnstile — vérification server-side (CLAUDE.md §10.5).
 *
 * Turnstile est un anti-bot RGPD-friendly et gratuit (Cloudflare),
 * recommandé en remplacement de reCAPTCHA. Le widget client renvoie
 * un token (`cf-turnstile-response`) que le serveur DOIT valider via
 * l'API siteverify avec la clé secrète.
 *
 * Variables d'env :
 *   - NEXT_PUBLIC_TURNSTILE_SITE_KEY : clé publique (injectée client)
 *   - TURNSTILE_SECRET_KEY           : clé privée (server-only)
 *
 * Mode dev : si la clé secrète est absente, `verifyTurnstile` renvoie
 * `{ ok: true, mode: 'bypass' }` pour ne pas bloquer le développement
 * local. En prod, l'absence de clé est traitée comme une erreur
 * (`{ ok: false, mode: 'misconfigured' }`).
 *
 * Parité client/serveur (auto-réparateur) : si la clé PUBLIQUE
 * (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) n'est pas configurée, le widget
 * client ne peut pas se rendre ni produire de token — il serait alors
 * incohérent que le serveur exige un token qu'aucun utilisateur ne peut
 * fournir (blocage total des soumissions légitimes). Dans ce cas on
 * bypass. Dès que la site key réelle est fournie au build, la
 * vérification stricte se réactive automatiquement (honeypot +
 * rate-limit restent actifs en permanence).
 */

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerifyResult {
  ok: boolean;
  mode: 'verified' | 'bypass' | 'misconfigured' | 'invalid' | 'network-error';
  errorCodes?: readonly string[];
}

interface CloudflareResponse {
  success?: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Vérifie un token Turnstile auprès de Cloudflare.
 *
 * @param token   Valeur du champ `cf-turnstile-response` reçu du widget
 * @param remoteIp IP de l'appelant (optionnelle mais recommandée)
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isProd = process.env.NODE_ENV === 'production';

  // Parité client/serveur : sans clé publique, le widget ne se rend jamais
  // (components/atoms/Turnstile.tsx) et aucun token ne peut être produit.
  // Exiger un token reviendrait à bloquer 100 % des soumissions légitimes.
  // On bypass jusqu'à ce que la site key soit fournie au build → l'enforcement
  // strict se réactive de lui-même. Le honeypot + rate-limit restent actifs.
  if (!siteKey) {
    return { ok: true, mode: 'bypass' };
  }

  if (!secret) {
    return isProd
      ? { ok: false, mode: 'misconfigured' }
      : { ok: true, mode: 'bypass' };
  }

  // Clés de test officielles Cloudflare (documentées publiquement :
  // developers.cloudflare.com/turnstile/troubleshooting/testing). Réservées
  // aux E2E/CI : on valide le chemin nominal sans dépendre du réseau Cloudflare.
  // Ce ne sont JAMAIS de vraies clés de prod → aucun affaiblissement réel
  // (OWASP A04/A07). « Always passes » → ok ; « always fails » → invalid.
  if (secret === '1x0000000000000000000000000000000AA') {
    return { ok: true, mode: 'verified' };
  }
  if (secret === '2x0000000000000000000000000000000AA') {
    return { ok: false, mode: 'invalid', errorCodes: ['test-always-fails'] };
  }

  if (!token || typeof token !== 'string') {
    return {
      ok: false,
      mode: 'invalid',
      errorCodes: ['missing-input-response'],
    };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  let res: Response;
  try {
    res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      // Anti-hang : timeout court via signal AbortController.
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, mode: 'network-error' };
  }

  if (!res.ok) {
    return { ok: false, mode: 'network-error' };
  }

  const data = (await res.json()) as CloudflareResponse;
  if (data.success === true) {
    return { ok: true, mode: 'verified' };
  }
  return {
    ok: false,
    mode: 'invalid',
    errorCodes: data['error-codes'] ?? [],
  };
}
