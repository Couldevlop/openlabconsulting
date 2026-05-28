import type { ReactElement } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { DynamicIcon } from '@/lib/icon-map';
import { PRODUCTS, type Product } from '@/lib/data/products';

/**
 * Solutions — Section 6 de la homepage (CLAUDE.md §6, §7).
 *
 * Grid responsive (1/2/3/4 cols), 7 produits propriétaires.
 * Carrousel non retenu : a11y/SEO/perf supérieurs en grid statique.
 * Décision validée 2026-05-19.
 *
 * Aucun chiffre rond inventé (§4.10) — uniquement targets et statuts
 * documentés dans CLAUDE.md §1.3.
 *
 * Les produits sont injectés via la prop `products` (résolue côté server
 * par `SolutionsServer` → collection Payload, fallback `PRODUCTS`). Par
 * défaut, le fallback hard-codé garantit un rendu sans DB.
 */
export function Solutions({
  products = PRODUCTS,
}: {
  products?: readonly Product[];
} = {}): ReactElement {
  return (
    <section
      aria-labelledby="solutions-title"
      data-testid="solutions"
      className="bg-white py-24 sm:py-32"
    >
      <Container width="wide">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow tone="orange">L’écosystème OpenLab</Eyebrow>
          <Heading id="solutions-title" level={2} className="mt-4">
            Sept logiciels propriétaires.{' '}
            <span className="text-[var(--color-ol-orange-text)]">
              Un seul laboratoire
            </span>
            .
          </Heading>
          <p className="mt-6 text-lg text-[var(--color-ol-graphite)]/75">
            Pas un catalogue : une suite cohérente, conçue à Abidjan, déployée
            sur K3s, gouvernée bout en bout.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
          {products.map(
            ({ slug, name, iconKey, tagline, target, status, statusLabel }) => (
              <li key={slug}>
                <Link
                  href={`/solutions/${slug}`}
                  className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                >
                  <Card
                    as="article"
                    interactive
                    className="flex h-full flex-col gap-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        aria-hidden
                        className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-ol-ivory)] text-[var(--color-ol-orange-text)] ring-1 ring-[var(--color-ol-mist)] transition-colors group-hover:bg-[var(--color-ol-orange)] group-hover:text-white group-hover:ring-[var(--color-ol-orange)]"
                      >
                        <DynamicIcon
                          name={iconKey}
                          width={24}
                          height={24}
                          aria-hidden
                        />
                      </span>
                      <Badge tone={status}>{statusLabel}</Badge>
                    </div>

                    <Heading level={3} visualLevel={4}>
                      {name}
                    </Heading>

                    <p className="text-[var(--color-ol-graphite)]/75">
                      {tagline}
                    </p>

                    <p className="text-xs text-[var(--color-ol-graphite)]/70">
                      {target}
                    </p>

                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange-text)]">
                      Découvrir
                      <ArrowUpRight
                        width={16}
                        height={16}
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </Card>
                </Link>
              </li>
            ),
          )}
        </ul>

        <div className="mt-16 flex justify-center">
          <Button as="a" href="/solutions" variant="ghost" size="lg">
            Comparer tous les produits
            <ArrowUpRight width={20} height={20} aria-hidden />
          </Button>
        </div>
      </Container>
    </section>
  );
}
