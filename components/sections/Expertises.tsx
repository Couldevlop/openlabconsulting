import type { ReactElement } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { DynamicIcon } from '@/lib/icon-map';
import { EXPERTISES, type Expertise } from '@/lib/data/expertises';

/**
 * Expertises — Section 3 de la homepage (CLAUDE.md §6).
 *
 * 4 cards cliquables sur fond ivory. Chaque card est un <Link> qui
 * englobe la Card (cible cliquable complète, simple lien pour l'a11y).
 *
 * Les expertises sont injectées via la prop `expertises` (résolue côté
 * server par `ExpertisesServer` → collection Payload, fallback `EXPERTISES`).
 * Par défaut, le fallback hard-codé garantit un rendu sans DB.
 */
export function Expertises({
  expertises = EXPERTISES,
}: {
  expertises?: readonly Expertise[];
} = {}): ReactElement {
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
            <span className="text-[var(--color-ol-orange-text)]">
              levier mesurable
            </span>
            .
          </Heading>
          <p className="mt-6 text-lg text-[var(--color-ol-graphite)]/75">
            Pas un PoC en sandbox, des chaînes de valeur déployées dans vos
            systèmes, conformes à la réglementation, gouvernées, auditables.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {expertises.map(({ slug, title, punchline, iconKey }) => (
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
                    className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)] transition-colors group-hover:bg-[var(--color-ol-orange)] group-hover:text-white"
                  >
                    <DynamicIcon
                      name={iconKey}
                      width={24}
                      height={24}
                      aria-hidden
                    />
                  </span>

                  <Heading level={3} visualLevel={4}>
                    {title}
                  </Heading>

                  <p className="text-[var(--color-ol-graphite)]/75">
                    {punchline}
                  </p>

                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange-text)]">
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
