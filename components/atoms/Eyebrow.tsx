import type { HTMLAttributes, ReactElement } from 'react';
import { cn } from '@/lib/cn';

interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: 'orange' | 'ivory' | 'graphite';
}

const toneMap: Record<NonNullable<EyebrowProps['tone']>, string> = {
  orange: 'text-[var(--color-ol-orange-text)]',
  ivory: 'text-[var(--color-ol-ivory)]',
  graphite: 'text-[var(--color-ol-graphite)]/70',
};

export function Eyebrow({
  tone = 'orange',
  className,
  children,
  ...rest
}: EyebrowProps): ReactElement {
  return (
    <p
      className={cn(
        'text-sm font-medium tracking-widest uppercase',
        toneMap[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}
