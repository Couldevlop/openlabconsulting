import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { JsonLd } from '@/components/seo/JsonLd';
import { SECTORS, getSectorBySlug } from '@/lib/data/sectors';
import { breadcrumbSchema, sectorPageSchema } from '@/lib/seo/schema';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return SECTORS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) {
    return { title: 'Secteur introuvable' };
  }
  return {
    title: `${sector.name} — Secteurs OpenLab`,
    description: sector.tagline,
    alternates: { canonical: `/secteurs/${sector.slug}` },
  };
}

export default async function SecteurDetailPage({
  params,
}: RouteParams): Promise<React.ReactElement> {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) {
    notFound();
  }
  const {
    Icon,
    name,
    tagline,
    intro,
    enjeux,
    regulation,
    produitsLies,
    expertisesLies,
  } = sector;

  return (
    <main id="main">
      <JsonLd
        data={[
          sectorPageSchema(sector),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Secteurs', url: '/secteurs' },
            { name: sector.name, url: `/secteurs/${sector.slug}` },
          ]),
        ]}
      />
      {/* Hero */}
      <section
        aria-labelledby="secteur-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <Link
            href="/secteurs"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Tous les secteurs
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-14">
            <span
              aria-hidden
              className="inline-flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)] ring-1 ring-[var(--color-ol-orange)]/20"
            >
              <Icon width={40} height={40} aria-hidden />
            </span>

            <div>
              <Eyebrow tone="orange">Secteur</Eyebrow>
              <Heading id="secteur-title" level={1} className="mt-4">
                {name}
              </Heading>
              <p className="mt-3 font-[family-name:var(--font-editorial)] text-xl text-[var(--color-ol-orange)] italic sm:text-2xl">
                {tagline}
              </p>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
                {intro}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Enjeux */}
      <section
        aria-labelledby="enjeux-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Les enjeux concrets</Eyebrow>
            <Heading id="enjeux-title" level={2} className="mt-4">
              Ce qui occupe vraiment vos équipes.
            </Heading>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
            {enjeux.map((enjeu) => (
              <li
                key={enjeu}
                className="flex items-start gap-3 rounded-lg border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-5"
              >
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-ol-orange)]/15 text-xs font-bold text-[var(--color-ol-orange)]"
                >
                  ›
                </span>
                <span className="text-[var(--color-ol-graphite)]">{enjeu}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Cadre réglementaire — fond night signature */}
      <section
        aria-labelledby="regulation-title"
        className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-20 text-[var(--color-ol-ivory)] sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 -z-10 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,90,0,0.14), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <Container width="wide">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div>
              <Eyebrow tone="orange">Cadre réglementaire</Eyebrow>
              <Heading
                id="regulation-title"
                level={2}
                className="mt-4 text-[var(--color-ol-ivory)]"
              >
                On opère dans votre référentiel.
              </Heading>
              <p className="mt-4 text-[var(--color-ol-ivory)]/80">
                Pas d’IA hors-cadre. Chaque déploiement OpenLab est conçu pour
                passer un audit régulateur sans aménagement supplémentaire.
              </p>
            </div>

            <ul className="space-y-3">
              {regulation.map((reg) => (
                <li
                  key={reg}
                  className="flex items-start gap-3 border-l-2 border-[var(--color-ol-orange)]/60 pl-4 text-[var(--color-ol-ivory)]/90"
                >
                  <ShieldCheck
                    width={18}
                    height={18}
                    aria-hidden
                    className="mt-0.5 flex-shrink-0 text-[var(--color-ol-orange)]"
                  />
                  <span>{reg}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Produits OpenLab liés */}
      {produitsLies.length > 0 ? (
        <section
          aria-labelledby="produits-title"
          className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
        >
          <Container width="wide">
            <div className="max-w-2xl">
              <Eyebrow tone="orange">Produits déployés sur ce secteur</Eyebrow>
              <Heading id="produits-title" level={2} className="mt-4">
                L’écosystème pertinent pour {name}.
              </Heading>
            </div>

            <ul className="mt-10 flex flex-wrap gap-4">
              {produitsLies.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/solutions/${p.slug}`}
                    className="group inline-flex items-center gap-2 rounded-md border border-[var(--color-ol-mist)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-ol-night)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-ol-orange)]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                  >
                    <Badge tone="orange">Produit</Badge>
                    {p.title}
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

      {/* Expertises liées */}
      {expertisesLies.length > 0 ? (
        <section
          aria-labelledby="expertises-title"
          className="bg-white py-20 sm:py-28"
        >
          <Container width="wide">
            <div className="max-w-2xl">
              <Eyebrow tone="orange">Expertises mobilisées</Eyebrow>
              <Heading id="expertises-title" level={2} className="mt-4">
                Les missions que nous menons pour {name}.
              </Heading>
            </div>

            <ul className="mt-10 flex flex-wrap gap-4">
              {expertisesLies.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/expertises/${e.slug}`}
                    className="group inline-flex items-center gap-2 rounded-md border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] px-5 py-3 text-sm font-medium text-[var(--color-ol-night)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-ol-orange)]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                  >
                    <Badge tone="orange">Expertise</Badge>
                    {e.title}
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

      {/* Autres secteurs */}
      <section
        aria-labelledby="autres-secteurs-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <Eyebrow tone="orange">Continuer</Eyebrow>
              <Heading id="autres-secteurs-title" level={2} className="mt-4">
                Les autres secteurs.
              </Heading>
            </div>
            <Link
              href="/secteurs"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)] hover:text-[var(--color-ol-orange-dark)]"
            >
              Hub secteurs
              <ArrowUpRight width={16} height={16} aria-hidden />
            </Link>
          </div>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SECTORS.filter((s) => s.slug !== slug).map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/secteurs/${other.slug}`}
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
                      {other.name}
                    </Heading>
                    <p className="text-sm text-[var(--color-ol-graphite)]/70">
                      {other.tagline}
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
