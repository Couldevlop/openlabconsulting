import type { MetadataRoute } from 'next';
import { CATEGORY_LABELS } from '@/lib/articles';
import { getPublishedArticles } from '@/lib/articles-server';
import { EXPERTISES } from '@/lib/data/expertises';
import { PRODUCTS } from '@/lib/data/products';
import { SECTORS } from '@/lib/data/sectors';
import { absoluteUrl } from '@/lib/seo/site';

/**
 * Sitemap dynamique généré au build — CLAUDE.md §12.3.
 *
 * Inclut :
 *   - Pages statiques principales (home, hubs, livre + sous-pages,
 *     laboratoire + sous-pages, contact, audit-ia, à-propos, mentions
 *     légales, politique de confidentialité).
 *   - Pages dynamiques détail expertises (4) / solutions (7) / secteurs (5).
 *   - Insights : tous les articles publiés (via Payload, fallback hard-codé).
 *   - Archives insights : 7 catégories.
 *
 * Priorité décroissante :
 *   1.0 — home
 *   0.9 — hubs (expertises, solutions, secteurs, livre, insights)
 *   0.8 — pages détail produit/expertise/secteur, articles publiés
 *   0.7 — sous-pages livre + laboratoire
 *   0.6 — catégories insights, audit-ia
 *   0.5 — pages institutionnelles
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Hubs §5
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
      url: absoluteUrl('/laboratoire'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/insights'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Livre §8
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
    // Laboratoire §5 sous-routes
    {
      url: absoluteUrl('/laboratoire/axes'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/laboratoire/publications'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/laboratoire/partenariats'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Institutionnel
    {
      url: absoluteUrl('/a-propos'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/a-propos/equipe'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/contact'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/audit-ia'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/mentions-legales'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/politique-confidentialite'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
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

  // Catégories Insights — 7 archives prédictibles.
  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORY_LABELS).map(
    (cat) => ({
      url: absoluteUrl(`/insights/categorie/${cat}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }),
  );

  // Articles publiés (Payload + fallback). On limite à 200 pour rester
  // sous la cap sitemap.xml de 50k URLs / 50MB.
  const articles = await getPublishedArticles(200);
  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: absoluteUrl(`/insights/${a.slug}`),
    lastModified: new Date(a.isoDate),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...expertisePages,
    ...solutionPages,
    ...sectorPages,
    ...categoryPages,
    ...articlePages,
  ];
}
