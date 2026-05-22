import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { JsonLd } from '@/components/seo/JsonLd';
import { EXPERTISES, getExpertiseBySlug } from '@/lib/data/expertises';
import { breadcrumbSchema, serviceSchema } from '@/lib/seo/schema';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return EXPERTISES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const expertise = getExpertiseBySlug(slug);
  if (!expertise) {
    return { title: 'Expertise introuvable' };
  }
  return {
    title: `${expertise.title} — Expertise OpenLab`,
    description: expertise.punchline,
    alternates: { canonical: `/expertises/${expertise.slug}` },
  };
}

export default async function ExpertiseDetailPage({
  params,
}: RouteParams): Promise<React.ReactElement> {
  const { slug } = await params;
  const expertise = getExpertiseBySlug(slug);
  if (!expertise) {
    notFound();
  }
  const { Icon, title, punchline, intro, competences, approche, produitsLies } =
    expertise;
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <main id="main">
      <JsonLd
        nonce={nonce}
        data={[
          serviceSchema(expertise),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Expertises', url: '/expertises' },
            { name: expertise.title, url: `/expertises/${expertise.slug}` },
          ]),
        ]}
      />
      <Breadcrumbs
        items={[
          { label: 'Expertises', href: '/expertises' },
          { label: expertise.title },
        ]}
      />
      {/* Hero — fond ivory pour rester cohérent avec /expertises hub */}
      <section
        aria-labelledby="expertise-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <Link
            href="/expertises"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Toutes les expertises
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-14">
            <span
              aria-hidden
              className="inline-flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)] ring-1 ring-[var(--color-ol-orange)]/20"
            >
              <Icon width={40} height={40} aria-hidden />
            </span>

            <div>
              <Eyebrow tone="orange">Expertise OpenLab</Eyebrow>
              <Heading id="expertise-title" level={1} className="mt-4">
                {title}
              </Heading>
              <p className="mt-3 font-[family-name:var(--font-editorial)] text-xl text-[var(--color-ol-orange)] italic sm:text-2xl">
                {punchline}
              </p>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
                {intro}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Compétences couvertes */}
      <section
        aria-labelledby="competences-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Ce que ça couvre</Eyebrow>
            <Heading id="competences-title" level={2} className="mt-4">
              Concrètement, sur le terrain.
            </Heading>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
            {competences.map((c) => (
              <li
                key={c}
                className="flex items-start gap-3 rounded-lg border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-5"
              >
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-ol-orange)]/15 text-[var(--color-ol-orange)]"
                >
                  <Check width={14} height={14} aria-hidden strokeWidth={3} />
                </span>
                <span className="text-[var(--color-ol-graphite)]">{c}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Approche en 3 étapes — fond night signature */}
      <section
        aria-labelledby="approche-title"
        className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 -z-10 h-[480px] w-[480px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,90,0,0.18), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Notre approche</Eyebrow>
            <Heading
              id="approche-title"
              level={2}
              className="mt-4 text-[var(--color-ol-ivory)]"
            >
              Trois étapes. Pas une de plus.
            </Heading>
          </div>

          <ol className="mt-16 grid gap-x-12 gap-y-12 lg:grid-cols-3 lg:divide-x lg:divide-[var(--color-ol-ivory)]/10">
            {approche.map(({ step, title: stepTitle, body }) => (
              <li
                key={step}
                className="flex flex-col gap-4 lg:px-8 lg:first:pl-0 lg:last:pr-0"
              >
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ol-orange)] sm:text-5xl"
                >
                  {step}
                </span>
                <Heading
                  level={3}
                  visualLevel={4}
                  className="text-[var(--color-ol-ivory)]"
                >
                  {stepTitle}
                </Heading>
                <p className="text-[var(--color-ol-ivory)]/80">{body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Produits OpenLab liés */}
      {produitsLies.length > 0 ? (
        <section
          aria-labelledby="produits-lies-title"
          className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
        >
          <Container width="wide">
            <div className="max-w-2xl">
              <Eyebrow tone="orange">L’écosystème associé</Eyebrow>
              <Heading id="produits-lies-title" level={2} className="mt-4">
                Les produits OpenLab qui prolongent cette expertise.
              </Heading>
              <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
                Pas une intégration tierce : ces produits sont issus de la même
                équipe et partagent les mêmes principes de sécurité, gouvernance
                et déploiement K3s.
              </p>
            </div>

            <ul className="mt-10 flex flex-wrap gap-4">
              {produitsLies.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/solutions/${p.slug}`}
                    className="group inline-flex items-center gap-2 rounded-md border border-[var(--color-ol-mist)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-ol-night)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-ol-orange)]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                  >
                    <Badge tone="orange">Produit</Badge>
                    {p.name}
                    <ArrowUpRight
                      width={14}
                      height={14}
                      aria-hidden
                      className="text-[var(--color-ol-orange)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Autres expertises — cross-sell */}
      <section
        aria-labelledby="autres-expertises-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <Eyebrow tone="orange">Continuer</Eyebrow>
              <Heading id="autres-expertises-title" level={2} className="mt-4">
                Les autres expertises.
              </Heading>
            </div>
            <Link
              href="/expertises"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)] hover:text-[var(--color-ol-orange-dark)]"
            >
              Hub expertises
              <ArrowUpRight width={16} height={16} aria-hidden />
            </Link>
          </div>

          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {EXPERTISES.filter((e) => e.slug !== slug).map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/expertises/${other.slug}`}
                  className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                >
                  <Card
                    as="article"
                    interactive
                    className="flex h-full flex-col gap-3"
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)]"
                    >
                      <other.Icon width={20} height={20} aria-hidden />
                    </span>
                    <Heading level={3} visualLevel={4}>
                      {other.title}
                    </Heading>
                    <p className="text-sm text-[var(--color-ol-graphite)]/70">
                      {other.punchline}
                    </p>
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
