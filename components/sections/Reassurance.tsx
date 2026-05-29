import type { ReactElement } from 'react';
import Image from 'next/image';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Marquee } from '@/components/atoms/Marquee';
import {
  REASSURANCE_FALLBACK,
  type ReassuranceContent,
} from '@/lib/cms/site-settings';

interface ReassuranceProps {
  /** Contenu CMS (global `reassurance-settings`). Fallback si omis. */
  content?: ReassuranceContent;
}

/**
 * Reassurance — Section 2 de la homepage (CLAUDE.md §6.2).
 *
 * Bande sobre juste après le Hero. Preuve sociale immédiate (« qui leur
 * fait déjà confiance ? ») sans étourdir le visiteur.
 *
 * Clean architecture : composant purement présentationnel. Le contenu
 * (libellé + logos partenaires) est piloté depuis l'admin Payload via le
 * global `reassurance-settings`, fetché par `getReassuranceContent()` et
 * passé en prop. Sans contenu, on retombe sur `REASSURANCE_FALLBACK`.
 *
 * Règles respectées :
 * - Pas de stock photo : logos clients réels self-hosted (ou uploadés admin)
 * - Orange < 15 % : aucun orange ici, contraste assuré par typo
 * - Mobile-first : marquee responsive
 * - A11y : noms en alt, prefers-reduced-motion → marquee gelée
 */
export function Reassurance({ content }: ReassuranceProps): ReactElement {
  const { eyebrow, partners } = content ?? REASSURANCE_FALLBACK;

  return (
    <section
      aria-label="Clients et partenaires"
      data-testid="reassurance"
      className="border-y border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] py-12 sm:py-16"
    >
      <Container width="wide">
        <Eyebrow tone="graphite" className="text-center">
          {eyebrow}
        </Eyebrow>

        <div className="mt-10">
          <Marquee speed={28} pauseOnHover>
            {/* Liste indexable des logos clients (rendue dans une <ul>
                à plat pour le SEO ; le Marquee la duplique pour la boucle). */}
            <ul
              data-testid="reassurance-logos"
              className="flex items-center gap-x-12 sm:gap-x-16"
            >
              {partners.map((partner) => (
                <li
                  key={partner.name}
                  className="opacity-80 transition-opacity duration-300 hover:opacity-100"
                >
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    width={partner.width}
                    height={partner.height}
                    priority={false}
                    unoptimized
                    className="h-9 w-auto sm:h-11"
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
