import type { ReactElement } from 'react';
import { Insights } from './Insights';
import { getPublishedArticles } from '@/lib/articles-server';

/**
 * InsightsServer — wrapper Server Component qui interroge la
 * collection Payload `articles` et passe les 3 derniers publiés au
 * `Insights` côté client.
 *
 * Si Payload est indisponible (build statique, DB down) → fallback
 * sur 3 articles hard-codés.
 */
export async function InsightsServer(): Promise<ReactElement> {
  const articles = await getPublishedArticles(3);
  return <Insights articles={articles} />;
}
