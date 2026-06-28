import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Methodologie } from '@/components/sections/Methodologie';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { Heading } from '@/components/atoms/Heading';
import { JsonLd } from '@/components/seo/JsonLd';
import { DynamicIcon } from '@/lib/icon-map';
import { getPublishedExpertises } from '@/lib/expertises-server';
import {
  getMethodologieContent,
  getExpertisesHubContent,
} from '@/lib/cms/site-settings-server';
import { alternatesFor } from '@/lib/seo/site';
import { breadcrumbSchema, collectionPageSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Expertises : Conseil, agents, data, cybersécurité IA',
  description:
    'Quatre expertises OpenLab pour transformer l’IA en levier mesurable : conseil stratégique, agents & automatisation, data & gouvernance, cybersécurité augmentée.',
  alternates: alternatesFor('/expertises'),
};

export default async function ExpertisesHubPage(): Promise<React.ReactElement> {
  const [expertises, methodologieContent, hub] = await Promise.all([
    getPublishedExpertises(),
    getMethodologieContent(),
    getExpertisesHubContent(),
  ]);
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <main id="main">
      <JsonLd
        nonce={nonce}
        data={[
          collectionPageSchema({
            name: 'Expertises OpenLab',
            description: hub.description,
            url: '/expertises',
            items: expertises.map((e) => ({
              name: e.title,
              url: `/expertises/${e.slug}`,
            })),
          }),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Expertises', url: '/expertises' },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ label: 'Expertises' }]} />
      {/* Hero */}
      <section
        aria-labelledby="hub-expertises-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow tone="orange">{hub.eyebrow}</Eyebrow>
            <Heading id="hub-expertises-title" level={1} className="mt-4">
              {hub.headlineLead}{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                {hub.headlineHighlight}
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              {hub.description}
            </p>
          </div>

          <ul className="mt-16 grid gap-8 sm:grid-cols-2">
            {expertises.map(
              ({ slug, iconKey, title, punchline, competences }) => (
                <li key={slug}>
                  <Link
                    href={`/expertises/${slug}`}
                    className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                  >
                    <Card
                      as="article"
                      interactive
                      className="flex h-full flex-col gap-6 p-8"
                    >
                      <div className="flex items-start justify-between gap-4">
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
                        {title}
                      </Heading>

                      <p className="text-[var(--color-ol-graphite)]/80">
                        {punchline}
                      </p>

                      <ul className="mt-auto space-y-1.5 text-sm text-[var(--color-ol-graphite)]/65">
                        {competences.slice(0, 3).map((c) => (
                          <li
                            key={c}
                            className="flex items-baseline gap-2 before:mt-1.5 before:block before:h-1 before:w-1 before:flex-shrink-0 before:rounded-full before:bg-[var(--color-ol-orange)]"
                          >
                            {c}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </Container>
      </section>

      <Methodologie content={methodologieContent} />

      <AuditIaCta />
    </main>
  );
}
