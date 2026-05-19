import type { HTMLAttributes, ReactElement } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'li' | 'section';
  /** Active les styles d'interaction (hover/lift/shadow). À combiner
   *  avec un wrapper `<Link>` ou un onClick côté parent. */
  interactive?: boolean;
}

const base =
  'rounded-lg border border-[var(--color-ol-mist)] bg-white p-6 sm:p-8';
const interactiveBase =
  'transition-all duration-200 ease-[var(--ease-ol)] hover:-translate-y-0.5 hover:border-[var(--color-ol-orange)]/40 hover:shadow-lg';

export function Card({
  as: Tag = 'div',
  interactive = false,
  className,
  children,
  ...rest
}: CardProps): ReactElement {
  return (
    <Tag
      className={cn(base, interactive && interactiveBase, className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
