import type { ReactElement } from 'react';
import Link from 'next/link';
import { ArrowRight, Atom, BookOpen, Boxes } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';

interface Axis {
  Icon: typeof Atom;
  label: string;
  headline: string;
  body: string;
  href: string;
  ctaLabel: string;
}

/**
 * 3 axes du laboratoire — directement appuyés sur des faits documentés
 * (§1 du CLAUDE.md). Aucun chiffre rond non sourcé (§4.10).
 */
const AXES: readonly Axis[] = [
  {
    Icon: Boxes,
    label: 'Produits propriétaires',
    headline: 'Sept logiciels en production ou en pilote.',
    body: 'NexusRH CI, NexusERP, SYGESCOM, AgroSense CI, QualitOS, Fraud Shield, Smart City — chaque produit est issu d’un terrain client, déployé sur K3s, audité par notre équipe.',
    href: '/solutions',
    ctaLabel: 'Voir l’écosystème',
  },
  {
    Icon: BookOpen,
    label: 'Édition académique',
    headline: 'Un livre de référence publié à Abidjan.',
    body: '« Intégration de l’Intelligence Artificielle dans le développement logiciel ». Un capstone terrain (AgroSense CI), des chapitres pour étudiants, dirigeants et professeurs.',
    href: '/livre',
    ctaLabel: 'Explorer le livre',
  },
  {
    Icon: Atom,
    label: 'Recherche & partenariats',
    headline: 'Une trajectoire scientifique assumée.',
    body: 'Axes en MLOps, agents multi-acteurs, séries temporelles climatiques, RAG souverain — adossés à des partenariats universitaires francophones et à des données africaines (SODEXAM, ERA5, CHIRPS).',
    href: '/laboratoire',
    ctaLabel: 'Découvrir la R&D',
  },
] as const;

/**
 * Laboratoire — Section 4 de la homepage (CLAUDE.md §6, §16.2 "soin extrême").
 *
 * Signature visuelle :
 *   - fond `--ol-night` (différence nette avec les sections précédentes
 *     en ivory)
 *   - dégradé radial discret orange + navy en haut-droit
 *   - typographie Bricolage sur h2, Fraunces (editorial) sur la
 *     citation manifeste
 *   - axes alignés sur 3 colonnes lg, séparateurs verticaux subtils
 */
export function Laboratoire(): ReactElement {
  return (
    <section
      aria-labelledby="laboratoire-title"
      data-testid="laboratoire"
      className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
    >
      {/* Halo discret en haut-droit */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 -z-10 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,90,0,0.18), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,38,84,0) 0%, rgba(20,38,84,0.35) 100%)',
        }}
      />

      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-20">
          <div>
            <Eyebrow tone="orange">Le Laboratoire OpenLab</Eyebrow>
            <Heading
              id="laboratoire-title"
              level={2}
              className="mt-4 text-[var(--color-ol-ivory)]"
            >
              Un cabinet qui code, qui édite,{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                qui publie
              </span>
              .
            </Heading>
          </div>
          <blockquote className="font-[family-name:var(--font-editorial)] text-xl leading-snug text-[var(--color-ol-ivory)]/85 italic sm:text-2xl">
            <span aria-hidden className="text-[var(--color-ol-orange-text)]">
              “
            </span>
            La data est votre pétrole. La gouvernance est votre raffinerie.
            <br />
            Le laboratoire, lui, dessine ce qui sortira du puits dans cinq ans.
            <span aria-hidden className="text-[var(--color-ol-orange-text)]">
              ”
            </span>
          </blockquote>
        </div>

        <ul
          role="list"
          className="mt-20 grid gap-x-12 gap-y-14 lg:grid-cols-3 lg:divide-x lg:divide-[var(--color-ol-ivory)]/10"
        >
          {AXES.map(({ Icon, label, headline, body, href, ctaLabel }) => (
            <li
              key={label}
              className="flex flex-col gap-5 lg:px-8 lg:first:pl-0 lg:last:pr-0"
            >
              <span
                aria-hidden
                className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-ol-ivory)]/5 text-[var(--color-ol-orange-text)] ring-1 ring-[var(--color-ol-ivory)]/10"
              >
                <Icon width={24} height={24} aria-hidden />
              </span>
              <Eyebrow tone="ivory" className="text-[var(--color-ol-ivory)]/60">
                {label}
              </Eyebrow>
              <Heading
                level={3}
                visualLevel={4}
                className="text-[var(--color-ol-ivory)]"
              >
                {headline}
              </Heading>
              <p className="text-[var(--color-ol-ivory)]/75">{body}</p>
              <Link
                href={href}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-orange-text)] transition-colors hover:text-[var(--color-ol-orange-light)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ol-night)]"
              >
                {ctaLabel}
                <ArrowRight width={16} height={16} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-20 flex flex-col items-start gap-6 border-t border-[var(--color-ol-ivory)]/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[var(--color-ol-ivory)]/70">
            Le laboratoire est notre triple avantage : conseil stratégique,
            R&amp;D produit, édition académique. Aucun concurrent ne couvre les
            trois.
          </p>
          <Button
            as="a"
            href="/laboratoire"
            variant="primary"
            size="lg"
            className="shrink-0"
          >
            Visiter le laboratoire
            <ArrowRight width={20} height={20} aria-hidden />
          </Button>
        </div>
      </Container>
    </section>
  );
}
