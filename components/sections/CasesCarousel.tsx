'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { Mockup } from '@/components/atoms/Mockup';
import { AgrosenseMockup } from '@/components/mockups/AgrosenseMockup';
import { FraudShieldMockup } from '@/components/mockups/FraudShieldMockup';
import { NexusRhMockup } from '@/components/mockups/NexusRhMockup';
import { SygescomMockup } from '@/components/mockups/SygescomMockup';
import {
  FALLBACK_CASE_STUDIES,
  type CaseStudy,
  type ProductSlug,
} from '@/lib/case-studies';

const AUTOPLAY_MS = 7000;

/**
 * Map productSlug → mockup SVG par défaut. Utilisé quand la collection
 * Payload ne fournit pas d'image téléversée pour ce slide.
 *
 * Quand un nouveau produit reçoit son propre mockup SVG, l'ajouter ici.
 * Pour les produits sans mockup encore créé, on retombe sur SygescomMockup
 * comme placeholder visuel le plus polyvalent (à remplacer ASAP par un
 * SVG dédié).
 */
const DEFAULT_MOCKUPS: Record<ProductSlug, ReactElement> = {
  nexusrh: <NexusRhMockup />,
  sygescom: <SygescomMockup />,
  agrosense: <AgrosenseMockup />,
  'fraud-shield': <FraudShieldMockup />,
  // À enrichir : ces 3 retombent sur un mockup générique en attendant.
  nexuserp: <NexusRhMockup />,
  qualitos: <SygescomMockup />,
  'smart-city': <SygescomMockup />,
};

export interface CasesCarouselProps {
  /** Slides à afficher. Si omis, utilise le fallback hard-codé. */
  slides?: readonly CaseStudy[];
}

/**
 * CasesCarousel — §6.5 enrichi. Carrousel à N cas clients (4 par défaut).
 * Auto-rotation 7 s, pause au survol, contrôles manuels (← → + dots
 * + pause). Animations Motion v12 (AnimatePresence).
 *
 * Données : la liste `slides` est passée en prop par le Server Component
 * parent (cf. `CasesCarouselServer.tsx`) qui interroge Payload puis
 * retombe sur `FALLBACK_CASE_STUDIES` si la DB est indisponible. Ce
 * composant lui-même reste 100 % client, sérialisable, et reçoit des
 * données plates (pas de React node embarqué).
 *
 * Pour chaque slide :
 *   - Si `imageUrl` est fourni (upload admin Payload) → on l'affiche
 *     via `<Mockup src=...>` (next/image, optimisé AVIF/WebP MinIO).
 *   - Sinon → on retombe sur le SVG `DEFAULT_MOCKUPS[productSlug]`.
 *
 * A11y / SEO :
 *   - role="region" aria-roledescription="carousel"
 *   - Tous les contrôles sont labellisés
 *   - Auto-play désactivé si prefers-reduced-motion
 *   - Texte de chaque slide indexable (rendu DOM, juste opacifié hors slide actif)
 */
export function CasesCarousel({
  slides = FALLBACK_CASE_STUDIES,
}: CasesCarouselProps = {}): ReactElement {
  const prefersReduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total],
  );

  useEffect(() => {
    if (prefersReduced || paused || total <= 1) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [next, paused, prefersReduced, total]);

  const slide = slides[index]!;

  return (
    <section
      aria-labelledby="cas-clients-carousel-title"
      aria-roledescription="carousel"
      data-testid="cases-carousel"
      className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Container width="wide">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Eyebrow tone="orange">Cas clients</Eyebrow>
            <Heading id="cas-clients-carousel-title" level={2} className="mt-4">
              Ce que ça donne{' '}
              <span className="text-[var(--color-ol-orange)]">
                sur le terrain
              </span>
              .
            </Heading>
          </div>
          <p className="max-w-md text-sm text-[var(--color-ol-graphite)]/65">
            Quatre déploiements, quatre secteurs. Chiffres sourcés, aucun
            chiffre rond inventé.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
          {/* Texte du slide */}
          <div className="relative min-h-[360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReduced ? undefined : { opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="orange">{slide.sector}</Badge>
                  <span className="text-sm text-[var(--color-ol-graphite)]/60">
                    {slide.client}
                  </span>
                </div>

                <Heading level={3} className="text-3xl sm:text-4xl">
                  {slide.headline}
                </Heading>

                <p className="font-[family-name:var(--font-editorial)] text-xl text-[var(--color-ol-orange)] italic">
                  {slide.punchline}
                </p>

                <p className="text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
                  {slide.body}
                </p>

                <ul className="mt-2 grid grid-cols-3 gap-4 border-t border-[var(--color-ol-mist)] pt-6">
                  {slide.results.map((r) => (
                    <li key={r.label}>
                      <span className="block font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ol-orange)] sm:text-3xl">
                        {r.value}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--color-ol-graphite)]/65">
                        {r.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={slide.href}
                  className="mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--color-ol-orange)] transition-colors hover:text-[var(--color-ol-orange-dark)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                >
                  Voir le produit complet
                  <ArrowRight width={14} height={14} aria-hidden />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mockup visuel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mockup-${slide.id}`}
                initial={prefersReduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReduced ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Mockup
                  variant="dashboard"
                  label={slide.client}
                  tone="dark"
                  aspect="16/9"
                  src={slide.imageUrl}
                  alt={slide.imageAlt ?? slide.client}
                >
                  {DEFAULT_MOCKUPS[slide.productSlug]}
                </Mockup>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Contrôles */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--color-ol-mist)] pt-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Cas précédent"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-ol-mist)] bg-white text-[var(--color-ol-night)] transition-colors hover:border-[var(--color-ol-orange)] hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
            >
              <ArrowLeft width={18} height={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Cas suivant"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-ol-mist)] bg-white text-[var(--color-ol-night)] transition-colors hover:border-[var(--color-ol-orange)] hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
            >
              <ArrowRight width={18} height={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Reprendre la rotation' : 'Mettre en pause'}
              className="ml-2 inline-flex h-11 items-center gap-2 rounded-full border border-[var(--color-ol-mist)] bg-white px-4 text-sm font-medium text-[var(--color-ol-graphite)] transition-colors hover:border-[var(--color-ol-orange)] hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
            >
              {paused ? (
                <Play width={14} height={14} aria-hidden />
              ) : (
                <Pause width={14} height={14} aria-hidden />
              )}
              {paused ? 'Lecture' : 'Pause'}
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-2" role="tablist">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Aller au cas ${i + 1} : ${s.client}`}
                onClick={() => setIndex(i)}
                className={
                  i === index
                    ? 'h-2 w-8 rounded-full bg-[var(--color-ol-orange)] transition-all'
                    : 'h-2 w-2 rounded-full bg-[var(--color-ol-graphite)]/25 transition-all hover:bg-[var(--color-ol-graphite)]/50'
                }
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
