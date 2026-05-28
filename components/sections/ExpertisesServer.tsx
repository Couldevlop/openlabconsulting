import type { ReactElement } from 'react';
import { Expertises } from './Expertises';
import { getPublishedExpertises } from '@/lib/expertises-server';

/**
 * ExpertisesServer — wrapper Server Component qui interroge la collection
 * Payload `expertises` et passe le résultat aux cards `Expertises` de la
 * homepage (§6.3).
 *
 * Si Payload n'est pas disponible (build statique, dev sans docker, DB
 * down) ou que la collection est vide, le helper retombe automatiquement
 * sur le fallback hard-codé (`EXPERTISES`) — les cards restent
 * fonctionnelles.
 *
 * À utiliser directement dans `app/(site)/page.tsx`. Pas de prop : tout
 * est résolu côté server. Aligné sur `SolutionsServer`.
 */
export async function ExpertisesServer(): Promise<ReactElement> {
  const expertises = await getPublishedExpertises();
  return <Expertises expertises={expertises} />;
}
