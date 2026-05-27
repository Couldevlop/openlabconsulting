import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { AuditIaCtaServer } from '@/components/sections/AuditIaCtaServer';
import { ArticleBody } from '@/components/insights/ArticleBody';
import { Badge } from '@/components/atoms/Badge';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import { extractHeadings } from '@/lib/articles';
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
  const { isEnabled: isDraft } = await draftMode();
  const article = await getArticleBySlug(slug, { draft: isDraft });
  if (!article) return { title: 'Article introuvable — Insights OpenLab' };
  return {
    title: `${article.title} — Insights OpenLab`,
    description: article.excerpt,
    alternates: { canonical: `/insights/${article.slug}` },
    // Une prévisualisation de brouillon ne doit jamais être indexée.
    ...(isDraft ? { robots: { index: false, follow: false } } : {}),
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
  const { isEnabled: isDraft } = await draftMode();
  const article = await getArticleBySlug(slug, { draft: isDraft });
  if (!article) notFound();

  const headings = extractHeadings(article.content);

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
      {isDraft && (
        <div className="bg-[var(--color-ol-night)] px-4 py-2 text-center text-sm text-white">
          Mode prévisualisation — brouillon non publié.{' '}
          <Link
            href="/api/preview/exit"
            className="font-semibold text-[var(--color-ol-orange-light)] underline underline-offset-2"
            prefetch={false}
          >
            Quitter l’aperçu
          </Link>
        </div>
      )}
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
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-graphite)]/70 transition-colors hover:text-[var(--color-ol-orange-text)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
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

            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-ol-mist)] pt-6 text-sm text-[var(--color-ol-graphite)]/70">
              <span>
                Par{' '}
                <span className="font-medium text-[var(--color-ol-night)]">
                  {article.author}
                </span>
              </span>
              <span className="flex items-center gap-4">
                {article.readingTime > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock width={14} height={14} aria-hidden />
                    {article.readingTime} min de lecture
                  </span>
                )}
                <time dateTime={article.isoDate}>{article.publishedAt}</time>
              </span>
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

      {/* Corps + sommaire */}
      <section aria-label="Contenu" className="bg-white pb-24 sm:pb-32">
        <Container width="wide">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-12">
            <div className="min-w-0">
              {/* À retenir — résumé GEO (§12.4) */}
              {article.summary.length > 0 && (
                <aside
                  aria-label="À retenir"
                  className="mb-10 rounded-xl border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-6 sm:p-8"
                >
                  <p className="text-xs font-semibold tracking-wider text-[var(--color-ol-orange-text)] uppercase">
                    À retenir
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {article.summary.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3 text-[var(--color-ol-graphite)]/85"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-ol-orange)]"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}

              {article.content ? (
                <ArticleBody content={article.content} />
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-8">
                  <Badge tone="neutral">Contenu complet en ligne</Badge>
                  <p className="mt-4 text-[var(--color-ol-graphite)]/75">
                    Le corps de cet article est servi depuis l’admin. S’il ne
                    s’affiche pas, le service de contenu est momentanément
                    indisponible — réessaie dans quelques instants.
                  </p>
                </div>
              )}

              {/* Sources (§17.9 — tous chiffres sourcés) */}
              {article.sources.length > 0 && (
                <section
                  aria-labelledby="article-sources"
                  className="mt-16 border-t border-[var(--color-ol-mist)] pt-8"
                >
                  <Heading id="article-sources" level={2} visualLevel={4}>
                    Sources
                  </Heading>
                  <ol className="mt-4 space-y-2 text-sm text-[var(--color-ol-graphite)]/75">
                    {article.sources.map((source, i) => (
                      <li key={source.url} className="flex gap-2">
                        <span
                          aria-hidden
                          className="font-mono text-[var(--color-ol-graphite)]/50"
                        >
                          {i + 1}.
                        </span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="underline decoration-[var(--color-ol-mist)] underline-offset-2 transition-colors hover:text-[var(--color-ol-orange-text)] hover:decoration-[var(--color-ol-orange)]"
                        >
                          {source.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>

            {/* Sommaire sticky (desktop) */}
            {headings.length >= 2 && (
              <aside
                aria-label="Sommaire"
                className="mt-12 hidden lg:sticky lg:top-24 lg:mt-0 lg:block"
              >
                <p className="text-xs font-semibold tracking-wider text-[var(--color-ol-graphite)]/60 uppercase">
                  Sommaire
                </p>
                <nav className="mt-4">
                  <ul className="space-y-2 border-l border-[var(--color-ol-mist)] text-sm">
                    {headings.map((h) => (
                      <li
                        key={h.id}
                        className={h.level === 3 ? 'pl-7' : 'pl-4'}
                      >
                        <a
                          href={`#${h.id}`}
                          className="-ml-px block border-l border-transparent py-0.5 text-[var(--color-ol-graphite)]/70 transition-colors hover:border-[var(--color-ol-orange)] hover:text-[var(--color-ol-orange-text)]"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}
          </div>
        </Container>
      </section>

      <AuditIaCtaServer />
    </main>
  );
}
