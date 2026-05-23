import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import type { LocationContent } from '@/lib/data/locations';

/**
 * Template page géographique — audit P2 §7 #13.
 *
 * Architecture : hero + section présence + grille services + CTA.
 * Le contenu vient en totalité de `lib/data/locations.ts` ; ce composant
 * ne décide d'aucun texte, juste de la mise en page partagée par les
 * 3 landings (`/abidjan`, `/cocody`, `/uemoa`).
 *
 * Densité informationnelle conforme CLAUDE.md §4.5 (refus du « hero
 * vide + 5 sections corporate »).
 */
export function LocationPage({
  location,
}: {
  readonly location: LocationContent;
}): React.ReactElement {
  return (
    <main id="main">
      {/* Hero */}
      <section
        aria-labelledby="loc-title"
        className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 -z-10 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,90,0,0.22), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <Container width="wide">
          <Badge tone="orange">
            <MapPin width={12} height={12} aria-hidden className="mr-1" />
            {location.eyebrow}
          </Badge>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
            <div>
              <Heading
                id="loc-title"
                level={1}
                className="text-[var(--color-ol-ivory)]"
              >
                {location.h1}
              </Heading>
              <p className="mt-5 text-lg leading-relaxed text-[var(--color-ol-ivory)]/85 sm:text-xl">
                {location.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button as="a" href="/audit-ia" variant="primary" size="lg">
                  Audit IA gratuit
                </Button>
                <Button as="a" href="/contact" variant="secondary" size="lg">
                  Prendre un rendez-vous
                </Button>
              </div>
            </div>

            {/* Bandeau preuves d'ancrage */}
            <Card className="border-[var(--color-ol-ivory)]/15 bg-[var(--color-ol-ivory)]/[0.06] p-6 backdrop-blur-sm">
              <Eyebrow tone="orange">Ancrage vérifiable</Eyebrow>
              <dl className="mt-4 space-y-3 text-sm">
                {location.proofs.map((p) => (
                  <div key={p.label}>
                    <dt className="text-[10px] tracking-widest text-[var(--color-ol-ivory)]/55 uppercase">
                      {p.label}
                    </dt>
                    <dd className="mt-0.5 text-[var(--color-ol-ivory)]">
                      {p.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </Container>
      </section>

      {/* Présence — pitch 2 paragraphes */}
      <section
        aria-labelledby="loc-presence-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-3xl">
            <Eyebrow tone="orange">Notre présence à {location.label}</Eyebrow>
            <Heading id="loc-presence-title" level={2} className="mt-4">
              Sur le terrain, pas en visio.
            </Heading>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-ol-graphite)]">
              {location.pitch.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Grille services — 4 cards */}
      <section
        aria-labelledby="loc-services-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Ce que nous faisons ici</Eyebrow>
            <Heading id="loc-services-title" level={2} className="mt-4">
              Quatre formats d’intervention.
            </Heading>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {location.services.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="group block rounded-xl border border-[var(--color-ol-mist)] bg-white p-6 transition-all hover:border-[var(--color-ol-orange)]/40 hover:shadow-[0_8px_24px_-12px_rgba(10,14,26,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <Heading level={3} visualLevel={4}>
                    {service.title}
                  </Heading>
                  <ArrowUpRight
                    width={20}
                    height={20}
                    aria-hidden
                    className="text-[var(--color-ol-graphite)]/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-ol-orange)]"
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ol-graphite)]/80">
                  {service.body}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA final — réutilise le composant homepage */}
      <AuditIaCta />
    </main>
  );
}
