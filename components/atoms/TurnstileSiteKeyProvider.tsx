'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Propage la clé SITE Turnstile, lue au RUNTIME côté serveur
 * (`resolveTurnstileSiteKey`, ex. depuis la ConfigMap K8s `TURNSTILE_SITE_KEY`),
 * jusqu'au widget client `Turnstile` — sans dépendre de l'inlining build des
 * variables `NEXT_PUBLIC_*`.
 *
 * Le layout serveur `(site)` (rendu dynamiquement car il lit `headers()`)
 * résout la clé par requête et la fournit ici. Changer la clé = éditer la
 * ConfigMap + redémarrer les pods, aucun rebuild ni passage par GitHub.
 *
 * Valeur du contexte :
 *   - `string`      → clé configurée (widget rendu)
 *   - `null`        → aucune clé (placeholder ; le serveur bypass en parité)
 *   - `undefined`   → aucun provider monté (tests, Storybook) → le widget
 *     retombe sur `NEXT_PUBLIC_TURNSTILE_SITE_KEY` pour rétro-compatibilité.
 */
const TurnstileSiteKeyContext = createContext<string | null | undefined>(
  undefined,
);

export function TurnstileSiteKeyProvider({
  siteKey,
  children,
}: {
  siteKey: string | null;
  children: ReactNode;
}): React.ReactElement {
  return (
    <TurnstileSiteKeyContext.Provider value={siteKey}>
      {children}
    </TurnstileSiteKeyContext.Provider>
  );
}

/**
 * Retourne la clé fournie par le provider, ou `undefined` si aucun provider
 * n'est monté (laisse l'appelant choisir son fallback).
 */
export function useTurnstileSiteKey(): string | null | undefined {
  return useContext(TurnstileSiteKeyContext);
}
