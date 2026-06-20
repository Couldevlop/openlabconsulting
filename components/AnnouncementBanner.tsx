import type { ReactElement } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { AnnouncementBannerContent } from '@/lib/cms/site-settings';

/**
 * Bandeau d'annonce (flash info) en haut du site, piloté par le global
 * `announcement-banner` (cf. getAnnouncementBanner). N'affiche rien si le
 * bandeau est désactivé ou sans message — donc invisible par défaut.
 *
 * OWASP A03 : le lien n'est rendu que s'il est interne (`/...`) ou http(s) ;
 * tout autre schéma (javascript:, data:…) est ignoré.
 */
function safeHref(href: string): string | null {
  if (href.startsWith('/')) return href;
  if (/^https?:\/\//i.test(href)) return href;
  return null;
}

export function AnnouncementBanner({
  content,
}: {
  content: AnnouncementBannerContent;
}): ReactElement | null {
  if (!content.enabled || !content.message.trim()) return null;
  const href = content.linkHref ? safeHref(content.linkHref.trim()) : null;
  const isInternal = href?.startsWith('/');

  return (
    <div
      role="region"
      aria-label="Annonce"
      data-testid="announcement-banner"
      className="bg-[var(--color-ol-night)] text-[var(--color-ol-ivory)]"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-sm">
        <span className="font-medium">{content.message}</span>
        {href && content.linkLabel ? (
          isInternal ? (
            <Link
              href={href}
              className="inline-flex items-center gap-1 font-semibold text-[var(--color-ol-orange-light)] underline-offset-2 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)]"
            >
              {content.linkLabel}
              <ArrowRight width={14} height={14} aria-hidden />
            </Link>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[var(--color-ol-orange-light)] underline-offset-2 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)]"
            >
              {content.linkLabel}
              <ArrowRight width={14} height={14} aria-hidden />
            </a>
          )
        ) : null}
      </div>
    </div>
  );
}
