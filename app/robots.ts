import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/site';

/**
 * robots.txt généré dynamiquement — voir CLAUDE.md §12.3.
 *
 * Autorise :
 *   - Tous les bots sur le site public
 *   - Bots LLM (GPTBot, ClaudeBot, PerplexityBot, GoogleOther-Image, etc.)
 *
 * Interdit :
 *   - /admin (back-office Payload P6)
 *   - /api/* (endpoints internes, sauf /api/health public)
 *   - /_next/* (assets internes Next.js)
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
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
