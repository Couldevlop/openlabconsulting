import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { cn } from '@/lib/cn';

interface Whitepaper {
  slug: string;
  title: string;
  subtitle: string;
  audience: string;
  pageCount: number;
  pillars: readonly string[];
  pitch: readonly string[];
  status: 'draft' | 'published';
  publicationLabel: string;
  /** Couverture (chemin public). Affichée dans le hero si présente. */
  cover?: { src: string; width: number; height: number };
}

/**
 * Placeholder /livres-blancs/[slug] — sera remplacé par la collection
 * Payload `whitepapers` quand la DB sera initialisée (P6 binding).
 * Pour l'instant, on hard-code le seul livre blanc en cours pour que
 * le CTA depuis AuditIaCta ne 404 pas.
 */
const WHITEPAPERS: Record<string, Whitepaper> = {
  'ia-souveraine-ci-2026': {
    slug: 'ia-souveraine-ci-2026',
    title: 'L’IA souveraine en Côte d’Ivoire',
    subtitle: 'Feuille de route pratique pour les dirigeants en 2026',
    audience: 'Dirigeants, DSI, RSSI · Côte d’Ivoire et UEMOA',
    pageCount: 25,
    pillars: [
      'Cartographie des cas d’usage IA prioritaires en Afrique francophone',
      'Cadre de gouvernance compatible loi 2013-450 et RGPD',
      'Stack technique souveraine (K3s, RAG fermé, données sous contrôle maîtrisé)',
      'Plan de bascule progressive en 6 mois',
    ],
    pitch: [
      'Le livre blanc qu’un comité de direction lit en deux heures et applique en six mois.',
      'Quatre piliers, douze décisions clés, six pièges à éviter — tirés de déploiements réels dans la zone UEMOA.',
      'Pas de buzz, pas de modèles fantaisistes. Une grille de lecture pour décider, pas pour rêver.',
    ],
    status: 'draft',
    publicationLabel: 'En rédaction — sortie prévue T2 2026',
    cover: {
      src: '/livres-blancs/ia-souveraine-couverture.webp',
      width: 1024,
      height: 1536,
    },
  },
};

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return Object.keys(WHITEPAPERS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const wp = WHITEPAPERS[slug];
  if (!wp) return { title: 'Livre blanc introuvable' };
  return {
    title: `${wp.title} — ${wp.subtitle}`,
    description: wp.pitch[0],
    alternates: { canonical: `/livres-blancs/${wp.slug}` },
    openGraph: {
      title: `${wp.title} · ${wp.subtitle}`,
      description: wp.pitch[0],
      type: 'article',
      ...(wp.cover
        ? {
            images: [
              {
                url: wp.cover.src,
                width: wp.cover.width,
                height: wp.cover.height,
                alt: `Couverture du livre blanc « ${wp.title} »`,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function WhitepaperPage({
  params,
}: RouteParams): Promise<React.ReactElement> {
  const { slug } = await params;
  const wp = WHITEPAPERS[slug];
  if (!wp) notFound();

  return (
    <main id="main">
      {/* Hero */}
      <section
        aria-labelledby="wp-title"
        className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 -z-10 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,90,0,0.20), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <Container width="wide">
          <Link
            href="/audit-ia"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-ivory)]/70 transition-colors hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ol-night)]"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Page audit IA
          </Link>

          <div
            className={cn(
              'mt-10 grid gap-12 lg:items-center lg:gap-16',
              wp.cover
                ? 'lg:grid-cols-[0.7fr_1.3fr]'
                : 'lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20',
            )}
          >
            {wp.cover ? (
              <div className="mx-auto w-full max-w-[17rem] lg:mx-0">
                <Image
                  src={wp.cover.src}
                  alt={`Couverture du livre blanc « ${wp.title} — ${wp.subtitle} »`}
                  width={wp.cover.width}
                  height={wp.cover.height}
                  priority
                  sizes="(min-width: 1024px) 17rem, (min-width: 640px) 50vw, 75vw"
                  className="h-auto w-full rounded-lg shadow-2xl ring-1 ring-[var(--color-ol-ivory)]/10"
                />
              </div>
            ) : null}

            <div>
              <Badge tone="orange">Livre blanc · 2026</Badge>
              <Heading
                id="wp-title"
                level={1}
                className="mt-4 text-[var(--color-ol-ivory)]"
              >
                {wp.title}
              </Heading>
              <p className="mt-3 font-[family-name:var(--font-editorial)] text-2xl text-[var(--color-ol-orange)] italic sm:text-3xl">
                {wp.subtitle}
              </p>
              <p className="mt-4 text-sm tracking-widest text-[var(--color-ol-ivory)]/60 uppercase">
                {wp.audience}
              </p>

              <div className="mt-6 space-y-4 text-lg leading-relaxed text-[var(--color-ol-ivory)]/85">
                {wp.pitch.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4 piliers */}
      <section
        aria-labelledby="wp-pillars-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Au sommaire</Eyebrow>
            <Heading id="wp-pillars-title" level={2} className="mt-4">
              Quatre piliers, douze décisions.
            </Heading>
          </div>

          <ol className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:gap-y-12">
            {wp.pillars.map((pillar, i) => (
              <li
                key={pillar}
                className="border-t-2 border-[var(--color-ol-orange)] pt-6"
              >
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ol-orange)] sm:text-4xl"
                >{`0${i + 1}`}</span>
                <p className="mt-3 text-lg text-[var(--color-ol-night)]">
                  {pillar}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Téléchargement gating email */}
      <section
        aria-labelledby="wp-download-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <Card className="border-[var(--color-ol-mist)] bg-white p-8 sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <Eyebrow tone="orange">À la sortie</Eyebrow>
                <Heading id="wp-download-title" level={2} className="mt-4">
                  Le livre blanc, gratuit, dès sa parution.
                </Heading>
                <p className="mt-4 text-[var(--color-ol-graphite)]/80">
                  {wp.publicationLabel}. À sa sortie, le PDF (~{wp.pageCount}{' '}
                  pages) sera accessible gratuitement contre un simple email
                  professionnel. Laissez-nous votre contact pour le recevoir en
                  priorité.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  as="a"
                  href={`/contact?sujet=livre-blanc-${wp.slug}`}
                  variant="primary"
                  size="lg"
                  aria-label="Être prévenu de la sortie du livre blanc"
                >
                  <Mail width={20} height={20} aria-hidden />
                  Être prévenu·e à la sortie
                </Button>
                <p className="flex items-center gap-2 text-xs text-[var(--color-ol-graphite)]/55">
                  <Download width={14} height={14} aria-hidden />
                  PDF · ~{wp.pageCount} pages · français · gratuit
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
