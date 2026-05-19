import type { ReactElement } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  /** Date affichée. ISO `datetime` séparé pour <time>. */
  publishedAt: string;
  isoDate: string;
  cover: { src: string | null; alt: string };
}

/**
 * Placeholder articles tant que Payload (P6) n'est pas branché.
 * Le sujet de chaque article est ancré sur un produit ou une thématique
 * réelle (CLAUDE.md §1), pour éviter le contenu vide.
 */
const ARTICLES: readonly Article[] = [
  {
    slug: 'migration-ia-souveraine-k3s-hetzner',
    title: 'Migration vers une IA souveraine en Afrique francophone',
    excerpt:
      'Pourquoi un cluster K3s Hetzner change la donne pour les institutions ouest-africaines — leçons tirées du déploiement NexusRH.',
    category: 'Souveraineté',
    author: 'Debora Ahouma',
    publishedAt: 'Mai 2026',
    isoDate: '2026-05-01',
    cover: {
      src: null,
      alt: 'Schéma d’architecture K3s Hetzner pour la souveraineté IA',
    },
  },
  {
    slug: 'cnps-its-fdfp-conformite-sirh-ivoirien',
    title: 'CNPS, ITS, FDFP : ce que la conformité paie attend de votre SIRH',
    excerpt:
      'Le diable est dans le détail des cotisations sociales. Comment un SIRH bien conçu transforme l’audit annuel en formalité.',
    category: 'Conformité RH',
    author: 'Équipe NexusRH',
    publishedAt: 'Avril 2026',
    isoDate: '2026-04-15',
    cover: {
      src: null,
      alt: 'Capture du module de paie NexusRH conforme CNPS',
    },
  },
  {
    slug: 'fraude-documentaire-ia-banques-assurances',
    title:
      'Détection de fraude documentaire : ce que l’IA voit que vos contrôleurs manquent',
    excerpt:
      'Trois patterns invisibles à l’œil humain que Fraud Shield isole en moins de deux secondes, et comment l’expliquer à un comité d’audit.',
    category: 'Cybersécurité',
    author: 'Équipe Fraud Shield',
    publishedAt: 'Mars 2026',
    isoDate: '2026-03-20',
    cover: {
      src: null,
      alt: 'Visualisation Fraud Shield : marqueurs de fraude détectés sur un document',
    },
  },
] as const;

/**
 * Insights — Section 9 de la homepage (CLAUDE.md §6, §12.5).
 *
 * Grid 1/3 cols (saut direct, on évite 2 cols qui laisseraient une
 * orpheline en sm avec 3 cards). Chaque card est <Link> qui englobe
 * une <Card> interactive avec cover, badge catégorie, titre, extrait,
 * auteur, date.
 *
 * Branche Payload P6 : `payload.find({ collection: 'articles',
 * sort: '-publishedAt', limit: 3 })` côté server component.
 */
export function Insights(): ReactElement {
  return (
    <section
      aria-labelledby="insights-title"
      data-testid="insights"
      className="bg-white py-24 sm:py-32"
    >
      <Container width="wide">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Insights</Eyebrow>
            <Heading id="insights-title" level={2} className="mt-4">
              Notre lecture du{' '}
              <span className="text-[var(--color-ol-orange)]">
                terrain africain
              </span>
              .
            </Heading>
            <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
              Pas des billets d’opinion : des retours de déploiements réels,
              sourcés, opérables dès lundi.
            </p>
          </div>
          <Button
            as="a"
            href="/insights"
            variant="ghost"
            size="md"
            className="shrink-0 self-start lg:self-end"
          >
            Tous les insights
            <ArrowUpRight width={20} height={20} aria-hidden />
          </Button>
        </div>

        <ul className="mt-14 grid gap-8 md:grid-cols-3">
          {ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/insights/${article.slug}`}
                className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
              >
                <Card
                  as="article"
                  interactive
                  className="flex h-full flex-col gap-5 p-0 sm:p-0"
                >
                  <MediaPlaceholder
                    src={article.cover.src}
                    alt={article.cover.alt}
                    tone="cold"
                    aspect="16/9"
                    placeholderLabel="Couverture article"
                    className="rounded-b-none border-0 border-b border-dashed border-[var(--color-ol-graphite)]/15"
                  />

                  <div className="flex flex-1 flex-col gap-4 px-6 pb-6 sm:px-8 sm:pb-8">
                    <Badge tone="orange">{article.category}</Badge>

                    <Heading level={3} visualLevel={4} className="leading-snug">
                      {article.title}
                    </Heading>

                    <p className="text-[var(--color-ol-graphite)]/75">
                      {article.excerpt}
                    </p>

                    <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-ol-mist)] pt-4 text-xs text-[var(--color-ol-graphite)]/65">
                      <span className="font-medium text-[var(--color-ol-night)]">
                        {article.author}
                      </span>
                      <time dateTime={article.isoDate}>
                        {article.publishedAt}
                      </time>
                    </footer>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
