import type { MetadataRoute } from 'next';
import { EXPERTISES } from '@/lib/data/expertises';
import { PRODUCTS } from '@/lib/data/products';
import { SECTORS } from '@/lib/data/sectors';
import { absoluteUrl } from '@/lib/seo/site';

/**
 * Sitemap dynamique généré au build — voir CLAUDE.md §12.3.
 *
 * Inclut :
 *   - Pages statiques principales (home, hubs, livre + sous-pages)
 *   - Pages dynamiques de /expertises/[slug], /solutions/[slug],
 *     /secteurs/[slug] (4 + 7 + 5 entrées)
 *   - Pages CMS (Insights, Whitepapers) seront ajoutées en P6 quand
 *     Payload sera branché.
 *
 * Priorité décroissante :
 *   1.0 — home
 *   0.9 — hubs (expertises, solutions, secteurs, livre)
 *   0.8 — pages détail expertises/solutions/secteurs
 *   0.7 — sous-pages livre
 *   0.5 — pages institutionnelles (mentions, confidentialité)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: absoluteUrl('/expertises'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/solutions'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/secteurs'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/livre'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/livre/chapitres'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/livre/extraits'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/livre/acheter'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/livre/companion'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const expertisePages: MetadataRoute.Sitemap = EXPERTISES.map((e) => ({
    url: absoluteUrl(`/expertises/${e.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const solutionPages: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: absoluteUrl(`/solutions/${p.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const sectorPages: MetadataRoute.Sitemap = SECTORS.map((s) => ({
    url: absoluteUrl(`/secteurs/${s.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...expertisePages, ...solutionPages, ...sectorPages];
}
