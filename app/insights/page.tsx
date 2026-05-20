import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';

export const metadata: Metadata = {
  title: 'Insights — Articles, études et retours de terrain',
  description:
    'Retours de déploiements IA réels en Afrique francophone : souveraineté, conformité, fraude documentaire, agriculture précision, cybersécurité.',
  alternates: { canonical: '/insights' },
};

const CATEGORIES = [
  'Souveraineté',
  'Conformité RH',
  'Cybersécurité',
  'Data & gouvernance',
  'Agents & IA',
  'MLOps',
  'Étude de cas',
];

// Articles placeholder — remplaces par Payload P6 collection 'articles'.
const ARTICLES = [
  {
    slug: 'migration-ia-souveraine-k3s-hetzner',
    title: 'Migration vers une IA souveraine en Afrique francophone',
    excerpt:
      'Pourquoi un cluster K3s Hetzner change la donne pour les institutions ouest-africaines.',
    category: 'Souveraineté',
    author: 'Debora Ahouma',
    date: 'Mai 2026',
    iso: '2026-05-01',
  },
  {
    slug: 'cnps-its-fdfp-conformite-sirh-ivoirien',
    title: 'CNPS, ITS, FDFP : ce que la conformité paie attend de votre SIRH',
    excerpt:
      'Le diable est dans le détail des cotisations sociales. Comment un SIRH bien conçu transforme l’audit annuel.',
    category: 'Conformité RH',
    author: 'Équipe NexusRH',
    date: 'Avril 2026',
    iso: '2026-04-15',
  },
  {
    slug: 'fraude-documentaire-ia-banques-assurances',
    title:
      'Détection de fraude documentaire : ce que l’IA voit que vos contrôleurs manquent',
    excerpt:
      'Trois patterns invisibles à l’œil humain que Fraud Shield isole en moins de deux secondes.',
    category: 'Cybersécurité',
    author: 'Équipe Fraud Shield',
    date: 'Mars 2026',
    iso: '2026-03-20',
  },
];

export default function InsightsHubPage(): React.ReactElement {
  return (
    <main id="main">
      {/* Hero */}
      <section
        aria-labelledby="insights-hub-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <div className="max-w-3xl">
            <Eyebrow tone="orange">Hub Insights</Eyebrow>
            <Heading id="insights-hub-title" level={1} className="mt-4">
              Notre lecture du{' '}
              <span className="text-[var(--color-ol-orange)]">
                terrain africain
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              Pas des billets d’opinion : des retours de déploiements réels,
              sourcés, opérables dès lundi. Deux articles longs par semaine
              (objectif éditorial 2026), un livre blanc par trimestre.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Badge tone="neutral">{c}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Liste articles */}
      <section
        aria-label="Articles récents"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <ul className="grid gap-8 md:grid-cols-3">
            {ARTICLES.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/insights/${a.slug}`}
                  className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                >
                  <Card
                    as="article"
                    interactive
                    className="flex h-full flex-col gap-5 p-0 sm:p-0"
                  >
                    <MediaPlaceholder
                      src={null}
                      alt={`Couverture : ${a.title}`}
                      tone="cold"
                      aspect="16/9"
                      placeholderLabel="Couverture article"
                      className="rounded-b-none border-0 border-b border-dashed border-[var(--color-ol-graphite)]/15"
                    />
                    <div className="flex flex-1 flex-col gap-4 px-6 pb-6 sm:px-8 sm:pb-8">
                      <Badge tone="orange">{a.category}</Badge>
                      <Heading
                        level={2}
                        visualLevel={4}
                        className="leading-snug"
                      >
                        {a.title}
                      </Heading>
                      <p className="text-[var(--color-ol-graphite)]/75">
                        {a.excerpt}
                      </p>
                      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-ol-mist)] pt-4 text-xs text-[var(--color-ol-graphite)]/65">
                        <span className="font-medium text-[var(--color-ol-night)]">
                          {a.author}
                        </span>
                        <time dateTime={a.iso}>{a.date}</time>
                      </footer>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-lg border border-dashed border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-8 text-center">
            <Heading level={3} visualLevel={4}>
              Plus d’articles arrivent.
            </Heading>
            <p className="mt-3 text-[var(--color-ol-graphite)]/75">
              La pipeline éditoriale complète sera branchée sur Payload CMS en
              P6. Reviens ici sous 1-2 semaines, ou abonne-toi au flux RSS via
              la racine du site dès que la collection sera active.
            </p>
            <Link
              href="/audit-ia"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)] transition-colors hover:text-[var(--color-ol-orange-dark)]"
            >
              En attendant, demande ton audit IA
              <ArrowUpRight width={14} height={14} aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
