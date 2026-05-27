import type { ReactElement } from 'react';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import {
  MANIFESTO_FALLBACK,
  type ManifestoContent,
} from '@/lib/cms/site-settings';

interface ManifestoProps {
  /** Contenu CMS injecté par le wrapper async homepage. */
  content?: ManifestoContent;
}

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
export function Manifesto({
  content = MANIFESTO_FALLBACK,
}: ManifestoProps = {}): ReactElement {
  return (
    <section
      aria-labelledby="manifesto-title"
      data-testid="manifesto"
      className="bg-[var(--color-ol-ivory)] py-28 sm:py-36"
    >
      <Container width="narrow">
        <Eyebrow tone="orange">{content.eyebrow}</Eyebrow>

        <Heading
          id="manifesto-title"
          level={2}
          className="mt-6 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl"
        >
          {content.headline}{' '}
          <span className="text-[var(--color-ol-orange-text)]">
            {content.headlineHighlight}
          </span>
        </Heading>

        <p className="mt-10 max-w-2xl font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-graphite)]/85 sm:text-2xl">
          {content.intro}
        </p>

        <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {content.stances.map((stance, idx) => (
            <li
              key={`${idx}-${stance.excuse.slice(0, 16)}`}
              className="border-t-2 border-[var(--color-ol-orange)] pt-6"
            >
              <span
                aria-hidden
                className="block font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-4xl"
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <p className="mt-4 font-[family-name:var(--font-editorial)] text-base text-[var(--color-ol-graphite)]/65 italic">
                {stance.excuse}
              </p>
              <p className="mt-3 text-base leading-snug font-medium text-[var(--color-ol-night)]">
                {stance.fact}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-16 max-w-2xl font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-graphite)]/85 sm:text-2xl">
          {content.conclusion}
        </p>

        <footer className="mt-12 flex flex-col gap-1 text-sm text-[var(--color-ol-graphite)]/60">
          <span className="font-medium text-[var(--color-ol-night)]">
            {content.signature.name}
          </span>
          <span>{content.signature.role}</span>
          <span>{content.signature.locationDate}</span>
        </footer>
      </Container>
    </section>
  );
}
