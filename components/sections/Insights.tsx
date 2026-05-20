import type { ReactElement } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import { FALLBACK_ARTICLES, type Article } from '@/lib/articles';

export interface InsightsProps {
  /** Articles à afficher. Si omis, utilise le fallback (3 articles). */
  articles?: readonly Article[];
}

/**
 * Insights — Section 9 de la homepage (CLAUDE.md §6, §12.5).
 *
 * Données :
 *   - Reçoit `articles` en prop, fourni par `InsightsServer` qui fetch
 *     la collection Payload `articles` (`status === 'published'`,
 *     `sort -publishedAt`, `limit 3`).
 *   - Si la prop est omise, utilise le fallback hard-codé
 *     (`FALLBACK_ARTICLES`).
 *
 * Grid 1/3 cols. Chaque card est <Link> qui englobe une <Card>
 * interactive avec cover, badge catégorie, titre, extrait, auteur,
 * date.
 */
export function Insights({
  articles = FALLBACK_ARTICLES.slice(0, 3),
}: InsightsProps = {}): ReactElement {
  return (
    <section
      aria-labelledby="insights-title"
      data-testid="insights"
      className="bg-white py-24 sm:py-32"
    >
      <Container width="wide">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Insights</Eyebrow>
            <Heading id="insights-title" level={2} className="mt-4">
              Notre lecture du{' '}
              <span className="text-[var(--color-ol-orange)]">
                terrain africain
              </span>
              .
            </Heading>
            <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
              Pas des billets d’opinion : des retours de déploiements réels,
              sourcés, opérables dès lundi.
            </p>
          </div>
          <Button
            as="a"
            href="/insights"
            variant="ghost"
            size="md"
            className="shrink-0 self-start lg:self-end"
          >
            Tous les insights
            <ArrowUpRight width={20} height={20} aria-hidden />
          </Button>
        </div>

        <ul className="mt-14 grid gap-8 md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/insights/${article.slug}`}
                className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
              >
                <Card
                  as="article"
                  interactive
                  className="flex h-full flex-col gap-5 p-0 sm:p-0"
                >
                  <MediaPlaceholder
                    src={article.cover.src}
                    alt={article.cover.alt}
                    tone="cold"
                    aspect="16/9"
                    placeholderLabel="Couverture article"
                    className="rounded-b-none border-0 border-b border-dashed border-[var(--color-ol-graphite)]/15"
                  />

                  <div className="flex flex-1 flex-col gap-4 px-6 pb-6 sm:px-8 sm:pb-8">
                    <Badge tone="orange">{article.categoryLabel}</Badge>

                    <Heading level={3} visualLevel={4} className="leading-snug">
                      {article.title}
                    </Heading>

                    <p className="text-[var(--color-ol-graphite)]/75">
                      {article.excerpt}
                    </p>

                    <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-ol-mist)] pt-4 text-xs text-[var(--color-ol-graphite)]/65">
                      <span className="font-medium text-[var(--color-ol-night)]">
                        {article.author}
                      </span>
                      <time dateTime={article.isoDate}>
                        {article.publishedAt}
                      </time>
                    </footer>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
