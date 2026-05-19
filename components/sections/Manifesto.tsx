import type { ReactElement } from 'react';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';

interface Stance {
  /** Numérotation visible (01, 02, 03). */
  index: string;
  /** Excuse historique qu'on récuse, courte. */
  excuse: string;
  /** Fait concret qu'on lui oppose, court. */
  fact: string;
}

const STANCES: readonly Stance[] = [
  {
    index: '01',
    excuse: '« On n’a pas les outils. »',
    fact: 'Sept logiciels propriétaires produits à Abidjan. SYSCOHADA, CNPS, Mobile Money — natifs.',
  },
  {
    index: '02',
    excuse: '« On n’a pas la recherche. »',
    fact: 'Un livre IA co-édité Grasse · Abidjan, capstone terrain ivoirien, lu par étudiants et dirigeants.',
  },
  {
    index: '03',
    excuse: '« On n’a pas la souveraineté. »',
    fact: 'K3s Hetzner, audit total, RGPD intégral, données en Europe, gouvernance francophone.',
  },
] as const;

/**
 * Manifesto — Section 7 de la homepage (CLAUDE.md §6, §18).
 *
 * Section éditoriale, signature de la voix de marque. Pas de fioritures,
 * pas de stat ronde. Typographie Fraunces (editorial) sur l'intro et la
 * conclusion, Bricolage sur le titre. Fond ivory pour ménager le
 * contraste avec le Laboratoire (night) en amont.
 *
 * Statements en deux temps : excuse historique en italique → fait
 * concret en réponse droite, antithèse classique §18.
 */
export function Manifesto(): ReactElement {
  return (
    <section
      aria-labelledby="manifesto-title"
      data-testid="manifesto"
      className="bg-[var(--color-ol-ivory)] py-28 sm:py-36"
    >
      <Container width="narrow">
        <Eyebrow tone="orange">Manifeste</Eyebrow>

        <Heading
          id="manifesto-title"
          level={2}
          className="mt-6 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl"
        >
          Cette fois,{' '}
          <span className="text-[var(--color-ol-orange)]">
            l’Afrique n’a plus d’excuse.
          </span>
        </Heading>

        <p className="mt-10 max-w-2xl font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-graphite)]/85 sm:text-2xl">
          Pendant trente ans, on nous a expliqué que la technologie viendrait
          d’ailleurs. Que la recherche se ferait ailleurs. Que la décision se
          prendrait ailleurs. Nous arrivons avec sept produits, un livre, et un
          cluster Kubernetes à Abidjan.
        </p>

        <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {STANCES.map(({ index, excuse, fact }) => (
            <li
              key={index}
              className="border-t-2 border-[var(--color-ol-orange)] pt-6"
            >
              <span
                aria-hidden
                className="block font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ol-orange)] sm:text-4xl"
              >
                {index}
              </span>
              <p className="mt-4 font-[family-name:var(--font-editorial)] text-base text-[var(--color-ol-graphite)]/65 italic">
                {excuse}
              </p>
              <p className="mt-3 text-base leading-snug font-medium text-[var(--color-ol-night)]">
                {fact}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-16 max-w-2xl font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-graphite)]/85 sm:text-2xl">
          Ce n’est pas un manifeste pour 2035. C’est un état des lieux pour
          aujourd’hui.
        </p>

        <footer className="mt-12 flex flex-col gap-1 text-sm text-[var(--color-ol-graphite)]/60">
          <span className="font-medium text-[var(--color-ol-night)]">
            Debora Ahouma
          </span>
          <span>Fondatrice &amp; CEO · OpenLab Consulting</span>
          <span>Abidjan · Mai 2026</span>
        </footer>
      </Container>
    </section>
  );
}
