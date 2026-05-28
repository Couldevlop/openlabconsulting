import type { ReactElement } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import {
  METHODOLOGIE_FALLBACK,
  type MethodologieContent,
} from '@/lib/cms/site-settings';

interface MethodologieProps {
  /** Contenu CMS injecté par les wrappers async (homepage / hub expertises). */
  content?: MethodologieContent;
}

/**
 * Methodologie — « Notre méthodologie d'accompagnement IA » (3 axes).
 *
 * Visible sur la homepage (après les Expertises) ET le hub /expertises.
 * Méthode en trois étapes ordonnées : audit de maturité → choix data &
 * secteurs → stratégie d'adoption. Ton signature §18 (phrases courtes,
 * antithèse, adresse directe).
 *
 * Choix visuel : fond blanc, intercalé entre l'ivory des Expertises et le
 * night du Laboratoire sur la home — la nuance préserve le rythme sans deux
 * blocs ivory consécutifs. Grand numéro orange (token `--color-ol-orange-text`
 * pour le contraste AA), titre Bricolage, punchline italique Fraunces, body.
 *
 * Accessibilité : section labellée par son H2, axes en liste ordonnée (<ol>),
 * CTA primaire vers /audit-ia. Aucune animation JS — rien à neutraliser pour
 * `prefers-reduced-motion`.
 */
export function Methodologie({
  content = METHODOLOGIE_FALLBACK,
}: MethodologieProps = {}): ReactElement {
  return (
    <section
      aria-labelledby="methodologie-title"
      data-testid="methodologie"
      className="bg-[var(--color-ol-white)] py-20 sm:py-28"
    >
      <Container width="wide">
        <div className="max-w-3xl">
          <Eyebrow tone="orange">{content.eyebrow}</Eyebrow>
          <Heading
            id="methodologie-title"
            level={2}
            className="mt-4 text-3xl leading-[1.08] tracking-tight sm:text-5xl"
          >
            {content.titleLead}{' '}
            <span className="text-[var(--color-ol-orange-text)]">
              {content.titleHighlight}
            </span>
          </Heading>
          <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
            {content.intro}
          </p>
        </div>

        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {content.axes.map((axis) => (
            <li
              key={axis.index}
              className="flex h-full flex-col rounded-lg border-t-2 border-[var(--color-ol-orange)] bg-[var(--color-ol-ivory)] p-8"
            >
              <span
                aria-hidden
                className="block font-[family-name:var(--font-display)] text-5xl leading-none font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-6xl"
              >
                {axis.index}
              </span>
              <Heading level={3} visualLevel={4} className="mt-5">
                {axis.title}
              </Heading>
              <p className="mt-3 font-[family-name:var(--font-editorial)] text-lg leading-snug text-[var(--color-ol-night)] italic">
                {axis.punchline}
              </p>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-ol-graphite)]/80">
                {axis.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <Link
            href={content.cta.href}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--color-ol-orange-dark)] px-6 text-base font-medium text-white transition-colors duration-200 ease-[var(--ease-ol)] hover:bg-[var(--color-ol-orange-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2 sm:text-lg"
          >
            {content.cta.label}
            <ArrowRight width={18} height={18} aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  );
}
