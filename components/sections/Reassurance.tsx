import type { ReactElement } from 'react';
import Image from 'next/image';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Marquee } from '@/components/atoms/Marquee';

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
 * Depuis P2 polish-v1 : marquee continu (Motion v12) au lieu d'un
 * wrap statique. Plus dynamique, signature visuelle. La liste est
 * dupliquée DOM pour SEO (les noms restent indexables, plus une
 * fois pour la boucle infinie).
 *
 * Règles respectées :
 * - Pas de stock photo : SVG vectoriels self-hosted dans /public/logos
 * - Orange < 15 % : aucun orange ici, contraste assuré par typo
 * - Mobile-first : marquee responsive
 * - A11y : noms en alt, prefers-reduced-motion → marquee gelée
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

        <div className="mt-10">
          <Marquee speed={28} pauseOnHover>
            {/* Liste indexable des logos clients (rendue dans une <ul>
                à plat pour le SEO ; le Marquee la duplique pour la boucle). */}
            <ul
              data-testid="reassurance-logos"
              className="flex items-center gap-x-12 sm:gap-x-16"
            >
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
                    className="h-8 w-auto sm:h-10"
                  />
                </li>
              ))}
            </ul>
          </Marquee>
        </div>
      </Container>
    </section>
  );
}
