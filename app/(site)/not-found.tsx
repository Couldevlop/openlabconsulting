import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Compass } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';

export const metadata: Metadata = {
  title: 'Page introuvable',
  description:
    "La page demandée n'existe pas ou plus. Explorez nos expertises, produits et publications IA pour l'Afrique francophone.",
  robots: { index: false, follow: true },
};

interface Suggestion {
  href: string;
  badge: string;
  title: string;
  body: string;
}

const SUGGESTIONS: readonly Suggestion[] = [
  {
    href: '/solutions',
    badge: 'Produits',
    title: 'Découvrir l’écosystème OpenLab',
    body: 'NexusRH CI, NexusERP, SYGESCOM, AgroSense, QualitOS, Fraud Shield, Smart City.',
  },
  {
    href: '/livre',
    badge: 'Édition',
    title: 'Le livre IA & Agents Autonomes',
    body: 'Onze chapitres pour comprendre l’IA appliquée en Afrique francophone.',
  },
  {
    href: '/audit-ia',
    badge: 'Diagnostic',
    title: 'Demander un audit IA gratuit',
    body: '30 minutes avec un consultant senior pour cartographier vos cas d’usage.',
  },
];

/**
 * Page 404 — gérée par Next via `not-found.tsx` à la racine `app/`.
 *
 * Choix éditorial :
 *   - Pas de message d'erreur froid : une « boussole » qui propose 3 voies
 *   - Logo ASCII OpenLab discret en bas (easter egg pour les dev curieux)
 *   - CTA explicite vers les pages les plus utiles
 *   - `noindex` mais `follow` pour que Google suive les liens
 */
export default function NotFoundPage(): React.ReactElement {
  return (
    <main id="main">
      <section
        aria-labelledby="not-found-title"
        className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
      >
        {/* Halo orange en arrière-plan */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 -z-10 h-[600px] w-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,90,0,0.18), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <Container width="wide">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-ivory)]/65 transition-colors hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ol-night)]"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Retour à l’accueil
          </Link>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-ol-orange)]/15 text-[var(--color-ol-orange)]"
                >
                  <Compass width={26} height={26} aria-hidden />
                </span>
                <Eyebrow tone="orange">Erreur 404</Eyebrow>
              </div>

              <Heading
                id="not-found-title"
                level={1}
                className="mt-6 text-[var(--color-ol-ivory)]"
              >
                Ici, c’est{' '}
                <span className="text-[var(--color-ol-orange)]">
                  le bout du chemin
                </span>
                .
              </Heading>

              <p className="mt-6 font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-ivory)]/80 italic">
                Mais une boussole se trouve toujours. Voici trois directions qui
                ramènent à l’essentiel.
              </p>

              <p className="mt-6 text-base text-[var(--color-ol-ivory)]/65">
                Le lien que vous suivez a peut-être changé, ou la page que vous
                cherchez n’existe pas encore. Pas de panique — l’IA souveraine
                se construit aussi par essais.
              </p>
            </div>

            {/* Logo ASCII discret — easter egg dev */}
            <pre
              aria-hidden
              className="hidden font-mono text-xs leading-tight text-[var(--color-ol-orange)]/30 select-none lg:block"
            >
              {`
   ██████╗ ██████╗ ███████╗███╗   ██╗
  ██╔═══██╗██╔══██╗██╔════╝████╗  ██║
  ██║   ██║██████╔╝█████╗  ██╔██╗ ██║
  ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║
  ╚██████╔╝██║     ███████╗██║ ╚████║
   ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝
        ██╗      █████╗ ██████╗
        ██║     ██╔══██╗██╔══██╗
        ██║     ███████║██████╔╝
        ██║     ██╔══██║██╔══██╗
        ███████╗██║  ██║██████╔╝
        ╚══════╝╚═╝  ╚═╝╚═════╝
              `}
            </pre>
          </div>
        </Container>
      </section>

      {/* Suggestions — 3 voies vers les pages utiles */}
      <section aria-label="Suggestions" className="bg-white py-20 sm:py-28">
        <Container width="wide">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow tone="orange">Trois voies</Eyebrow>
            <Heading level={2} className="mt-4">
              Où voulez-vous aller ?
            </Heading>
          </div>

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {SUGGESTIONS.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="group block h-full rounded-xl border border-[var(--color-ol-mist)] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--color-ol-orange)]/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(255,90,0,0.08)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2 sm:p-8"
                >
                  <Badge tone="orange">{s.badge}</Badge>
                  <Heading level={3} visualLevel={4} className="mt-4">
                    {s.title}
                  </Heading>
                  <p className="mt-3 text-[var(--color-ol-graphite)]/75">
                    {s.body}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-orange)] transition-transform group-hover:translate-x-0.5">
                    Continuer
                    <ArrowUpRight width={14} height={14} aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button as="a" href="/" variant="primary" size="md">
              Page d’accueil
            </Button>
            <Button as="a" href="/contact" variant="ghost" size="md">
              Nous écrire
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
