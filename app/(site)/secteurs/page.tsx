import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { DynamicIcon } from '@/lib/icon-map';
import { getPublishedSectors } from '@/lib/sectors-server';

export const metadata: Metadata = {
  title: 'Secteurs — IA appliquée par industrie',
  description:
    'Public, banque & assurance, agro-industrie, santé, télécoms & énergie : nos déploiements IA adaptés aux contraintes de chaque secteur africain francophone.',
  alternates: {
    canonical: '/secteurs',
  },
};

export default async function SecteursHubPage(): Promise<React.ReactElement> {
  const sectors = await getPublishedSectors();
  return (
    <main id="main">
      {/* Hero */}
      <section
        aria-labelledby="hub-secteurs-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow tone="orange">Hub Secteurs</Eyebrow>
            <Heading id="hub-secteurs-title" level={1} className="mt-4">
              Cinq secteurs.{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                Une exigence commune
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              L’IA n’a pas la même tête dans une banque, une coopérative cacao
              ou un hôpital. On adapte le déploiement à votre cadre
              réglementaire, à vos régulateurs, à vos systèmes existants —
              jamais l’inverse.
            </p>
          </div>

          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {sectors.map(({ slug, iconKey, name, tagline, enjeux }) => (
              <li key={slug}>
                <Link
                  href={`/secteurs/${slug}`}
                  className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                >
                  <Card
                    as="article"
                    interactive
                    className="flex h-full flex-col gap-5 p-8"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        aria-hidden
                        className="inline-flex h-14 w-14 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)] transition-colors group-hover:bg-[var(--color-ol-orange)] group-hover:text-white"
                      >
                        <DynamicIcon
                          name={iconKey}
                          width={28}
                          height={28}
                          aria-hidden
                        />
                      </span>
                      <ArrowUpRight
                        width={20}
                        height={20}
                        aria-hidden
                        className="text-[var(--color-ol-orange-text)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>

                    <Heading level={2} visualLevel={3}>
                      {name}
                    </Heading>

                    <p className="text-[var(--color-ol-graphite)]/80">
                      {tagline}
                    </p>

                    <ul className="mt-auto space-y-1.5 text-sm text-[var(--color-ol-graphite)]/65">
                      {enjeux.slice(0, 3).map((e) => (
                        <li
                          key={e}
                          className="flex items-baseline gap-2 before:mt-1.5 before:block before:h-1 before:w-1 before:flex-shrink-0 before:rounded-full before:bg-[var(--color-ol-orange)]"
                        >
                          {e}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
