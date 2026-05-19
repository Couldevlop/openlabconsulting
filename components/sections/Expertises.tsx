import type { ReactElement, ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Bot,
  Compass,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface Expertise {
  slug:
    | 'conseil-strategie'
    | 'agents-automatisation'
    | 'data-gouvernance'
    | 'cybersecurite-ia';
  title: string;
  punchline: string;
  Icon: LucideIcon;
}

/**
 * Wording en deux temps + antithèse — voir CLAUDE.md §18 ("phrases de marque").
 * Pas de phrases creuses, pas de "solutions sur mesure".
 */
const EXPERTISES: readonly Expertise[] = [
  {
    slug: 'conseil-strategie',
    title: 'Conseil & stratégie IA',
    punchline:
      "Cartographier l'IA réellement utile. Écarter ce qui ne le sera jamais.",
    Icon: Compass,
  },
  {
    slug: 'agents-automatisation',
    title: 'Agents & automatisation',
    punchline:
      'Vos workflows, automatisés. Vos équipes, augmentées — pas remplacées.',
    Icon: Bot,
  },
  {
    slug: 'data-gouvernance',
    title: 'Data & gouvernance',
    punchline:
      'La data est votre pétrole. La gouvernance est votre raffinerie.',
    Icon: Database,
  },
  {
    slug: 'cybersecurite-ia',
    title: 'Cybersécurité augmentée',
    punchline:
      "Détecter ce qui devient invisible. Anticiper ce qui n'a pas frappé.",
    Icon: ShieldCheck,
  },
] as const;

/**
 * Expertises — Section 3 de la homepage (CLAUDE.md §6).
 *
 * 4 cards cliquables sur fond ivory. Chaque card est un <Link> qui
 * englobe la Card (cible cliquable complète, simple lien pour l'a11y).
 */
export function Expertises(): ReactElement {
  return (
    <section
      aria-labelledby="expertises-title"
      data-testid="expertises"
      className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
    >
      <Container width="wide">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="orange">Ce que nous transformons</Eyebrow>
          <Heading id="expertises-title" level={2} className="mt-4">
            Quatre axes pour faire de l’IA un{' '}
            <span className="text-[var(--color-ol-orange)]">
              levier mesurable
            </span>
            .
          </Heading>
          <p className="mt-6 text-lg text-[var(--color-ol-graphite)]/75">
            Pas un PoC en sandbox — des chaînes de valeur déployées dans vos
            systèmes, conformes à la réglementation, gouvernées, auditables.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {EXPERTISES.map(({ slug, title, punchline, Icon }) => (
            <li key={slug}>
              <Link
                href={`/expertises/${slug}`}
                className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
              >
                <Card
                  as="article"
                  interactive
                  className="flex h-full flex-col gap-6"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)] transition-colors group-hover:bg-[var(--color-ol-orange)] group-hover:text-white"
                  >
                    <Icon width={24} height={24} aria-hidden />
                  </span>

                  <Heading level={3} visualLevel={4}>
                    {title}
                  </Heading>

                  <p className="text-[var(--color-ol-graphite)]/75">
                    {punchline}
                  </p>

                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)]">
                    Voir le détail
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
          ))}
        </ul>
      </Container>
    </section>
  );
}
