import type { HTMLAttributes, ReactElement } from 'react';
import { cn } from '@/lib/cn';

type HeadingLevel = 1 | 2 | 3 | 4;

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  /** Si différent du niveau sémantique, n'affecte que la taille visuelle. */
  visualLevel?: HeadingLevel;
}

const sizeMap: Record<HeadingLevel, string> = {
  1: 'text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl',
  2: 'text-3xl leading-tight font-semibold sm:text-4xl',
  3: 'text-2xl leading-snug font-semibold sm:text-3xl',
  4: 'text-xl leading-snug font-semibold sm:text-2xl',
};

export function Heading({
  level,
  visualLevel,
  className,
  children,
  ...rest
}: HeadingProps): ReactElement {
  const Tag = `h${level}` as const satisfies `h${HeadingLevel}`;
  const size = sizeMap[visualLevel ?? level];
  return (
    <Tag
      className={cn(
        'font-[family-name:var(--font-display)] text-[var(--color-ol-night)]',
        size,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
