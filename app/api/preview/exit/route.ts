import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * GET /api/preview/exit
 *
 * Désactive le « draft mode » (sortie de prévisualisation) et renvoie
 * vers le hub Insights. Aucune donnée sensible : se contente de couper
 * le cookie draftMode.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<void> {
  (await draftMode()).disable();
  redirect('/insights');
}
