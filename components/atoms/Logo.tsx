import type { ReactElement, SVGProps } from 'react';
import { cn } from '@/lib/cn';

interface LogoProps extends SVGProps<SVGSVGElement> {
  /** Texte du logo affiché à côté du mark (omettre pour version mark-only). */
  withWordmark?: boolean;
  /** Forçage de la couleur du wordmark — sinon hérite via currentColor. */
  className?: string;
}

/**
 * Logo OpenLab — variante temporaire pour P1.
 * Le SVG définitif (3 variantes dark/light/mark, exigé §3.4) sera fourni
 * par le design ; on garde une forme propre qui n'est pas une stock photo.
 */
export function Logo({
  withWordmark = true,
  className,
  ...rest
}: LogoProps): ReactElement {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 40 40"
        width={32}
        height={32}
        role="img"
        aria-label="Logo OpenLab Consulting"
        {...rest}
      >
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="var(--color-ol-orange)"
          strokeWidth="3"
        />
        <circle cx="20" cy="20" r="4" fill="var(--color-ol-orange)" />
      </svg>
      {withWordmark ? (
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          OpenLab<span className="text-[var(--color-ol-orange)]">.</span>
        </span>
      ) : null}
    </span>
  );
}
