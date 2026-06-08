'use client';

import { useEffect, useRef } from 'react';

/**
 * VisitTracker — beacon de comptage de visite (collection `visits` via
 * `/api/track`). Monté une fois dans le layout public.
 *
 * - `navigator.sendBeacon` : envoi non bloquant, survit au déchargement
 *   de la page, n'ajoute aucune latence perçue.
 * - Le `ref` garde-fou évite le double envoi du double-render de React
 *   StrictMode en dev (sans incidence sur le comptage unique/jour, mais
 *   propre).
 * - Aucun cookie, aucune PII côté client : le pays et l'anonymisation
 *   sont calculés côté serveur. RGPD-friendly (cf. /api/track).
 */
export function VisitTracker(): null {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    try {
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        navigator.sendBeacon('/api/track');
      } else {
        void fetch('/api/track', { method: 'POST', keepalive: true }).catch(
          () => undefined,
        );
      }
    } catch {
      // Best-effort : aucune erreur de tracking ne doit remonter à l'UI.
    }
  }, []);

  return null;
}
