import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import { JsonLd } from '@/components/seo/JsonLd';
import { PRODUCTS, getProductBySlug } from '@/lib/data/products';
import { breadcrumbSchema, softwareApplicationSchema } from '@/lib/seo/schema';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: 'Produit introuvable' };
  }
  return {
    title: `${product.name} — Solution OpenLab`,
    description: product.tagline,
    alternates: { canonical: `/solutions/${product.slug}` },
  };
}

export default async function SolutionDetailPage({
  params,
}: RouteParams): Promise<React.ReactElement> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }
  const {
    Icon,
    name,
    tagline,
    target,
    status,
    statusLabel,
    eyebrow,
    intro,
    problem,
    features,
    stack,
    proofs,
    expertisesLies,
  } = product;

  return (
    <main id="main">
      <JsonLd
        data={[
          softwareApplicationSchema(product),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Solutions', url: '/solutions' },
            { name: product.name, url: `/solutions/${product.slug}` },
          ]),
        ]}
      />
      {/* Hero */}
      <section
        aria-labelledby="solution-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <Link
            href="/solutions"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Tous les produits
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)] ring-1 ring-[var(--color-ol-orange)]/20"
                >
                  <Icon width={32} height={32} aria-hidden />
                </span>
                <Badge tone={status}>{statusLabel}</Badge>
              </div>

              <Eyebrow tone="orange" className="mt-6">
                {eyebrow}
              </Eyebrow>
              <Heading id="solution-title" level={1} className="mt-3">
                {name}
              </Heading>
              <p className="mt-3 font-[family-name:var(--font-editorial)] text-xl text-[var(--color-ol-orange)] italic sm:text-2xl">
                {tagline}
              </p>
              <p className="mt-2 text-sm tracking-widest text-[var(--color-ol-graphite)]/55 uppercase">
                {target}
              </p>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
                {intro}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button as="a" href="/audit-ia" variant="primary" size="lg">
                  Demander une démo
                  <ArrowUpRight width={20} height={20} aria-hidden />
                </Button>
                <Button as="a" href="/contact" variant="ghost" size="lg">
                  Parler à l’équipe produit
                </Button>
              </div>
            </div>

            <MediaPlaceholder
              src={null}
              alt={`Capture d’écran ${name}`}
              tone="neutral"
              aspect="3/2"
              placeholderLabel={`Mockup ${name}`}
              className="shadow-xl"
            />
          </div>
        </Container>
      </section>

      {/* Preuves chiffrées — uniquement si sourced (§4.10) */}
      {proofs && proofs.length > 0 ? (
        <section
          aria-label="Résultats mesurés"
          data-testid="solution-proofs"
          className="border-y border-[var(--color-ol-mist)] bg-white py-16"
        >
          <Container width="wide">
            <ul className="grid gap-x-12 gap-y-10 sm:grid-cols-3">
              {proofs.map((proof) => (
                <li key={proof.label}>
                  <span className="block font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ol-orange)] sm:text-5xl">
                    {proof.value}
                  </span>
                  <span className="mt-2 block text-base font-medium text-[var(--color-ol-night)]">
                    {proof.label}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--color-ol-graphite)]/55">
                    {proof.source}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Problème + Features */}
      <section
        aria-labelledby="probleme-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <Eyebrow tone="orange">Le problème</Eyebrow>
              <Heading id="probleme-title" level={2} className="mt-4">
                Avant {name}.
              </Heading>
              <p className="mt-6 font-[family-name:var(--font-editorial)] text-lg leading-relaxed text-[var(--color-ol-graphite)]/85 italic sm:text-xl">
                {problem}
              </p>
            </div>

            <div>
              <Eyebrow tone="orange">Ce que livre {name}</Eyebrow>
              <Heading level={2} className="mt-4" visualLevel={3}>
                Quatre piliers concrets.
              </Heading>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                {features.map(({ Icon: FIcon, title, body }) => (
                  <li key={title}>
                    <Card className="flex h-full flex-col gap-3 p-6">
                      <span
                        aria-hidden
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)]"
                      >
                        <FIcon width={20} height={20} aria-hidden />
                      </span>
                      <Heading level={3} visualLevel={4}>
                        {title}
                      </Heading>
                      <p className="text-sm text-[var(--color-ol-graphite)]/75">
                        {body}
                      </p>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Stack technique */}
      <section
        aria-labelledby="stack-title"
        className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-20 text-[var(--color-ol-ivory)] sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-32 -z-10 h-[400px] w-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,90,0,0.14), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <Container width="wide">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <Eyebrow tone="orange">Stack & architecture</Eyebrow>
              <Heading
                id="stack-title"
                level={2}
                className="mt-4 text-[var(--color-ol-ivory)]"
              >
                Construit pour durer.
              </Heading>
              <p className="mt-4 text-[var(--color-ol-ivory)]/80">
                Aucune dépendance propriétaire fermée. Aucun lock-in cloud.
                Déploiement K3s identique en pré-prod, prod et démo.
              </p>
            </div>

            <ul className="space-y-3">
              {stack.map((line) => (
                <li
                  key={line}
                  className="flex items-baseline gap-3 border-l-2 border-[var(--color-ol-orange)]/50 pl-4 font-[family-name:var(--font-mono)] text-sm text-[var(--color-ol-ivory)]/90"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Expertises liées */}
      {expertisesLies.length > 0 ? (
        <section
          aria-labelledby="expertises-lies-title"
          className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
        >
          <Container width="wide">
            <div className="max-w-2xl">
              <Eyebrow tone="orange">Expertises associées</Eyebrow>
              <Heading id="expertises-lies-title" level={2} className="mt-4">
                Le produit ne vit pas seul.
              </Heading>
              <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
                Chacune de nos missions de conseil mobilise une ou plusieurs de
                ces expertises pour rendre {name} pleinement opérationnel chez
                vous.
              </p>
            </div>

            <ul className="mt-10 flex flex-wrap gap-4">
              {expertisesLies.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/expertises/${e.slug}`}
                    className="group inline-flex items-center gap-2 rounded-md border border-[var(--color-ol-mist)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-ol-night)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-ol-orange)]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
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

      {/* Autres produits — cross-sell */}
      <section
        aria-labelledby="autres-produits-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <Eyebrow tone="orange">Continuer</Eyebrow>
              <Heading id="autres-produits-title" level={2} className="mt-4">
                Les autres produits OpenLab.
              </Heading>
            </div>
            <Link
              href="/solutions"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)] hover:text-[var(--color-ol-orange-dark)]"
            >
              Hub solutions
              <ArrowUpRight width={16} height={16} aria-hidden />
            </Link>
          </div>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.filter((p) => p.slug !== slug)
              .slice(0, 6)
              .map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/solutions/${other.slug}`}
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
