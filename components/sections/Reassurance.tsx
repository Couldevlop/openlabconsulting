import type { ReactElement } from 'react';
import Image from 'next/image';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';

interface ClientLogo {
  /** Slug (= nom de fichier sans extension dans /public/logos). */
  slug: 'sido' | 'hci' | 'sertemef' | 'doci';
  /** Nom de marque tel que prononcé (utilisé comme alt + visible). */
  name: string;
  /** Ratio approximatif pour next/image — viewBox du SVG. */
  width: number;
}

const CLIENTS: readonly ClientLogo[] = [
  { slug: 'sido', name: 'SIDO', width: 140 },
  { slug: 'hci', name: 'HCI', width: 140 },
  { slug: 'sertemef', name: 'Sertemef', width: 180 },
  { slug: 'doci', name: 'DOCI', width: 140 },
] as const;

/**
 * Reassurance — Section 2 de la homepage (CLAUDE.md §6).
 *
 * Bande sobre juste après le Hero. Sert de preuve sociale immédiate
 * (« qui leur fait déjà confiance ? ») sans étourdir le visiteur.
 *
 * Règles respectées :
 * - Pas de stock photo : SVG vectoriels self-hosted dans /public/logos
 * - Orange < 15 % : aucun orange ici, contraste assuré par typo
 * - Mobile-first : wrap des logos, touch targets non interactifs OK
 * - A11y : <ul> + alt sur chaque logo, eyebrow sert d'intro
 */
export function Reassurance(): ReactElement {
  return (
    <section
      aria-label="Clients et partenaires"
      data-testid="reassurance"
      className="border-y border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] py-12 sm:py-16"
    >
      <Container width="wide">
        <Eyebrow tone="graphite" className="text-center">
          Ils nous accompagnent depuis le terrain
        </Eyebrow>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:mt-10 sm:gap-x-16">
          {CLIENTS.map((client) => (
            <li
              key={client.slug}
              className="text-[var(--color-ol-graphite)]/55 transition-colors duration-300 hover:text-[var(--color-ol-graphite)]"
            >
              <Image
                src={`/logos/${client.slug}.svg`}
                alt={client.name}
                width={client.width}
                height={40}
                priority={false}
                unoptimized
                className="h-7 w-auto sm:h-9"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
