import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { BOOK, PURCHASE_CHANNELS } from '@/lib/data/book';

export const metadata: Metadata = {
  title: `Acheter — ${BOOK.title}`,
  description:
    'PDF + ePub direct OpenLab, Amazon, Lulu impression à la demande, librairies de Côte d’Ivoire. Choisissez le canal qui vous convient.',
  alternates: { canonical: '/livre/acheter' },
};

const BUNDLE_FEATURES = [
  'PDF + ePub livrés immédiatement après paiement Stripe',
  'Accès à toutes les mises à jour mineures de l’édition courante',
  'Code source GitHub et datasets companion inclus',
  'Réception d’un erratum trimestriel par e-mail (opt-in)',
];

export default function LivreAcheterPage(): React.ReactElement {
  return (
    <main id="main">
      {/* Hero */}
      <section
        aria-labelledby="acheter-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <Link
            href="/livre"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Page du livre
          </Link>

          <div className="mt-10 max-w-3xl">
            <Eyebrow tone="orange">Acheter le livre</Eyebrow>
            <Heading id="acheter-title" level={1} className="mt-4">
              {BOOK.title}.{' '}
              <span className="text-[var(--color-ol-orange)]">
                Quatre canaux disponibles
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              {BOOK.subtitle} — {BOOK.edition}. Choisissez le canal qui
              correspond à votre contexte : bouquet OpenLab direct (numérique),
              Amazon (numérique + imprimé Europe), Lulu (imprimé à la demande
              mondial), ou librairies physiques ivoiriennes.
            </p>
          </div>
        </Container>
      </section>

      {/* Bouquet direct OpenLab — mise en avant */}
      <section
        id="openlab-direct"
        aria-labelledby="bundle-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-20">
            <div>
              <Badge tone="orange">Recommandé</Badge>
              <Heading id="bundle-title" level={2} className="mt-4">
                Bouquet OpenLab — PDF + ePub direct.
              </Heading>
              <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/80">
                Sans intermédiaire, sans DRM, sans tracking tiers. Vous payez
                OpenLab directement, vous téléchargez immédiatement, vous lisez
                où vous voulez sur tous vos appareils.
              </p>

              <ul className="mt-8 space-y-3">
                {BUNDLE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-ol-orange)]/15 text-[var(--color-ol-orange)]"
                    >
                      <Check
                        width={14}
                        height={14}
                        aria-hidden
                        strokeWidth={3}
                      />
                    </span>
                    <span className="text-[var(--color-ol-graphite)]">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  aria-label="Acheter le bouquet OpenLab (paiement Stripe à venir)"
                >
                  <Sparkles width={20} height={20} aria-hidden />
                  Acheter PDF + ePub
                </Button>
                <p className="text-sm text-[var(--color-ol-graphite)]/60">
                  Stripe Checkout intégré en P8. Pour l’instant, contactez{' '}
                  <Link
                    href="/contact?sujet=achat-livre"
                    className="font-medium text-[var(--color-ol-orange)] underline-offset-2 hover:underline"
                  >
                    notre équipe
                  </Link>
                  .
                </p>
              </div>
            </div>

            <Card className="bg-[var(--color-ol-ivory)] p-8">
              <Eyebrow tone="orange">Spécifications</Eyebrow>
              <dl className="mt-6 divide-y divide-[var(--color-ol-mist)]">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-[var(--color-ol-graphite)]/65">
                    Édition
                  </dt>
                  <dd className="text-sm font-medium text-[var(--color-ol-night)]">
                    {BOOK.edition}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-[var(--color-ol-graphite)]/65">
                    Pages
                  </dt>
                  <dd className="text-sm font-medium text-[var(--color-ol-night)]">
                    ~{BOOK.pageCount}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-[var(--color-ol-graphite)]/65">
                    Langue
                  </dt>
                  <dd className="text-sm font-medium text-[var(--color-ol-night)]">
                    Français
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-[var(--color-ol-graphite)]/65">
                    Année
                  </dt>
                  <dd className="text-sm font-medium text-[var(--color-ol-night)]">
                    {BOOK.publicationYear}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-[var(--color-ol-graphite)]/65">
                    Capstone
                  </dt>
                  <dd className="text-sm font-medium text-[var(--color-ol-night)]">
                    {BOOK.capstone}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        </Container>
      </section>

      {/* Autres canaux */}
      <section
        aria-labelledby="autres-canaux-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Les autres canaux</Eyebrow>
            <Heading id="autres-canaux-title" level={2} className="mt-4">
              Selon votre zone géographique et votre préférence.
            </Heading>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PURCHASE_CHANNELS.filter((c) => !c.primary).map((channel) => (
              <li key={channel.name}>
                <Card as="article" className="flex h-full flex-col gap-4 p-7">
                  <Heading level={3} visualLevel={4}>
                    {channel.name}
                  </Heading>
                  <p className="text-sm text-[var(--color-ol-graphite)]/75">
                    {channel.description}
                  </p>
                  <Link
                    href={channel.href}
                    className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)] transition-colors hover:text-[var(--color-ol-orange-dark)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                  >
                    Y aller
                    <ArrowUpRight width={14} height={14} aria-hidden />
                  </Link>
                </Card>
              </li>
            ))}
          </ul>

          {/* Section libraires CI */}
          <div
            id="libraires-ci"
            className="mt-16 rounded-lg border border-[var(--color-ol-mist)] bg-white p-8"
          >
            <Heading level={3} visualLevel={4}>
              Librairies physiques en Côte d’Ivoire
            </Heading>
            <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/75">
              Pour acheter physiquement à Abidjan, le livre est disponible au
              stock dans les enseignes suivantes :
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--color-ol-graphite)]/80 sm:grid-cols-3">
              <li>· Carrefour Mercure — Plateau</li>
              <li>· Librairie de France — Yopougon</li>
              <li>· Librairie Aleph — Cocody</li>
            </ul>
          </div>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
