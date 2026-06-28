import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { JsonLd } from '@/components/seo/JsonLd';
import { PUBLICATIONS } from '@/lib/data/laboratoire';
import { getPublicationBySlug } from '@/lib/laboratoire-server';
import { breadcrumbSchema, publicationSchema } from '@/lib/seo/schema';
import { alternatesFor } from '@/lib/seo/site';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const TYPE_LABEL: Record<string, string> = {
  livre: 'Ouvrage',
  'livre-blanc': 'Livre blanc',
  'article-pair': 'Article',
  conference: 'Conférence',
};

/** Seules les publications avec `slug` ont une page de détail. */
export function generateStaticParams(): { slug: string }[] {
  return PUBLICATIONS.filter((p) => p.slug).map((p) => ({ slug: p.slug! }));
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) return { title: 'Publication introuvable' };
  return {
    title: `${pub.title} : Publications OpenLab`,
    description: (pub.abstract ?? pub.summary).slice(0, 155),
    alternates: alternatesFor(`/laboratoire/publications/${slug}`),
  };
}

export default async function PublicationDetailPage({
  params,
}: RouteParams): Promise<React.ReactElement> {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub || !pub.slug) notFound();

  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const isExternal = /^https?:\/\//i.test(pub.href);
  const typeLabel = TYPE_LABEL[pub.type] ?? 'Publication';

  return (
    <main id="main">
      <JsonLd
        nonce={nonce}
        data={[
          publicationSchema(pub),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Laboratoire', url: '/laboratoire' },
            { name: 'Publications', url: '/laboratoire/publications' },
            { name: pub.title, url: `/laboratoire/publications/${pub.slug}` },
          ]),
        ]}
      />

      <article>
        <section
          aria-labelledby="publication-title"
          className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
        >
          <Container width="narrow">
            <Link
              href="/laboratoire/publications"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange-text)]"
            >
              <ArrowLeft width={16} height={16} aria-hidden />
              Toutes les publications
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Badge tone="orange">{typeLabel}</Badge>
              <span className="text-sm text-[var(--color-ol-graphite)]/65">
                {pub.authors.join(', ')} · {pub.year}
              </span>
            </div>

            <Heading id="publication-title" level={1} className="mt-4">
              {pub.title}
            </Heading>

            <div className="prose mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-ol-graphite)]/85">
              {(pub.abstract ?? pub.summary)
                .split('\n')
                .filter((p) => p.trim().length > 0)
                .map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={pub.href}
                {...(isExternal
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-ol-orange)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-ol-orange-dark)]"
              >
                {pub.type === 'livre-blanc'
                  ? 'Accéder au document'
                  : 'Lire la publication'}
                <ArrowUpRight width={16} height={16} aria-hidden />
              </Link>
            </div>

            <p className="mt-12 border-t border-[var(--color-ol-mist)] pt-6 text-sm text-[var(--color-ol-graphite)]/60">
              <Eyebrow tone="orange" className="mb-2">
                Laboratoire OpenLab
              </Eyebrow>
              Publication issue de la démarche de R&amp;D appliquée d’OpenLab
              Consulting, un laboratoire en structuration, adossé à des
              déploiements terrain réels et à un livre de référence.
            </p>
          </Container>
        </section>
      </article>

      <AuditIaCta />
    </main>
  );
}
