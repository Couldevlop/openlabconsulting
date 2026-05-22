import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { PRODUCTS } from '@/lib/data/products';

export const metadata: Metadata = {
  title: 'Solutions — 7 logiciels propriétaires OpenLab',
  description:
    'NexusRH, NexusERP, SYGESCOM, AgroSense, QualitOS, Fraud Shield, Smart City — l’écosystème complet d’OpenLab Consulting, conçu à Abidjan et déployé en K3s.',
  alternates: {
    canonical: '/solutions',
  },
};

export default function SolutionsHubPage(): React.ReactElement {
  return (
    <main id="main">
      {/* Hero */}
      <section
        aria-labelledby="hub-solutions-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow tone="orange">Hub Solutions</Eyebrow>
            <Heading id="hub-solutions-title" level={1} className="mt-4">
              Sept logiciels propriétaires.{' '}
              <span className="text-[var(--color-ol-orange)]">
                Une suite cohérente
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              Pas une collection d’outils achetés ailleurs : chacun de nos
              produits est conçu et opéré par la même équipe, déployé sur le
              même cluster K3s, gouverné par les mêmes principes de sécurité et
              de souveraineté.
            </p>
          </div>

          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
            {PRODUCTS.map(
              ({ slug, name, Icon, tagline, target, status, statusLabel }) => (
                <li key={slug}>
                  <Link
                    href={`/solutions/${slug}`}
                    className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                  >
                    <Card
                      as="article"
                      interactive
                      className="flex h-full flex-col gap-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          aria-hidden
                          className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-ol-ivory)] text-[var(--color-ol-orange)] ring-1 ring-[var(--color-ol-mist)] transition-colors group-hover:bg-[var(--color-ol-orange)] group-hover:text-white group-hover:ring-[var(--color-ol-orange)]"
                        >
                          <Icon width={24} height={24} aria-hidden />
                        </span>
                        <Badge tone={status}>{statusLabel}</Badge>
                      </div>

                      <Heading level={2} visualLevel={4}>
                        {name}
                      </Heading>

                      <p className="text-[var(--color-ol-graphite)]/75">
                        {tagline}
                      </p>

                      <p className="text-xs text-[var(--color-ol-graphite)]/55">
                        {target}
                      </p>

                      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)]">
                        Découvrir
                        <ArrowUpRight
                          width={16}
                          height={16}
                          aria-hidden
                          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </Card>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
