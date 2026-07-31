import 'server-only';

/**
 * Amorce du planificateur de tâches Payload.
 *
 * Payload ne démarre son planificateur que si `getPayload` reçoit
 * `cron: true`, et uniquement au moment de l'instanciation. Cette
 * instanciation étant paresseuse, un rapport mis en file avant tout
 * trafic attendait indéfiniment : constaté en production le 2026-07-31,
 * job à `total_tried = 0` plusieurs minutes après un rollout.
 *
 * L'amorce passe par la route de santé, frappée en continu par les
 * sondes Kubernetes : le planificateur démarre donc quelques secondes
 * après le boot, sans dépendre d'un visiteur.
 *
 * Un hook `instrumentation.ts` aurait été plus direct, mais Next compile
 * ce fichier pour le runtime Edge aussi, où les modules natifs de
 * Payload ne se résolvent pas : la construction échoue sur
 * « Can't resolve 'crypto' », y compris derrière un import dynamique.
 */

let started = false;

export async function ensureJobSchedulerStarted(): Promise<void> {
  if (started) return;
  if (process.env.PAYLOAD_DISABLE_JOBS === 'true') return;
  started = true;

  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    await getPayload({ config, cron: true });
  } catch (err) {
    // Nouvelle tentative au prochain passage de la sonde : une base
    // momentanément indisponible ne doit pas condamner le planificateur.
    started = false;
    console.error(
      '[scheduler] démarrage du planificateur impossible:',
      (err as Error).message,
    );
  }
}

/** Réservé aux tests : remet l'amorce à son état initial. */
export function __resetSchedulerForTests(): void {
  started = false;
}
