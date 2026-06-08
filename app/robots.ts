import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/site';

/**
 * Crawlers commerciaux agressifs explicitement refusés (anti-scraping).
 *
 * Ce ne sont **ni** des moteurs de recherche (Google/Bing) **ni** les
 * crawlers IA qu'on veut garder pour le GEO (§12.4). Ce sont des
 * harvesters SEO/data/marketing qui aspirent le contenu en masse sans
 * apporter de visibilité. `robots.txt` n'est qu'une politesse : seuls
 * ceux qui le respectent s'arrêtent ici — les autres sont gérés par
 * Cloudflare Super Bot Fight Mode (cf. docs/anti-scraping.md, couche 1).
 *
 * Bytespider (ByteDance/TikTok) est inclus : crawler d'entraînement
 * notoirement abusif, hors cible GEO, et qui ignore souvent robots —
 * d'où la double barrière Cloudflare.
 */
const AGGRESSIVE_SCRAPERS = [
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'DataForSeoBot',
  'BLEXBot',
  'PetalBot',
  'Bytespider',
  'ImagesiftBot',
  'magpie-crawler',
  'serpstatbot',
] as const;

/**
 * robots.txt généré dynamiquement — voir CLAUDE.md §12.3 + §12.4 (GEO).
 *
 * Autorise :
 *   - Tous les bots sur le site public (moteurs de recherche : Google, Bing…)
 *   - Bots LLM qu'on garde pour le GEO (GPTBot, ClaudeBot, PerplexityBot,
 *     Google-Extended)
 *
 * Interdit :
 *   - /admin (back-office Payload P6)
 *   - /api/* (endpoints internes, sauf /api/health public)
 *   - /_next/* (assets internes Next.js)
 *   - les crawlers commerciaux agressifs (AGGRESSIVE_SCRAPERS), sur tout le site
 *
 * La protection réelle contre les scrapers qui ignorent robots.txt est
 * assurée en amont par Cloudflare (cf. docs/anti-scraping.md).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/', '/_next/'],
      },
      // Bots LLM — on les autorise explicitement (GEO, voir §12.4)
      { userAgent: 'GPTBot', allow: ['/', '/insights'] },
      { userAgent: 'ClaudeBot', allow: ['/', '/insights'] },
      { userAgent: 'anthropic-ai', allow: ['/', '/insights'] },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      // Harvesters agressifs — refus total (déclaratif ; doublé par Cloudflare).
      ...AGGRESSIVE_SCRAPERS.map((userAgent) => ({
        userAgent,
        disallow: '/',
      })),
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
