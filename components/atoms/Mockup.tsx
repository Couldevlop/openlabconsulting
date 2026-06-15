import type { ReactElement, ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

interface MockupProps {
  /** Variant de chrome de la fenêtre. */
  variant?: 'browser' | 'app' | 'dashboard';
  /** Titre affiché dans la barre du chrome. */
  label?: string;
  /** Ratio de l'écran. */
  aspect?: '16/9' | '4/3' | '3/2';
  /** Tonalité visuelle. Détermine la couleur de fond et l'accent. */
  tone?: 'dark' | 'light' | 'orange';
  /** Si src est fourni → bascule sur next/image (admin Payload P6).
   *  Sinon → on rend `children` comme contenu illustratif. */
  src?: string | null;
  alt?: string;
  /** Attribut `sizes` de next/image quand `src` est fourni (perf LCP). Défaut
   *  `100vw` ; à régler selon la largeur d'affichage réelle. */
  sizes?: string;
  /** next/image `priority` (précharge l'image LCP au-dessus de la ligne de
   *  flottaison). À réserver au hero. */
  priority?: boolean;
  children?: ReactNode;
  className?: string;
}

const aspectMap = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
} as const;

const toneMap = {
  dark: 'bg-[var(--color-ol-night)] text-[var(--color-ol-ivory)]',
  light: 'bg-white text-[var(--color-ol-night)]',
  orange:
    'bg-gradient-to-br from-[var(--color-ol-night)] to-[var(--color-ol-navy-soft)] text-[var(--color-ol-ivory)]',
} as const;

/**
 * Mockup — cadre de fenêtre stylisé (browser / app / dashboard) qui
 * abrite soit une vraie image (uploadée via Payload admin) soit un
 * contenu illustratif custom (`children`) — typiquement un dashboard
 * SVG simulé.
 *
 * Cf. memory project_openlabconsulting_cms_media : les images réelles
 * sont managées par l'admin Payload P6 ; en attendant, les fallback
 * SVG/HTML custom apportent une signature originale, ni stock photo
 * ni image AI.
 */
export function Mockup({
  variant = 'browser',
  label,
  aspect = '16/9',
  tone = 'dark',
  src,
  alt,
  sizes = '100vw',
  priority = false,
  children,
  className,
}: MockupProps): ReactElement {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--color-ol-mist)] bg-white shadow-2xl ring-1 ring-black/5',
        className,
      )}
    >
      {/* Chrome de la fenêtre */}
      <div className="flex items-center gap-3 border-b border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="block h-3 w-3 rounded-full bg-[var(--color-ol-danger)]/60" />
          <span className="block h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="block h-3 w-3 rounded-full bg-[var(--color-ol-success)]/60" />
        </div>
        {variant === 'browser' ? (
          <div className="flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-[var(--color-ol-graphite)]/70 ring-1 ring-[var(--color-ol-mist)]">
            {label ?? 'openlabconsulting.com'}
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2 truncate">
            <Image
              src="/OPENLAB.png"
              alt="OpenLab Consulting"
              width={612}
              height={408}
              priority={false}
              className="h-5 w-auto object-contain"
            />
            <span className="text-[var(--color-ol-graphite)]/30" aria-hidden>
              ·
            </span>
            <span className="truncate text-xs font-medium text-[var(--color-ol-graphite)]/70">
              {label ?? 'OpenLab'}
            </span>
          </div>
        )}
        <span className="text-[10px] tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
          {variant}
        </span>
      </div>

      {/* Contenu */}
      <div className={cn('relative w-full', aspectMap[aspect], toneMap[tone])}>
        {src ? (
          <Image
            src={src}
            alt={alt ?? label ?? 'Capture produit'}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0">{children}</div>
        )}
      </div>
    </div>
  );
}
