import type { HTMLAttributes, ReactElement } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'production' | 'pilot' | 'mvp' | 'dev' | 'neutral' | 'orange';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneMap: Record<BadgeTone, string> = {
  production:
    'bg-[var(--color-ol-success)]/12 text-[var(--color-ol-success)] ring-[var(--color-ol-success)]/30',
  pilot:
    'bg-[var(--color-ol-info)]/12 text-[var(--color-ol-info)] ring-[var(--color-ol-info)]/30',
  mvp: 'bg-[var(--color-ol-orange)]/12 text-[var(--color-ol-orange-dark)] ring-[var(--color-ol-orange)]/30',
  dev: 'bg-[var(--color-ol-graphite)]/8 text-[var(--color-ol-graphite)]/75 ring-[var(--color-ol-graphite)]/20',
  neutral:
    'bg-[var(--color-ol-mist)] text-[var(--color-ol-graphite)] ring-[var(--color-ol-graphite)]/15',
  orange:
    'bg-[var(--color-ol-orange)]/15 text-[var(--color-ol-orange-dark)] ring-[var(--color-ol-orange)]/40',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
  ...rest
}: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneMap[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
