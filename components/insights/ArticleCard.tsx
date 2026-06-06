import type { ReactElement } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import type { Article } from '@/lib/articles';

interface ArticleCardProps {
  article: Article;
}

/**
 * Carte article réutilisable (hub /insights, archives catégorie/auteur,
 * bloc « À lire aussi »). Couverture 16:9, badge catégorie, titre, accroche,
 * auteur + date. Lien sur toute la carte avec focus ring accessible.
 */
export function ArticleCard({ article: a }: ArticleCardProps): ReactElement {
  return (
    <Link
      href={`/insights/${a.slug}`}
      className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
    >
      <Card
        as="article"
        interactive
        className="flex h-full flex-col gap-5 p-0 sm:p-0"
      >
        <MediaPlaceholder
          src={a.cover.src}
          alt={a.cover.alt}
          tone="cold"
          aspect="16/9"
          placeholderLabel="Couverture article"
          className="rounded-b-none border-0 border-b border-dashed border-[var(--color-ol-graphite)]/15"
        />
        <div className="flex flex-1 flex-col gap-4 px-6 pb-6 sm:px-8 sm:pb-8">
          <Badge tone="orange">{a.categoryLabel}</Badge>
          <Heading level={2} visualLevel={4} className="leading-snug">
            {a.title}
          </Heading>
          <p className="text-[var(--color-ol-graphite)]/75">{a.excerpt}</p>
          <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-ol-mist)] pt-4 text-xs text-[var(--color-ol-graphite)]/65">
            <span className="font-medium text-[var(--color-ol-night)]">
              {a.author}
            </span>
            <time dateTime={a.isoDate}>{a.publishedAt}</time>
          </footer>
        </div>
      </Card>
    </Link>
  );
}
