import { getPublishedArticles } from '@/lib/articles-server';
import { SITE, absoluteUrl } from '@/lib/seo/site';

/**
 * GET /feed.xml — flux RSS 2.0 des Insights (CLAUDE.md §5).
 *
 * Alimenté par les articles publiés (collection Payload `articles`,
 * fallback hard-codé si DB down). Permet l'abonnement lecteurs + la
 * découverte par agrégateurs et certains crawlers.
 */
export const runtime = 'nodejs';
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(): Promise<Response> {
  const articles = await getPublishedArticles(50);

  const items = articles
    .map((a) => {
      const link = absoluteUrl(`/insights/${a.slug}`);
      const pubDate = new Date(a.isoDate);
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(a.categoryLabel)}</category>
      <dc:creator>${escapeXml(a.author)}</dc:creator>
      <pubDate>${Number.isNaN(pubDate.getTime()) ? '' : pubDate.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} — Insights</title>
    <link>${absoluteUrl('/insights')}</link>
    <atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
