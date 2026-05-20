'use client';

import { useEffect, useRef, type ReactElement } from 'react';

/**
 * Cloudflare Turnstile widget — CAPTCHA RGPD-friendly (§10.5).
 *
 * Charge le script Turnstile une seule fois par page, rend un widget
 * `<div data-sitekey>` que Cloudflare hydrate. Le token résultant est
 * placé dans un `<input hidden name="cf-turnstile-response">` que le
 * formulaire parent envoie automatiquement au server.
 *
 * Variables d'env :
 *   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (clé publique)
 *
 * Si la clé publique est absente (dev local sans config) :
 *   - On rend un placeholder visuel indiquant "CAPTCHA désactivé (dev)"
 *   - Aucun script externe n'est chargé
 *   - Le formulaire fonctionne car le helper server `verifyTurnstile`
 *     bascule en mode `bypass` quand la clé secrète manque
 *
 * Pour empêcher les bots qui désactivent JS, on combine le widget avec
 * un honeypot `<input name="website">` invisible dans Zod côté serveur.
 */

interface TurnstileProps {
  /** Action métier pour analytics Cloudflare (ex: 'contact', 'audit-ia'). */
  action?: string;
  /** Thème visuel — auto par défaut (suit prefers-color-scheme). */
  theme?: 'auto' | 'light' | 'dark';
  /** Mode rendu (managed=auto, non-interactive=invisible). */
  appearance?: 'always' | 'execute' | 'interaction-only';
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        params: {
          sitekey: string;
          action?: string;
          theme?: string;
          appearance?: string;
        },
      ) => string | undefined;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptLoaded = false;
let scriptLoadingPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;
  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Turnstile script load error'));
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

export function Turnstile({
  action,
  theme = 'auto',
  appearance = 'always',
  className,
}: TurnstileProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        const id = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          action,
          theme,
          appearance,
        });
        if (id) widgetIdRef.current = id;
      })
      .catch(() => {
        // Silencieux : le serveur rejettera le submit sans token valide.
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action, theme, appearance]);

  if (!siteKey) {
    return (
      <div
        role="presentation"
        className={className}
        data-testid="turnstile-dev-placeholder"
      >
        <p className="rounded border border-dashed border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] px-3 py-2 text-xs text-[var(--color-ol-graphite)]/55">
          CAPTCHA désactivé en dev (clé publique absente). Le serveur accepte la
          soumission via fallback bypass.
        </p>
      </div>
    );
  }

  return <div ref={ref} className={className} data-testid="turnstile-widget" />;
}
