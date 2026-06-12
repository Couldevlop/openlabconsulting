import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { getRdAxes } from '@/lib/laboratoire-server';
import { PRODUCTS } from '@/lib/data/products';
import { spellFrenchCount } from '@/lib/format/product-count';
import { breadcrumbSchema, jsonLdString } from '@/lib/seo/schema';

const PRODUCTS_WORD = spellFrenchCount(PRODUCTS.length);

export const metadata: Metadata = {
  title: 'Axes R&D — Laboratoire OpenLab',
  description:
    'Six axes de recherche appliquée derrière les produits OpenLab : paie ouest-africaine, fraude documentaire, agro-précision, supervision temps réel, QMS multi-norme, Smart City respectueuse de la vie privée.',
  alternates: { canonical: '/laboratoire/axes' },
};

const breadcrumbJsonLd = jsonLdString(
  breadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Laboratoire', url: '/laboratoire' },
    { name: 'Axes R&D', url: '/laboratoire/axes' },
  ]),
);

export default async function LaboratoireAxesPage(): Promise<React.ReactElement> {
  const axes = await getRdAxes();
  const axesWord = spellFrenchCount(axes.length);
  const axesWordCap = axesWord.charAt(0).toUpperCase() + axesWord.slice(1);
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <section
        aria-labelledby="axes-title"
        className="bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
      >
        <Container width="wide">
          <Link
            href="/laboratoire"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-ivory)]/65 transition-colors hover:text-[var(--color-ol-orange-text)]"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Hub Laboratoire
          </Link>

          <div className="mt-10 max-w-3xl">
            <Eyebrow tone="orange">Axes R&amp;D · 2026</Eyebrow>
            <Heading
              id="axes-title"
              level={1}
              className="mt-4 text-[var(--color-ol-ivory)]"
            >
              {axesWordCap} pistes, {PRODUCTS_WORD} produits, un terrain.
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-ivory)]/80">
              Nos axes de recherche appliquée ne sortent pas d&rsquo;une slide
              de stratégie : ils naissent d&rsquo;un client qui pousse la porte
              avec un vrai problème, puis se généralisent quand le pattern
              tient.
            </p>
          </div>
        </Container>
      </section>

      <section
        aria-label="Détail des axes R&D"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <ol className="grid gap-8 lg:grid-cols-2">
            {axes.map((axe, i) => (
              <li key={axe.slug}>
                <Card className="flex h-full flex-col gap-4 p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 font-mono text-sm font-semibold text-[var(--color-ol-orange-text)]"
                    >
                      0{i + 1}
                    </span>
                    <Heading level={2} visualLevel={4}>
                      {axe.title}
                    </Heading>
                  </div>

                  <p className="text-[var(--color-ol-graphite)]/80">
                    {axe.pitch}
                  </p>

                  <ul className="mt-2 space-y-2 text-sm">
                    {axe.exemples.map((ex) => (
                      <li
                        key={ex}
                        className="flex items-start gap-2 text-[var(--color-ol-graphite)]/75"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-ol-orange)]"
                        />
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 border-t border-[var(--color-ol-mist)] pt-4">
                    <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
                      Produits qui incarnent cet axe
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {axe.produitsLies.map((p) => (
                        <li key={p}>
                          <Badge tone="orange">{p}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </li>
            ))}
          </ol>

          <div className="mt-12 rounded-lg border border-dashed border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-8 text-center">
            <Heading level={3} visualLevel={4}>
              Voir les publications associées.
            </Heading>
            <p className="mt-3 text-[var(--color-ol-graphite)]/75">
              Livre, livres blancs, conférences — la sortie publique de nos axes
              de recherche.
            </p>
            <Link
              href="/laboratoire/publications"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange-text)] hover:text-[var(--color-ol-orange-dark)]"
            >
              Toutes les publications
              <ArrowUpRight width={14} height={14} aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
