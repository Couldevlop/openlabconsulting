/**
 * Point d'entrée exécuté une fois au démarrage du serveur Next.
 *
 * Rôle unique : démarrer le planificateur de tâches Payload. Celui-ci ne
 * s'initialise que si `getPayload` reçoit `cron: true`, et uniquement au
 * moment où Payload est instancié. Sans ce hook, le planificateur ne
 * démarrait qu'à la première requête touchant Payload : après un
 * redémarrage de pod, un rapport d'audit déjà en file pouvait attendre
 * indéfiniment qu'un visiteur déclenche l'initialisation.
 *
 * Constaté en production le 2026-07-31 : job en file, `total_tried` à 0,
 * aucune exécution pendant plusieurs minutes après le rollout.
 *
 * Le hook est silencieux en cas d'échec : un planificateur indisponible
 * ne doit pas empêcher le serveur de répondre. L'erreur est journalisée
 * (OWASP A09), jamais avalée.
 */
export async function register(): Promise<void> {
  // Ne s'exécute que dans le runtime Node : l'Edge runtime n'a ni base ni
  // planificateur, et la phase de build ne doit rien instancier.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  if (process.env.PAYLOAD_DISABLE_JOBS === 'true') return;

  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    await getPayload({ config, cron: true });
  } catch (err) {
    console.error(
      '[instrumentation] démarrage du planificateur impossible:',
      (err as Error).message,
    );
  }
}
