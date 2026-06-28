import type { ReactElement } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface MediaPlaceholderProps {
  /** URL de l'asset (provenant de Payload/MinIO en P6). `null`/`undefined`
   *  rend le placeholder visuel. */
  src?: string | null;
  /** Texte alt — toujours fourni, y compris pour le placeholder, pour
   *  que l'éditeur Payload puisse pré-saisir l'alt avant de charger
   *  l'image. */
  alt: string;
  /** Label visible sur le placeholder (ex : « Capture avant »). */
  placeholderLabel?: string;
  /** Tonalité visuelle du placeholder. `cold` (gris-bleu) pour des
   *  états "avant", `warm` (orange tinté) pour des états "après". */
  tone?: 'cold' | 'warm' | 'neutral';
  /** Ratio largeur/hauteur, ex `16/9`, `4/3`, `1/1`. Défaut `4/3`. */
  aspect?: '16/9' | '4/3' | '1/1' | '3/2';
  /** Attribut `sizes` de next/image (perf LCP / Core Web Vitals). Sans lui,
   *  une image `fill` télécharge la plus grande variante (≈100vw). À régler
   *  selon la largeur réelle d'affichage (ex grille 3 cols : "(min-width:
   *  768px) 33vw, 100vw"). Défaut `100vw`. */
  sizes?: string;
  /** Marque l'image comme prioritaire (next/image `priority`) : précharge +
   *  désactive le lazy-load. À réserver à l'image LCP au-dessus de la ligne
   *  de flottaison (une seule par page). */
  priority?: boolean;
  className?: string;
}

const toneMap: Record<NonNullable<MediaPlaceholderProps['tone']>, string> = {
  cold: 'bg-gradient-to-br from-[var(--color-ol-mist)] via-[var(--color-ol-graphite)]/10 to-[var(--color-ol-navy-soft)]/20 text-[var(--color-ol-graphite)]/70',
  warm: 'bg-gradient-to-br from-[var(--color-ol-orange)]/15 via-[var(--color-ol-orange)]/8 to-[var(--color-ol-night)]/20 text-[var(--color-ol-orange-dark)]',
  neutral:
    'bg-gradient-to-br from-[var(--color-ol-mist)] to-[var(--color-ol-ivory)] text-[var(--color-ol-graphite)]/70',
};

const aspectMap: Record<
  NonNullable<MediaPlaceholderProps['aspect']>,
  string
> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '3/2': 'aspect-[3/2]',
};

/**
 * MediaPlaceholder — slot d'image alimenté par Payload en P6.
 *
 * - Tant que `src` est null, on rend un placeholder typé (avant/après)
 *   avec icône + label optionnel.
 * - Dès que Payload fournira l'URL MinIO (avec versions AVIF/WebP),
 *   on basculera sur `next/image` automatiquement.
 *
 * Voir docs/CLAUDE.md §9 (admin Payload) et memory project_openlabconsulting_cms_media.
 */
export function MediaPlaceholder({
  src,
  alt,
  placeholderLabel,
  tone = 'neutral',
  aspect = '4/3',
  sizes = '100vw',
  priority = false,
  className,
}: MediaPlaceholderProps): ReactElement {
  if (src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-[var(--color-ol-mist)] bg-white',
          aspectMap[aspect],
          className,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${alt}, capture à venir`}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border border-dashed border-[var(--color-ol-graphite)]/15',
        aspectMap[aspect],
        toneMap[tone],
        className,
      )}
    >
      <ImageIcon width={32} height={32} aria-hidden />
      {placeholderLabel ? (
        <span className="text-xs font-medium tracking-widest uppercase">
          {placeholderLabel}
        </span>
      ) : null}
    </div>
  );
}
