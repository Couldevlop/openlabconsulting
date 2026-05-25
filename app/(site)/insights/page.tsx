import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogSchema, breadcrumbSchema } from '@/lib/seo/schema';
import { CATEGORY_LABELS } from '@/lib/articles';
import { getPublishedArticles } from '@/lib/articles-server';
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

export default async function InsightsHubPage(): Promise<React.ReactElement> {
  const [articles, hub] = await Promise.all([
    getPublishedArticles(12),
    getInsightsHubContent(),
  ]);
  const nonce = (await headers()).get('x-nonce') ?? undefined;

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
              <span className="text-[var(--color-ol-orange)]">
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
                      <Heading
                        level={2}
                        visualLevel={4}
                        className="leading-snug"
                      >
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

          <div className="mt-12 rounded-lg border border-dashed border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-8 text-center">
            <Heading level={3} visualLevel={4}>
              {hub.emptyState.heading}
            </Heading>
            <p className="mt-3 text-[var(--color-ol-graphite)]/75">
              {hub.emptyState.text}
            </p>
            <Link
              href={hub.emptyState.ctaHref}
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)] transition-colors hover:text-[var(--color-ol-orange-dark)]"
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
