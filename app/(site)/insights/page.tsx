import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { ArticleCard } from '@/components/insights/ArticleCard';
import { Badge } from '@/components/atoms/Badge';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogSchema, breadcrumbSchema } from '@/lib/seo/schema';
import { CATEGORY_LABELS } from '@/lib/articles';
import { getPagedArticles } from '@/lib/articles-server';
import { getInsightsHubContent } from '@/lib/cms/site-settings-server';

export const metadata: Metadata = {
  title: 'Insights — Articles, études et retours de terrain',
  description:
    'Retours de déploiements IA réels en Afrique francophone : souveraineté, conformité, fraude documentaire, agriculture précision, cybersécurité.',
  alternates: {
    canonical: '/insights',
    types: { 'application/rss+xml': '/feed.xml' },
  },
};

const CATEGORY_LIST = Object.values(CATEGORY_LABELS);
const PER_PAGE = 9;

interface HubPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function InsightsHubPage({
  searchParams,
}: HubPageProps): Promise<React.ReactElement> {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam ?? '1', 10);
  const [paged, hub] = await Promise.all([
    getPagedArticles(requestedPage, PER_PAGE),
    getInsightsHubContent(),
  ]);
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const { articles, page, totalPages } = paged;

  return (
    <main id="main">
      <JsonLd
        nonce={nonce}
        data={[
          blogSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Insights', url: '/insights' },
          ]),
        ]}
      />
      {/* Hero */}
      <section
        aria-labelledby="insights-hub-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <div className="max-w-3xl">
            <Eyebrow tone="orange">{hub.eyebrow}</Eyebrow>
            <Heading id="insights-hub-title" level={1} className="mt-4">
              {hub.headlineLead}{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                {hub.headlineHighlight}
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              {hub.intro}
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {CATEGORY_LIST.map((c) => (
                <li key={c}>
                  <Badge tone="neutral">{c}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Liste articles */}
      <section
        aria-label="Articles récents"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <ul className="grid gap-8 md:grid-cols-3">
            {articles.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} />
              </li>
            ))}
          </ul>

          {/* Pagination SSR (sans JS) */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination des articles"
              className="mt-12 flex items-center justify-center gap-6 text-sm"
            >
              {page > 1 ? (
                <Link
                  href={`/insights?page=${page - 1}`}
                  rel="prev"
                  className="inline-flex items-center gap-1 font-medium text-[var(--color-ol-orange)] transition-colors hover:text-[var(--color-ol-orange-dark)]"
                >
                  <ChevronLeft width={16} height={16} aria-hidden />
                  Précédent
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 text-[var(--color-ol-graphite)]/30">
                  <ChevronLeft width={16} height={16} aria-hidden />
                  Précédent
                </span>
              )}

              <span className="font-medium text-[var(--color-ol-graphite)]/70">
                Page {page} / {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={`/insights?page=${page + 1}`}
                  rel="next"
                  className="inline-flex items-center gap-1 font-medium text-[var(--color-ol-orange)] transition-colors hover:text-[var(--color-ol-orange-dark)]"
                >
                  Suivant
                  <ChevronRight width={16} height={16} aria-hidden />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 text-[var(--color-ol-graphite)]/30">
                  Suivant
                  <ChevronRight width={16} height={16} aria-hidden />
                </span>
              )}
            </nav>
          )}

          <div className="mt-12 rounded-lg border border-dashed border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-8 text-center">
            <Heading level={3} visualLevel={4}>
              {hub.emptyState.heading}
            </Heading>
            <p className="mt-3 text-[var(--color-ol-graphite)]/75">
              {hub.emptyState.text}
            </p>
            <Link
              href={hub.emptyState.ctaHref}
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange-text)] transition-colors hover:text-[var(--color-ol-orange-dark)]"
            >
              {hub.emptyState.ctaLabel}
              <ArrowUpRight width={14} height={14} aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
