import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { AuditIaCtaServer } from '@/components/sections/AuditIaCtaServer';
import { Badge } from '@/components/atoms/Badge';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import { Mockup } from '@/components/atoms/Mockup';
import { ProductDemo, hasProductDemo } from '@/components/demos/ProductDemo';
import { DemoRequestModal } from '@/components/forms/DemoRequestModal';
import {
  ProductMockup,
  hasProductMockup,
} from '@/components/mockups/ProductMockup';
import { JsonLd } from '@/components/seo/JsonLd';
import { DynamicIcon } from '@/lib/icon-map';
import { PRODUCTS } from '@/lib/data/products';
import { getProductBySlug } from '@/lib/products-server';
import { getCaseStudyForProduct } from '@/lib/case-studies-server';
import {
  breadcrumbSchema,
  faqPageSchema,
  softwareApplicationSchema,
} from '@/lib/seo/schema';

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
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'Produit introuvable' };
  }
  return {
    title: `${product.name} — Solution OpenLab`,
    description: product.tagline,
    alternates: { canonical: `/solutions/${product.slug}` },
  };
}

// Captures d'écran produit réelles (assets statiques public/). Affichées dans
// le hero à la place du placeholder « mockup ». À enrichir au fil des visuels
// disponibles (clé = slug produit).
const SOLUTION_SCREENSHOTS: Record<string, string> = {
  nexusrh: '/solutions/nexusrh.png',
};

export default async function SolutionDetailPage({
  params,
}: RouteParams): Promise<React.ReactElement> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }
  const {
    iconKey,
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
    pricing,
    faq,
    expertisesLies,
  } = product;
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const caseStudy = await getCaseStudyForProduct(product.slug);
  const screenshot = SOLUTION_SCREENSHOTS[product.slug] ?? null;

  return (
    <main id="main">
      <JsonLd
        nonce={nonce}
        data={[
          softwareApplicationSchema(product),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Solutions', url: '/solutions' },
            { name: product.name, url: `/solutions/${product.slug}` },
          ]),
          faqPageSchema(faq),
        ]}
      />
      <Breadcrumbs
        items={[
          { label: 'Solutions', href: '/solutions' },
          { label: product.name },
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
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange-text)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Tous les produits
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)] ring-1 ring-[var(--color-ol-orange)]/20"
                >
                  <DynamicIcon
                    name={iconKey}
                    width={32}
                    height={32}
                    aria-hidden
                  />
                </span>
                <Badge tone={status}>{statusLabel}</Badge>
              </div>

              <Eyebrow tone="orange" className="mt-6">
                {eyebrow}
              </Eyebrow>
              <Heading id="solution-title" level={1} className="mt-3">
                {name}
              </Heading>
              <p className="mt-3 font-[family-name:var(--font-editorial)] text-xl text-[var(--color-ol-orange-text)] italic sm:text-2xl">
                {tagline}
              </p>
              <p className="mt-2 text-sm tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
                {target}
              </p>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
                {intro}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <DemoRequestModal
                  productSlug={product.slug}
                  productName={name}
                />
                <Button as="a" href="/contact" variant="ghost" size="lg">
                  Parler à l’équipe produit
                </Button>
              </div>
            </div>

            {screenshot ? (
              // Capture d'écran réelle (ex. NexusRH) — la plus convaincante.
              <Mockup
                variant="dashboard"
                tone="orange"
                aspect="16/9"
                label={name}
                src={screenshot}
                alt={`Capture d’écran ${name}`}
                className="shadow-xl"
              />
            ) : hasProductMockup(product.slug) ? (
              // Mockup SVG dédié — signature visuelle propre (§7.1).
              <Mockup
                variant="dashboard"
                tone="orange"
                aspect="16/9"
                label={name}
                className="shadow-xl"
              >
                <ProductMockup slug={product.slug} />
              </Mockup>
            ) : (
              // Produit créé depuis l'admin sans visuel dédié encore.
              <MediaPlaceholder
                src={null}
                alt={`Capture d’écran ${name}`}
                tone="neutral"
                aspect="3/2"
                placeholderLabel={`Mockup ${name}`}
                className="shadow-xl"
              />
            )}
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
                  <span className="block font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-5xl">
                    {proof.value}
                  </span>
                  <span className="mt-2 block text-base font-medium text-[var(--color-ol-night)]">
                    {proof.label}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--color-ol-graphite)]/70">
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
                {features.map(({ iconKey: featureIconKey, title, body }) => (
                  <li key={title}>
                    <Card className="flex h-full flex-col gap-3 p-6">
                      <span
                        aria-hidden
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                      >
                        <DynamicIcon
                          name={featureIconKey}
                          width={20}
                          height={20}
                          aria-hidden
                        />
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

      {/* Démo interactive — §7.2. Masquée si le produit (créé depuis
          l'admin) n'a pas encore de démo enregistrée dans le registre. */}
      {hasProductDemo(product.slug) ? (
        <section
          aria-labelledby="demo-title"
          data-testid="solution-demo"
          className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
        >
          <Container width="wide">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="orange">Démo interactive</Eyebrow>
              <Heading id="demo-title" level={2} className="mt-4">
                Touchez-y. Pas une vidéo.
              </Heading>
              <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
                Tournée en local dans votre navigateur. Aucune donnée envoyée
                sur nos serveurs. C’est ce que vivent vos équipes au quotidien.
              </p>
            </div>
            <div className="mt-12">
              <ProductDemo slug={product.slug} />
            </div>
          </Container>
        </section>
      ) : null}

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

      {/* Cas client — §7.1 (#7). Affiché uniquement si un cas réel existe. */}
      {caseStudy ? (
        <section
          aria-labelledby="cas-client-title"
          data-testid="solution-case-study"
          className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
        >
          <Container width="wide">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
              <div>
                <Eyebrow tone="orange">Cas client</Eyebrow>
                <Heading id="cas-client-title" level={2} className="mt-4">
                  {caseStudy.headline}
                </Heading>
                <p className="mt-4 font-[family-name:var(--font-editorial)] text-xl text-[var(--color-ol-orange-text)] italic sm:text-2xl">
                  {caseStudy.punchline}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Badge tone="orange">{caseStudy.sector}</Badge>
                  <span className="text-sm text-[var(--color-ol-graphite)]/70">
                    {caseStudy.client}
                  </span>
                </div>
                <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
                  {caseStudy.body}
                </p>
              </div>

              <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-[var(--color-ol-mist)] sm:grid-cols-3">
                {caseStudy.results.map((r) => (
                  <li
                    key={r.label}
                    className="flex flex-col justify-center bg-white p-6 text-center sm:p-8"
                  >
                    <span className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-4xl">
                      {r.value}
                    </span>
                    <span className="mt-2 text-sm text-[var(--color-ol-graphite)]/70">
                      {r.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      ) : null}

      {/* Tarification — §7.1 */}
      <section
        aria-labelledby="pricing-title"
        data-testid="solution-pricing"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow tone="orange">Tarification</Eyebrow>
            <Heading id="pricing-title" level={2} className="mt-4">
              Transparent, sans surprise.
            </Heading>
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-8 shadow-sm sm:p-10">
            <Badge tone="orange">
              {pricing.model === 'saas'
                ? 'SaaS · abonnement mensuel'
                : pricing.model === 'license'
                  ? 'Licence + maintenance'
                  : 'Sur devis'}
            </Badge>

            <p
              data-testid="pricing-headline"
              className="mt-5 font-[family-name:var(--font-display)] text-2xl leading-tight font-semibold text-[var(--color-ol-night)] sm:text-3xl"
            >
              {pricing.headline}
            </p>

            <ul className="mt-8 space-y-3 text-[var(--color-ol-graphite)]/85">
              {pricing.details.map((detail) => (
                <li key={detail} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-ol-orange)]/15 text-[var(--color-ol-orange-text)]"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M2 6.5 5 9.5l5-7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            {pricing.note ? (
              <p className="mt-8 border-t border-[var(--color-ol-mist)] pt-6 text-sm text-[var(--color-ol-graphite)]/70">
                {pricing.note}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href="/contact" variant="primary" size="md">
                Demander un devis
              </Button>
              <DemoRequestModal
                productSlug={product.slug}
                productName={name}
                triggerLabel="Réserver une démo"
                triggerVariant="ghost"
                triggerSize="md"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ — Schema.org FAQPage */}
      <section
        aria-labelledby="faq-title"
        data-testid="solution-faq"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="narrow">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">FAQ</Eyebrow>
            <Heading id="faq-title" level={2} className="mt-4">
              Les questions qui reviennent.
            </Heading>
            <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
              Pas dans la liste ? Écrivez-nous, on répond personnellement.
            </p>
          </div>

          <ul className="mt-12 space-y-3">
            {faq.map((item) => (
              <li key={item.question}>
                <details className="group rounded-lg border border-[var(--color-ol-mist)] bg-white p-6 transition-colors hover:border-[var(--color-ol-orange)]/40">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium text-[var(--color-ol-night)]">
                    <span>{item.question}</span>
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)] transition-transform group-open:rotate-45"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M7 2.5v9M2.5 7h9"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-[var(--color-ol-graphite)]/80">
                    {item.answer}
                  </p>
                </details>
              </li>
            ))}
          </ul>
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
                      className="text-[var(--color-ol-orange-text)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange-text)] hover:text-[var(--color-ol-orange-dark)]"
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
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                      >
                        <DynamicIcon
                          name={other.iconKey}
                          width={20}
                          height={20}
                          aria-hidden
                        />
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

      <AuditIaCtaServer />
    </main>
  );
}
