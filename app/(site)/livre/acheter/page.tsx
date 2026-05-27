import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BellRing, Check } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { BOOK, PURCHASE_CHANNELS } from '@/lib/data/book';

const NOTIFY_HREF = '/contact?sujet=notification-livre';

export const metadata: Metadata = {
  title: `À paraître — ${BOOK.title}`,
  description:
    'Le livre paraît en 2026. Découvrez les canaux de diffusion prévus (PDF + ePub direct OpenLab, Amazon, Lulu, librairies de Côte d’Ivoire) et faites-vous prévenir dès sa sortie.',
  alternates: { canonical: '/livre/acheter' },
};

// Ce que l'édition numérique inclura à la sortie.
const BUNDLE_FEATURES = [
  'PDF + ePub téléchargeables après achat, sans DRM',
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
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange-text)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Page du livre
          </Link>

          <div className="mt-10 max-w-3xl">
            <Eyebrow tone="orange">À paraître · 2026</Eyebrow>
            <Heading id="acheter-title" level={1} className="mt-4">
              {BOOK.title}.{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                Réservez votre exemplaire
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              {BOOK.subtitle} — {BOOK.edition}. L’ouvrage est en cours de
              finalisation. À sa sortie, il sera diffusé en numérique (PDF +
              ePub direct OpenLab) puis en imprimé via Amazon, Lulu et les
              librairies partenaires d’Abidjan. Laissez-nous votre contact pour
              être prévenu·e en priorité.
            </p>
            <div className="mt-8">
              <Button as="a" href={NOTIFY_HREF} variant="primary" size="lg">
                <BellRing width={20} height={20} aria-hidden />
                Être prévenu·e à la sortie
              </Button>
            </div>
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
              <Badge tone="orange">Édition numérique directe</Badge>
              <Heading id="bundle-title" level={2} className="mt-4">
                Bouquet OpenLab — PDF + ePub direct.
              </Heading>
              <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/80">
                Sans intermédiaire, sans DRM, sans tracking tiers. À la sortie,
                vous achèterez directement auprès d’OpenLab, vous téléchargerez
                immédiatement et vous lirez où vous voulez sur tous vos
                appareils.
              </p>

              <ul className="mt-8 space-y-3">
                {BUNDLE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-ol-orange)]/15 text-[var(--color-ol-orange-text)]"
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
                <Button as="a" href={NOTIFY_HREF} variant="primary" size="lg">
                  <BellRing width={20} height={20} aria-hidden />
                  Être prévenu·e à la sortie
                </Button>
                <p className="text-sm text-[var(--color-ol-graphite)]/60">
                  Le paiement en ligne (PDF + ePub) ouvrira à la parution. D’ici
                  là,{' '}
                  <Link
                    href="/contact?sujet=achat-livre"
                    className="font-medium text-[var(--color-ol-orange-text)] underline-offset-2 hover:underline"
                  >
                    écrivez-nous
                  </Link>{' '}
                  pour une commande anticipée.
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
                    Parution
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

      {/* Canaux de diffusion prévus */}
      <section
        aria-labelledby="autres-canaux-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Les canaux prévus</Eyebrow>
            <Heading id="autres-canaux-title" level={2} className="mt-4">
              Plusieurs canaux de diffusion, à la sortie.
            </Heading>
            <p className="mt-4 text-[var(--color-ol-graphite)]/75">
              Selon votre zone géographique et votre préférence. Les liens
              d’achat seront activés dès la parution.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PURCHASE_CHANNELS.filter((c) => !c.primary).map((channel) => (
              <li key={channel.name}>
                <Card as="article" className="flex h-full flex-col gap-4 p-7">
                  <div className="flex items-center justify-between gap-3">
                    <Heading level={3} visualLevel={4}>
                      {channel.name}
                    </Heading>
                    <Badge tone="neutral">À venir</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-ol-graphite)]/75">
                    {channel.description}
                  </p>
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
              À la sortie, le livre sera disponible au stock dans les enseignes
              partenaires suivantes :
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
