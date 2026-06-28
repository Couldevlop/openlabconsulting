import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { WHITEPAPER_SLUGS } from '@/lib/validation';
import { alternatesFor } from '@/lib/seo/site';

/**
 * Page de remerciement après soumission du formulaire de capture
 * email (`POST /api/whitepapers/request`).
 *
 * Le PDF stub est servi statique depuis `/public/whitepapers/<slug>.pdf`.
 * Quand le binding Payload + URL signée MinIO sera en place (cf. spec
 * `collections/Whitepapers.ts` + audit §11 partiel), cette page
 * deviendra la cible d'une redirection 302 vers l'URL signée à
 * expiration.
 */

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const WHITEPAPER_TITLES: Record<string, string> = {
  'ia-souveraine-ci-2026': 'L’IA souveraine en Côte d’Ivoire',
};

export function generateStaticParams(): { slug: string }[] {
  return WHITEPAPER_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const title = WHITEPAPER_TITLES[slug];
  if (!title) return { title: 'Livre blanc : Merci' };
  return {
    title: `Merci : ${title}`,
    description: `Votre PDF est prêt à télécharger.`,
    alternates: alternatesFor(`/livres-blancs/${slug}/merci`),
    robots: { index: false, follow: false },
  };
}

export default async function WhitepaperThanksPage({
  params,
}: RouteParams): Promise<React.ReactElement> {
  const { slug } = await params;
  if (!WHITEPAPER_SLUGS.includes(slug as (typeof WHITEPAPER_SLUGS)[number])) {
    notFound();
  }
  const title = WHITEPAPER_TITLES[slug] ?? 'Livre blanc';
  const pdfUrl = `/whitepapers/${slug}.pdf`;

  return (
    <main id="main">
      <section
        aria-labelledby="merci-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <Link
            href={`/livres-blancs/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange)]"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Page du livre blanc
          </Link>

          <div className="mx-auto mt-10 max-w-2xl">
            <Badge tone="orange">Demande reçue</Badge>
            <Heading id="merci-title" level={1} className="mt-4">
              Merci. Votre PDF est prêt.
            </Heading>
            <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/80">
              <span className="font-medium text-[var(--color-ol-night)]">
                {title}
              </span>
              , vous pouvez le télécharger immédiatement ci-dessous. Une copie
              vous sera également envoyée par email dans les prochaines heures
              ouvrées.
            </p>

            <Card className="mt-10 border-[var(--color-ol-mist)] bg-white p-8 sm:p-10">
              <Eyebrow tone="orange">Téléchargement</Eyebrow>
              <Heading level={2} visualLevel={3} className="mt-3">
                Accès direct au PDF.
              </Heading>
              <p className="mt-3 text-sm text-[var(--color-ol-graphite)]/70">
                Conservez ce lien, il reste valide. Si le téléchargement ne
                démarre pas automatiquement, cliquez sur le bouton ci-dessous.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  as="a"
                  href={pdfUrl}
                  variant="primary"
                  size="lg"
                  download
                >
                  <Download width={20} height={20} aria-hidden />
                  Télécharger le PDF
                </Button>
                <p className="flex items-center gap-2 text-xs text-[var(--color-ol-graphite)]/55">
                  <Mail width={14} height={14} aria-hidden />
                  Copie envoyée par email
                </p>
              </div>
            </Card>

            <div className="mt-10 flex flex-col gap-2 text-sm text-[var(--color-ol-graphite)]/70">
              <p>
                <Link
                  href="/audit-ia"
                  className="font-medium text-[var(--color-ol-orange)] underline-offset-4 hover:underline"
                >
                  → Demander un audit IA gratuit
                </Link>
                , 30 min avec un consultant senior, ROI estimé, prochaines
                étapes activables.
              </p>
              <p>
                <Link
                  href="/laboratoire/publications"
                  className="font-medium text-[var(--color-ol-orange)] underline-offset-4 hover:underline"
                >
                  → Voir toutes les publications OpenLab
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
