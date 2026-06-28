import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Database,
  MessageSquare,
  ScrollText,
} from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { BOOK, COMPANION_RESOURCES } from '@/lib/data/book';
import { alternatesFor } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: `Companion lecteurs : ${BOOK.title}`,
  description:
    'Ressources lecteurs : code source GitHub des exemples, datasets ouverts CHIRPS/ERA5/SODEXAM, errata public, forum Discourse francophone.',
  alternates: alternatesFor('/livre/companion'),
};

const CATEGORY_ICONS = {
  code: Code2,
  data: Database,
  errata: ScrollText,
  community: MessageSquare,
} as const;

const CATEGORY_LABELS = {
  code: 'Code',
  data: 'Datasets',
  errata: 'Errata',
  community: 'Communauté',
} as const;

export default function LivreCompanionPage(): React.ReactElement {
  return (
    <main id="main">
      {/* Hero */}
      <section
        aria-labelledby="companion-title"
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
            <Eyebrow tone="orange">Companion lecteurs</Eyebrow>
            <Heading id="companion-title" level={1} className="mt-4">
              Tout ce qui prolonge{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                la lecture
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              Acheter un livre, c’est bien. Pouvoir exécuter ses exemples,
              accéder à ses datasets, signaler ses coquilles et en discuter avec
              d’autres lecteurs francophones, c’est mieux. Tout est en accès
              libre.
            </p>
          </div>
        </Container>
      </section>

      {/* Liste des ressources */}
      <section
        aria-label="Ressources companion"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <ul className="grid gap-6 sm:grid-cols-2">
            {COMPANION_RESOURCES.map((r) => {
              const Icon = CATEGORY_ICONS[r.category];
              const label = CATEGORY_LABELS[r.category];
              const external = r.href.startsWith('http');
              return (
                <li key={r.title}>
                  <Card as="article" className="flex h-full flex-col gap-4 p-7">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        aria-hidden
                        className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                      >
                        <Icon width={24} height={24} aria-hidden />
                      </span>
                      <Badge tone="orange">{label}</Badge>
                    </div>
                    <Heading level={3} visualLevel={4}>
                      {r.title}
                    </Heading>
                    <p className="text-[var(--color-ol-graphite)]/75">
                      {r.description}
                    </p>
                    <Link
                      href={r.href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange-text)] hover:text-[var(--color-ol-orange-dark)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                    >
                      Accéder
                      <ArrowUpRight width={14} height={14} aria-hidden />
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* Sections ancrées */}
      <section
        id="datasets"
        aria-labelledby="datasets-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Détails : datasets ouverts</Eyebrow>
            <Heading id="datasets-title" level={2} className="mt-4">
              Trois sources climatiques, pré-formatées.
            </Heading>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            <li>
              <Card className="h-full p-6">
                <Heading level={3} visualLevel={4}>
                  CHIRPS
                </Heading>
                <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/75">
                  Précipitations satellite quotidiennes (1981 → aujourd’hui),
                  résolution 0.05°. Sous-ensemble Afrique de l’Ouest fourni.
                </p>
              </Card>
            </li>
            <li>
              <Card className="h-full p-6">
                <Heading level={3} visualLevel={4}>
                  ERA5
                </Heading>
                <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/75">
                  Reanalyse climatique ECMWF : température, vent, humidité.
                  Échantillon GeoJSON et Parquet prêts à charger.
                </p>
              </Card>
            </li>
            <li>
              <Card className="h-full p-6">
                <Heading level={3} visualLevel={4}>
                  SODEXAM
                </Heading>
                <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/75">
                  Stations météo ivoiriennes, série quotidienne 2015-2025.
                  Format CSV + métadonnées géoréférencées.
                </p>
              </Card>
            </li>
          </ul>
        </Container>
      </section>

      <section
        id="errata"
        aria-labelledby="errata-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Détails : errata</Eyebrow>
            <Heading id="errata-title" level={2} className="mt-4">
              Aucun livre n’est parfait. Tout est public.
            </Heading>
            <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
              Les corrections signalées par les lecteurs sont publiées chaque
              mois, datées, attribuées (avec accord du signaleur). La liste est
              versionnée sur GitHub et reflétée ici. La pipeline d’ingestion
              arrive en P6 (Payload CMS collection <code>errata</code>).
            </p>
          </div>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
