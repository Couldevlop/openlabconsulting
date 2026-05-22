import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen, FileText, Mic } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { PUBLICATIONS, type Publication } from '@/lib/data/laboratoire';
import { breadcrumbSchema, jsonLdString } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Publications — Laboratoire OpenLab',
  description:
    'Livre IA & Agents Autonomes, livres blancs souveraineté + paie, conférences. Toutes les sorties publiques de la R&D OpenLab.',
  alternates: { canonical: '/laboratoire/publications' },
};

const breadcrumbJsonLd = jsonLdString(
  breadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Laboratoire', url: '/laboratoire' },
    { name: 'Publications', url: '/laboratoire/publications' },
  ]),
);

const TYPE_LABEL: Record<Publication['type'], string> = {
  livre: 'Livre',
  'livre-blanc': 'Livre blanc',
  'article-pair': 'Article pair-évalué',
  conference: 'Conférence',
};

const TYPE_ICON: Record<Publication['type'], typeof BookOpen> = {
  livre: BookOpen,
  'livre-blanc': FileText,
  'article-pair': FileText,
  conference: Mic,
};

export default function LaboratoirePublicationsPage(): React.ReactElement {
  // Groupé par année descendante.
  const byYear = [...PUBLICATIONS].sort((a, b) => b.year - a.year);

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <section
        aria-labelledby="publications-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <Link
            href="/laboratoire"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange)]"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Hub Laboratoire
          </Link>

          <div className="mt-10 max-w-3xl">
            <Eyebrow tone="orange">Publications · 2025-2026</Eyebrow>
            <Heading id="publications-title" level={1} className="mt-4">
              Ce que nous publions, sans paywall ni vanity metric.
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              Notre R&amp;D existe pour servir la communauté francophone : un
              livre académique, des livres blancs téléchargeables gratuitement
              contre simple email, des conférences ouvertes.
            </p>
          </div>
        </Container>
      </section>

      <section
        aria-label="Liste des publications"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <ul className="grid gap-6 md:grid-cols-2">
            {byYear.map((p) => {
              const Icon = TYPE_ICON[p.type];
              const isExternal = p.href.startsWith('http');
              return (
                <li key={`${p.year}-${p.title}`}>
                  <Card className="flex h-full flex-col gap-4 p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        aria-hidden
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)]"
                      >
                        <Icon width={18} height={18} aria-hidden />
                      </span>
                      <Badge tone="orange">{TYPE_LABEL[p.type]}</Badge>
                    </div>

                    <Heading level={2} visualLevel={4}>
                      {p.title}
                    </Heading>

                    <p className="text-sm text-[var(--color-ol-graphite)]/65">
                      {p.authors.join(', ')} · {p.year}
                    </p>

                    <p className="text-[var(--color-ol-graphite)]/80">
                      {p.summary}
                    </p>

                    <div className="mt-auto">
                      <Link
                        href={p.href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)] hover:text-[var(--color-ol-orange-dark)]"
                      >
                        {isExternal ? 'Ouvrir' : 'Lire'}
                        <ArrowUpRight width={14} height={14} aria-hidden />
                      </Link>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
