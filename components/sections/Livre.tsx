import type { ReactElement } from 'react';
import { ArrowRight, BookOpen, Download } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';

interface Book {
  title: string;
  subtitle: string;
  edition: string;
  pitch: string[];
  audiences: readonly string[];
  cover: { src: string | null; alt: string };
  purchaseHref: string;
  extractHref: string;
  conferenceHref: string;
}

/**
 * Livre principal — CLAUDE.md §1.4 + §8. Distinct du livre blanc
 * (collection séparée en Payload P6, voir memory
 * project_openlabconsulting_white_paper_souveraine).
 *
 * Édité par OpenLab Consulting seul — pas de co-édition externe.
 */
const BOOK: Book = {
  title: 'Intelligence Artificielle',
  subtitle: 'Du Machine Learning aux Agents Autonomes',
  edition: 'Édition OpenLab Consulting · Abidjan',
  pitch: [
    'Un parcours rigoureux du ML supervisé aux agents multi-acteurs, en passant par les séries temporelles, le RAG souverain, MLOps et la sécurité IA.',
    "Un capstone terrain ivoirien — AgroSense CI — qui montre comment l'IA se déploie réellement sur des coopératives cacao, anacarde, coton.",
  ],
  audiences: [
    'Étudiants ingénieurs',
    'Data scientists',
    'Dirigeants',
    'Enseignants',
  ],
  cover: {
    src: null,
    alt: 'Couverture du livre Intelligence Artificielle — du Machine Learning aux Agents Autonomes',
  },
  purchaseHref: '/livre/acheter',
  extractHref: '/livre/extraits',
  conferenceHref: '/contact?sujet=conference-livre',
};

/**
 * Livre — Section 8 de la homepage (CLAUDE.md §6, §8).
 *
 * Fond night pour la gravité éditoriale, deux colonnes : couverture
 * (placeholder Payload P6) à gauche, pitch + CTAs à droite.
 *
 * Trois CTAs hiérarchisés :
 *   1. Acheter (primaire orange)
 *   2. Lire un extrait gratuit (secondaire night avec bordure)
 *   3. Réserver une conférence (lien discret, mais visible)
 */
export function Livre(): ReactElement {
  return (
    <section
      aria-labelledby="livre-title"
      data-testid="livre"
      className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
    >
      {/* Halo discret en bas-gauche, miroir inversé du Laboratoire */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 -z-10 h-[480px] w-[480px] rounded-full"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,90,0,0.16), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          {/* Couverture */}
          <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-md">
            <MediaPlaceholder
              src={BOOK.cover.src}
              alt={BOOK.cover.alt}
              tone="warm"
              aspect="3/2"
              placeholderLabel="Couverture du livre"
              className="rotate-1 shadow-2xl transition-transform duration-500 ease-[var(--ease-ol)] hover:rotate-0"
            />
          </div>

          {/* Contenu */}
          <div>
            <Eyebrow tone="orange">L’ouvrage de référence</Eyebrow>

            <Heading
              id="livre-title"
              level={2}
              className="mt-4 text-[var(--color-ol-ivory)]"
            >
              {BOOK.title}
            </Heading>
            <p className="mt-3 font-[family-name:var(--font-editorial)] text-xl text-[var(--color-ol-orange)] italic sm:text-2xl">
              {BOOK.subtitle}
            </p>

            <p className="mt-4 text-sm tracking-widest text-[var(--color-ol-ivory)]/60 uppercase">
              {BOOK.edition}
            </p>

            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-ol-ivory)]/85">
              {BOOK.pitch.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <ul
              aria-label="Publics cibles du livre"
              className="mt-8 flex flex-wrap gap-2"
            >
              {BOOK.audiences.map((audience) => (
                <li key={audience}>
                  <Badge tone="neutral">{audience}</Badge>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                as="a"
                href={BOOK.purchaseHref}
                variant="primary"
                size="lg"
              >
                <BookOpen width={20} height={20} aria-hidden />
                Acheter le livre
              </Button>
              <Button
                as="a"
                href={BOOK.extractHref}
                variant="ghost"
                size="lg"
                className="border border-[var(--color-ol-ivory)]/20 text-[var(--color-ol-ivory)] hover:bg-[var(--color-ol-ivory)]/10 hover:text-[var(--color-ol-ivory)]"
              >
                <Download width={20} height={20} aria-hidden />
                Lire un extrait gratuit
              </Button>
              <Link
                href={BOOK.conferenceHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-orange)] transition-colors hover:text-[var(--color-ol-orange-light)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ol-night)] sm:ml-2"
              >
                Réserver une conférence
                <ArrowRight width={16} height={16} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
