import type { ReactElement } from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';

/**
 * Hero — Section 1 de la homepage (CLAUDE.md §6).
 *
 * P2 — feat/p2-hero-layout : texte + dégradé signature + CTAs.
 * P2 — feat/p2-hero-canvas (à venir) : canvas WebGL léger en overlay.
 *
 * Règles respectées :
 * - Orange < 15 % de la surface (utilisé en accent uniquement)
 * - Police display sur le titre (Bricolage Grotesque)
 * - Contraste WCAG AAA (texte ivoire sur fond night)
 * - Above-the-fold : eyebrow + headline + sub + CTA primaire + CTA secondaire
 * - Touch targets ≥ 44 px (Button size="lg" = min-h-12)
 */
export function Hero(): ReactElement {
  return (
    <section
      aria-labelledby="hero-title"
      data-testid="hero"
      className="relative isolate overflow-hidden bg-[var(--color-ol-night)] text-[var(--color-ol-ivory)]"
    >
      {/* Dégradé signature §3.1 ol-gradient-hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,90,0,0.18) 0%, rgba(194,24,91,0.14) 35%, rgba(10,14,26,1) 70%)',
        }}
      />
      {/* Lueur orange ancrée bas-gauche pour ancrer l'identité */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 -z-10 h-[480px] w-[480px] rounded-full"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,90,0,0.22), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <Container
        width="wide"
        className="relative flex min-h-[90vh] flex-col justify-center py-24 sm:py-32"
      >
        <Eyebrow tone="orange">L’écosystème OpenLab</Eyebrow>

        <Heading
          id="hero-title"
          level={1}
          className="mt-6 max-w-4xl text-[var(--color-ol-ivory)]"
        >
          L’IA, au service{' '}
          <span className="text-[var(--color-ol-orange)]">
            des réalités africaines.
          </span>
        </Heading>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--color-ol-ivory)]/80 sm:text-xl">
          Cabinet ivoirien d’IA appliquée, R&amp;D produit et publication de
          référence pour l’Afrique francophone. Conseil, intégration, sept
          logiciels propriétaires et un livre de référence — sous le même toit.
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <Button as="a" href="/audit-ia" variant="primary" size="lg">
            Demander un audit IA gratuit
            <ArrowRight aria-hidden size={20} />
          </Button>
          <Button
            as="a"
            href="/solutions"
            variant="ghost"
            size="lg"
            className="border border-[var(--color-ol-ivory)]/20 text-[var(--color-ol-ivory)] hover:bg-[var(--color-ol-ivory)]/10 hover:text-[var(--color-ol-ivory)]"
          >
            Découvrir l’écosystème produits
          </Button>
        </div>

        <p className="mt-16 flex items-center gap-3 text-xs tracking-widest text-[var(--color-ol-ivory)]/50 uppercase">
          <span
            aria-hidden
            className="block h-px w-12 bg-[var(--color-ol-ivory)]/30"
          />
          Faites défiler pour explorer
          <ArrowDown aria-hidden size={16} />
        </p>
      </Container>
    </section>
  );
}
