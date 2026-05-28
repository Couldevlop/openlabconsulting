import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import { getPublishedArticles } from '@/lib/articles-server';

interface RouteParams {
  params: Promise<{ author: string }>;
}

function decodeAuthor(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ');
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { author } = await params;
  const name = decodeAuthor(author);
  return {
    title: `Insights · ${name}`,
    description: `Tous les articles signés par ${name} sur le blog OpenLab Consulting.`,
    alternates: { canonical: `/insights/auteur/${author}` },
  };
}

export default async function AuthorArchivePage({
  params,
}: RouteParams): Promise<React.ReactElement> {
  const { author } = await params;
  const name = decodeAuthor(author);
  const all = await getPublishedArticles(100);
  const articles = all.filter(
    (a) => a.author.toLowerCase() === name.toLowerCase(),
  );

  return (
    <main id="main">
      <section
        aria-labelledby="author-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange-text)]"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Tous les insights
          </Link>

          <div className="mt-10 max-w-3xl">
            <Eyebrow tone="orange">Auteur</Eyebrow>
            <Heading id="author-title" level={1} className="mt-4">
              Publications de {name}
            </Heading>
            <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/80">
              {articles.length} article{articles.length > 1 ? 's' : ''} publié
              {articles.length > 1 ? 's' : ''} chez OpenLab.
            </p>
          </div>
        </Container>
      </section>

      <section
        aria-label={`Articles de ${name}`}
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          {articles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-8 text-center">
              <Heading level={2} visualLevel={4}>
                Aucun article trouvé pour cet auteur.
              </Heading>
              <p className="mt-3 text-[var(--color-ol-graphite)]/75">
                Revérifiez l&rsquo;orthographe du nom dans l&rsquo;URL ou
                explorez tous les insights OpenLab.
              </p>
              <Link
                href="/insights"
                className="mt-6 inline-block text-sm font-medium text-[var(--color-ol-orange-text)] hover:text-[var(--color-ol-orange-dark)]"
              >
                Voir tous les insights
              </Link>
            </div>
          ) : (
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
          )}
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
