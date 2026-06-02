'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import type { Article } from '@/lib/articles';

/** Nombre d'articles visibles avant le clic sur « Voir plus ». */
const INITIAL_VISIBLE = 3;

interface InsightsListProps {
  articles: readonly Article[];
}

/**
 * Grille d'articles du hub /insights.
 *
 * Affiche les `INITIAL_VISIBLE` premiers articles puis, s'il en reste,
 * propose un bouton « Voir plus » qui révèle le reste (progressive
 * disclosure côté client — pas de rechargement, le SSR rend déjà les 3
 * premières cartes pour le SEO et le no-JS).
 */
export function InsightsList({ articles }: InsightsListProps): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? articles : articles.slice(0, INITIAL_VISIBLE);
  const remaining = articles.length - INITIAL_VISIBLE;

  return (
    <>
      <ul className="grid gap-8 md:grid-cols-3">
        {visible.map((a) => (
          <li key={a.slug}>
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
                  <p className="text-[var(--color-ol-graphite)]/75">
                    {a.excerpt}
                  </p>
                  <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-ol-mist)] pt-4 text-xs text-[var(--color-ol-graphite)]/65">
                    <span className="font-medium text-[var(--color-ol-night)]">
                      {a.author}
                    </span>
                    <time dateTime={a.isoDate}>{a.publishedAt}</time>
                  </footer>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      {!expanded && remaining > 0 ? (
        <div className="mt-12 flex justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setExpanded(true)}
            aria-label={`Voir les ${remaining} articles supplémentaires`}
          >
            Voir plus d’articles ({remaining})
          </Button>
        </div>
      ) : null}
    </>
  );
}
