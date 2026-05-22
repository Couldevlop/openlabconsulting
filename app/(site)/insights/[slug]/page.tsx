import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import { getArticleBySlug } from '@/lib/articles-server';
import {
  articleSchema,
  breadcrumbSchema,
  jsonLdString,
} from '@/lib/seo/schema';

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article introuvable — Insights OpenLab' };
  return {
    title: `${article.title} — Insights OpenLab`,
    description: article.excerpt,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      authors: [article.author],
      publishedTime: article.isoDate,
    },
  };
}

export default async function InsightArticlePage({
  params,
}: PageParams): Promise<React.ReactElement> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const jsonLd = jsonLdString([
    articleSchema({
      slug: article.slug,
      headline: article.title,
      description: article.excerpt,
      author: article.author,
      isoDatePublished: article.isoDate,
      imageUrl: article.cover.src ?? undefined,
      category: article.categoryLabel,
    }),
    breadcrumbSchema([
      { name: 'Accueil', url: '/' },
      { name: 'Insights', url: '/insights' },
      {
        name: article.categoryLabel,
        url: `/insights/categorie/${article.category}`,
      },
      { name: article.title, url: `/insights/${article.slug}` },
    ]),
  ]);

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Breadcrumbs
        items={[
          { label: 'Insights', href: '/insights' },
          {
            label: article.categoryLabel,
            href: `/insights/categorie/${article.category}`,
          },
          { label: article.title },
        ]}
      />
      {/* Hero article */}
      <section
        aria-labelledby="article-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="narrow">
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-graphite)]/70 transition-colors hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={14} height={14} aria-hidden />
            Tous les insights
          </Link>

          <div className="mt-8">
            <Eyebrow tone="orange">{article.categoryLabel}</Eyebrow>
            <Heading id="article-title" level={1} className="mt-4">
              {article.title}
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              {article.excerpt}
            </p>

            <footer className="mt-8 flex items-center justify-between border-t border-[var(--color-ol-mist)] pt-6 text-sm text-[var(--color-ol-graphite)]/70">
              <span>
                Par{' '}
                <span className="font-medium text-[var(--color-ol-night)]">
                  {article.author}
                </span>
              </span>
              <time dateTime={article.isoDate}>{article.publishedAt}</time>
            </footer>
          </div>
        </Container>
      </section>

      {/* Couverture */}
      <section aria-label="Illustration" className="bg-white pb-12 sm:pb-16">
        <Container width="narrow">
          <MediaPlaceholder
            src={article.cover.src}
            alt={article.cover.alt}
            tone="cold"
            aspect="16/9"
            placeholderLabel="Couverture article"
            className="-mt-12 shadow-2xl"
          />
        </Container>
      </section>

      {/* Corps — TODO P7 : rendu Lexical richText */}
      <section aria-label="Contenu" className="bg-white pb-24 sm:pb-32">
        <Container width="narrow">
          <Badge tone="neutral">Article complet à venir</Badge>
          <p className="mt-4 text-[var(--color-ol-graphite)]/75">
            Le corps de l’article est en cours d’édition dans l’admin Payload.
            Reviens dans quelques jours, ou contacte l’équipe OpenLab pour un
            accès en avant-première.
          </p>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
