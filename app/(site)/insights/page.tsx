import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { InsightsList } from '@/components/sections/InsightsList';
import { CATEGORY_LABELS } from '@/lib/articles';
import { getPublishedArticles } from '@/lib/articles-server';
import { getInsightsHubContent } from '@/lib/cms/site-settings-server';

export const metadata: Metadata = {
  title: 'Insights — Articles, études et retours de terrain',
  description:
    'Retours de déploiements IA réels en Afrique francophone : souveraineté, conformité, fraude documentaire, agriculture précision, cybersécurité.',
  alternates: { canonical: '/insights' },
};

const CATEGORY_LIST = Object.values(CATEGORY_LABELS);

export default async function InsightsHubPage(): Promise<React.ReactElement> {
  const [articles, hub] = await Promise.all([
    getPublishedArticles(12),
    getInsightsHubContent(),
  ]);

  return (
    <main id="main">
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
          <InsightsList articles={articles} />

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
