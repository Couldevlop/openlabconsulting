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
  const isProd = process.env.NODE_ENV === 'production';

  if (!secret) {
    return isProd
      ? { ok: false, mode: 'misconfigured' }
      : { ok: true, mode: 'bypass' };
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
